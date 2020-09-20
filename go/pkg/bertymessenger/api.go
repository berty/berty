package bertymessenger

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"time"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"gorm.io/gorm/clause"

	"berty.tech/berty/v2/go/internal/discordlog"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (svc *service) DevShareInstanceBertyID(ctx context.Context, req *DevShareInstanceBertyID_Request) (*DevShareInstanceBertyID_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	ret, err := svc.internalInstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{
		DisplayName: req.DisplayName,
		Reset_:      req.Reset_,
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	err = discordlog.ShareQRLink(ret.BertyID.DisplayName, discordlog.QRCodeRoom, "Add me on Berty!", ret.DeepLink, ret.HTMLURL)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &DevShareInstanceBertyID_Reply{}, nil
}

func (svc *service) InstanceShareableBertyID(ctx context.Context, req *InstanceShareableBertyID_Request) (*InstanceShareableBertyID_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()
	// need to split the function for internal calls to prevent deadlocks
	return svc.internalInstanceShareableBertyID(ctx, req)
}

func (svc *service) internalInstanceShareableBertyID(ctx context.Context, req *InstanceShareableBertyID_Request) (*InstanceShareableBertyID_Reply, error) {
	if req == nil {
		req = &InstanceShareableBertyID_Request{}
	}
	config, err := svc.protocolClient.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	svc.logger.Debug("enable contact request (may be already done)")
	_, err = svc.protocolClient.ContactRequestEnable(ctx, &bertytypes.ContactRequestEnable_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if req.Reset_ {
		svc.logger.Info("reset contact reference")
		_, err = svc.protocolClient.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	res, err := svc.protocolClient.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// if this call does not return a PublicRendezvousSeed, then we need to call Reset
	if res.PublicRendezvousSeed == nil {
		svc.logger.Info("reset contact reference")
		_, err = svc.protocolClient.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}
	res, err = svc.protocolClient.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	displayName := req.DisplayName
	if displayName == "" {
		// FIXME: get it from somewhere
		displayName = "anonymous#1337"
	}

	ret := InstanceShareableBertyID_Reply{
		BertyID: &BertyID{
			DisplayName:          displayName,
			PublicRendezvousSeed: res.PublicRendezvousSeed,
			AccountPK:            config.AccountPK,
		},
	}
	bertyIDPayloadBytes, _ := proto.Marshal(ret.BertyID)
	ret.BertyIDPayload = bytesToString(bertyIDPayloadBytes)

	// create QRCodes with standalone display_name variable
	lightID := BertyID{
		PublicRendezvousSeed: ret.BertyID.PublicRendezvousSeed,
		AccountPK:            ret.BertyID.AccountPK,
	}
	lightIDBytes, _ := proto.Marshal(&lightID)
	lightIDPayload := bytesToString(lightIDBytes)
	v := url.Values{}
	v.Set("key", url.QueryEscape(lightIDPayload)) // double-encoding to keep "+" as "+" and not as spaces
	if displayName != "" {
		v.Set("name", displayName)
	}
	fragment := v.Encode()
	ret.DeepLink = fmt.Sprintf("berty://id/#%s", fragment)
	ret.HTMLURL = fmt.Sprintf("https://berty.tech/id#%s", fragment)
	return &ret, nil
}

func (svc *service) ParseDeepLink(ctx context.Context, req *ParseDeepLink_Request) (*ParseDeepLink_Reply, error) {
	if req == nil || req.Link == "" {
		return nil, errcode.ErrMissingInput
	}

	ret := ParseDeepLink_Reply{}

	query, method, err := NormalizeDeepLinkURL(req.Link)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	switch method {
	case "/id":
		ret.Kind = ParseDeepLink_BertyID
		ret.BertyID = &BertyID{}
		key := query.Get("key")
		if key == "" {
			return nil, errcode.ErrMessengerInvalidDeepLink
		}
		payload, err := stringToBytes(key)
		if err != nil {
			return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
		}
		err = proto.Unmarshal(payload, ret.BertyID)
		if err != nil {
			return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
		}
		if len(ret.BertyID.PublicRendezvousSeed) == 0 || len(ret.BertyID.AccountPK) == 0 {
			return nil, errcode.ErrMessengerInvalidDeepLink
		}
		if name := query.Get("name"); name != "" {
			ret.BertyID.DisplayName = name
		}

	case "/group":
		return ParseGroupInviteURLQuery(query)

	default:
		return nil, errcode.ErrMessengerInvalidDeepLink
	}

	return &ret, nil
}

func NormalizeDeepLinkURL(input string) (url.Values, string, error) {
	u, err := url.Parse(input)
	if err != nil {
		return url.Values{}, "", errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}

	var method string
	qs := u.Fragment

	switch {
	case u.Scheme == "berty":
		method = "/" + u.Host
	case u.Scheme == "https" && u.Host == "berty.tech":
		method = u.Path
	}
	query, err := url.ParseQuery(qs)
	if err != nil {
		return url.Values{}, "", errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}

	return query, method, nil
}

func ParseGroupInviteURLQuery(query url.Values) (*ParseDeepLink_Reply, error) {
	ret := ParseDeepLink_Reply{}

	ret.Kind = ParseDeepLink_BertyGroup
	ret.BertyGroup = &BertyGroup{
		Group: &bertytypes.Group{},
	}

	invite := query.Get("invite")
	if invite == "" {
		return nil, errcode.ErrMessengerInvalidDeepLink
	}
	payload, err := stringToBytes(invite)
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	err = proto.Unmarshal(payload, ret.BertyGroup.Group)

	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}

	if err := ret.BertyGroup.Group.IsValid(); err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}

	if name := query.Get("name"); name != "" {
		ret.BertyGroup.DisplayName = name
	}

	return &ret, nil
}

func (svc *service) ShareableBertyGroup(ctx context.Context, request *ShareableBertyGroup_Request) (*ShareableBertyGroup_Reply, error) {
	if request == nil {
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	grpInfo, err := svc.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: request.GroupPK,
	})
	if err != nil {
		return nil, err
	}

	rep := &ShareableBertyGroup_Reply{}
	rep.BertyGroup = &BertyGroup{
		Group:       grpInfo.Group,
		DisplayName: request.GroupName,
	}

	bertyGroupPayload, err := proto.Marshal(rep.BertyGroup)
	if err != nil {
		return nil, err
	}

	rep.BertyGroupPayload = bytesToString(bertyGroupPayload)
	rep.DeepLink, rep.HTMLURL, err = ShareableBertyGroupURL(grpInfo.Group, request.GroupName)
	if err != nil {
		return nil, err
	}

	return rep, nil
}

func ShareableBertyGroupURL(g *bertytypes.Group, groupName string) (string, string, error) {
	if g.GroupType != bertytypes.GroupTypeMultiMember {
		return "", "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't share a %s group type", g.GroupType.String()))
	}

	invite, err := g.Marshal()
	if err != nil {
		return "", "", err
	}

	inviteB64 := bytesToString(invite)

	v := url.Values{}
	v.Set("invite", url.QueryEscape(inviteB64)) // double-encoding to keep "+" as "+" and not as spaces
	if groupName != "" {
		v.Set("name", groupName)
	}

	fragment := v.Encode()

	return fmt.Sprintf("berty://group/#%s", fragment), fmt.Sprintf("https://berty.tech/group#%s", fragment), nil
}

// maybe we should preserve the previous generic api
func (svc *service) SendContactRequest(ctx context.Context, req *SendContactRequest_Request) (*SendContactRequest_Reply, error) {
	if req == nil || req.BertyID == nil || req.BertyID.AccountPK == nil || req.BertyID.PublicRendezvousSeed == nil {
		return nil, errcode.ErrMissingInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	contactRequest := bertytypes.ContactRequestSend_Request{
		Contact: &bertytypes.ShareableContact{
			PK:                   req.BertyID.AccountPK,
			PublicRendezvousSeed: req.BertyID.PublicRendezvousSeed,
			Metadata:             req.Metadata,
		},
		OwnMetadata: req.OwnMetadata,
	}
	_, err := svc.protocolClient.ContactRequestSend(ctx, &contactRequest)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &SendContactRequest_Reply{}, nil
}

func (svc *service) SystemInfo(ctx context.Context, req *SystemInfo_Request) (*SystemInfo_Reply, error) {
	reply := SystemInfo_Reply{}
	var errs error

	// messenger's process
	var process *bertytypes.SystemInfo_Process
	{
		var err error
		process, err = bertyprotocol.SystemInfoProcess()
		errs = multierr.Append(errs, err)
		reply.Messenger = &SystemInfo_Messenger{Process: process}
		reply.Messenger.Process.StartedAt = svc.startedAt.Unix()
	}

	// messenger's db
	{
		var err error
		reply.Messenger.DB = &SystemInfo_DB{}
		reply.Messenger.DB.Accounts, err = dbModelRowsCount(svc.db, Account{})
		errs = multierr.Append(errs, err)
		reply.Messenger.DB.Contacts, err = dbModelRowsCount(svc.db, Contact{})
		errs = multierr.Append(errs, err)
		reply.Messenger.DB.Interactions, err = dbModelRowsCount(svc.db, Interaction{})
		errs = multierr.Append(errs, err)
		reply.Messenger.DB.Conversations, err = dbModelRowsCount(svc.db, Conversation{})
		errs = multierr.Append(errs, err)
		reply.Messenger.DB.Members, err = dbModelRowsCount(svc.db, Member{})
		errs = multierr.Append(errs, err)
		reply.Messenger.DB.Devices, err = dbModelRowsCount(svc.db, Device{})
		errs = multierr.Append(errs, err)
	}

	// protocol
	protocol, err := svc.protocolClient.SystemInfo(ctx, &bertytypes.SystemInfo_Request{})
	errs = multierr.Append(errs, err)
	reply.Protocol = protocol

	// is protocol in same process
	reply.Messenger.ProtocolInSameProcess = true &&
		(process.PID != 0 && process.PID == protocol.Process.PID) &&
		(process.PPID != 0 && process.PPID == protocol.Process.PPID) &&
		(process.HostName != "" && process.HostName == protocol.Process.HostName)

	// warns
	if errs != nil {
		reply.Messenger.Warns = []string{}
		for _, err := range multierr.Errors(errs) {
			reply.Messenger.Warns = append(reply.Messenger.Warns, err.Error())
		}
	}

	return &reply, nil
}

func (svc *service) SendAck(ctx context.Context, request *SendAck_Request) (*SendAck_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	gInfo, err := svc.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: request.GroupPK,
	})
	if err != nil {
		return nil, err
	}

	if gInfo.Group.GroupType != bertytypes.GroupTypeContact {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("only %s groups are supported", bertytypes.GroupTypeContact.String()))
	}

	am, err := AppMessage_TypeAcknowledge.MarshalPayload(0, &AppMessage_Acknowledge{
		Target: bytesToString(request.MessageID),
	})
	if err != nil {
		return nil, err
	}

	_, err = svc.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: request.GroupPK,
		Payload: am,
	})

	if err != nil {
		return nil, err
	}

	return &SendAck_Reply{}, nil
}

func (svc *service) SendMessage(ctx context.Context, request *SendMessage_Request) (*SendMessage_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	payload, err := AppMessage_TypeUserMessage.MarshalPayload(timestampMs(time.Now()), &AppMessage_UserMessage{
		Body: request.Message,
	})
	if err != nil {
		return nil, err
	}

	_, err = svc.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: request.GroupPK,
		Payload: payload,
	})

	return &SendMessage_Reply{}, err
}

func (svc *service) ConversationStream(req *ConversationStream_Request, sub MessengerService_ConversationStreamServer) error {
	// TODO: cursors

	// send existing convs
	var convs []*Conversation
	if err := svc.db.Find(&convs).Error; err != nil {
		return err
	}
	for _, c := range convs {
		if err := sub.Send(&ConversationStream_Reply{Conversation: c}); err != nil {
			return err
		}
	}

	// FIXME: case where a conversation is created/updated/deleted between the list and the stream
	// dunno how to add a test to trigger, maybe it can never happen? don't know how to prove either way

	// stream new convs
	errch := make(chan error)
	defer close(errch)
	n := NotifieeBundle{
		StreamEventImpl: func(e *StreamEvent) error {
			if e.Type == StreamEvent_TypeConversationUpdated {
				var cu StreamEvent_ConversationUpdated
				if err := proto.Unmarshal(e.GetPayload(), &cu); err != nil {
					errch <- err
				}
				if err := sub.Send(&ConversationStream_Reply{Conversation: cu.GetConversation()}); err != nil {
					errch <- err
				}
			}
			return nil
		},
	}
	unreg := svc.dispatcher.Register(&n)
	defer unreg()

	// don't return until we have a send error or the context is canceled
	select {
	case e := <-errch:
		return e
	case <-sub.Context().Done():
		return nil
	}
}

func (svc *service) EventStream(req *EventStream_Request, sub MessengerService_EventStreamServer) error {
	// TODO: cursors

	// send account
	{
		svc.logger.Debug("sending account")
		acc, err := getAccount(svc.db)
		if err != nil {
			return err
		}
		au, err := proto.Marshal(&StreamEvent_AccountUpdated{Account: &acc})
		if err != nil {
			return err
		}
		if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeAccountUpdated, au}}); err != nil {
			return err
		}
	}

	// send contacts
	{
		var contacts []Contact
		if err := svc.db.Find(&contacts).Error; err != nil {
			return err
		}
		svc.logger.Info("sending existing contacts", zap.Int("count", len(contacts)))
		for _, contact := range contacts {
			c := contact // comply with scopelint
			cu, err := proto.Marshal(&StreamEvent_ContactUpdated{&c})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeContactUpdated, cu}}); err != nil {
				return err
			}
		}
	}

	// send conversations
	{
		var convs []Conversation
		if err := svc.db.Find(&convs).Error; err != nil {
			return err
		}
		svc.logger.Debug("sending existing conversations", zap.Int("count", len(convs)))
		for _, conv := range convs {
			c := conv // comply with scopelint
			cu, err := proto.Marshal(&StreamEvent_ConversationUpdated{&c})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeConversationUpdated, cu}}); err != nil {
				return err
			}
		}
	}

	// send members
	{
		var members []Member
		if err := svc.db.Find(&members).Error; err != nil {
			return err
		}
		svc.logger.Info("sending existing members", zap.Int("count", len(members)))
		for _, member := range members {
			m := member // comply with scopelint
			mu, err := proto.Marshal(&StreamEvent_MemberUpdated{&m})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeMemberUpdated, mu}}); err != nil {
				return err
			}
		}
	}

	// send interactions
	{
		var interactions []Interaction
		if err := svc.db.Find(&interactions).Error; err != nil {
			return err
		}
		svc.logger.Info("sending existing interactions", zap.Int("count", len(interactions)))
		for _, inte := range interactions {
			i := inte // comply with scopelint
			iu, err := proto.Marshal(&StreamEvent_InteractionUpdated{&i})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeInteractionUpdated, iu}}); err != nil {
				return err
			}
		}
	}

	// signal that we're done sending existing models
	{
		p, err := proto.Marshal(&StreamEvent_ListEnd{})
		if err != nil {
			return err
		}
		if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeListEnd, p}}); err != nil {
			return err
		}
	}

	// FIXME: case where a model is created/updated/deleted between the list and the stream
	// dunno how to add a test to trigger, maybe it can never happen? don't know how to prove either way

	// stream new events
	{
		errch := make(chan error)
		defer close(errch)
		n := NotifieeBundle{StreamEventImpl: func(e *StreamEvent) error {
			svc.logger.Debug("sending stream event", zap.String("type", e.GetType().String()))
			err := sub.Send(&EventStream_Reply{Event: e})
			if err != nil {
				// next commmented line allows me to manually test the behavior on a send error. How to isolate into an automatic test?
				// errch <- errors.New("TEST ERROR")
				errch <- err
			}
			return nil
		}}
		unreg := svc.dispatcher.Register(&n)
		defer unreg()

		// don't return until we have a send error or the context is canceled
		select {
		case err := <-errch:
			return err
		case <-sub.Context().Done():
			return nil
		}
	}
}

func (svc *service) ConversationCreate(ctx context.Context, req *ConversationCreate_Request) (*ConversationCreate_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	dn := req.GetDisplayName()

	// Create a multimember group
	cr, err := svc.protocolClient.MultiMemberGroupCreate(ctx, &bertytypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return nil, err
	}
	pk := cr.GetGroupPK()
	pkStr := bytesToString(pk)
	svc.logger.Info("Created conv", zap.String("dn", req.GetDisplayName()), zap.String("pk", pkStr))

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: pk})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", pkStr))
		}
	}

	gir, err := svc.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{GroupPK: pk})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	_, htmlURL, err := ShareableBertyGroupURL(gir.GetGroup(), req.GetDisplayName())
	if err != nil {
		return nil, err
	}

	// Create new conversation
	conv := &Conversation{
		AccountMemberPublicKey: bytesToString(gir.GetMemberPK()),
		PublicKey:              pkStr,
		DisplayName:            dn,
		Link:                   htmlURL,
		Type:                   Conversation_MultiMemberType,
		LocalDevicePublicKey:   bytesToString(gir.GetDevicePK()),
		CreatedDate:            timestampMs(time.Now()),
	}

	// Update database
	{
		err = svc.db.
			Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "public_key"}},
				DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
			}).
			Create(&conv).
			Error
		if err != nil {
			return nil, err
		}
	}

	// Dispatch new conversation
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conv})
		if err != nil {
			svc.logger.Error("failed to dispatch ConversationUpdated event", zap.Error(err))
		}
	}

	// Try to put group name in group metadata
	{
		err := func() error {
			am, err := AppMessage_TypeSetGroupName.MarshalPayload(0, &AppMessage_SetGroupName{Name: dn})
			if err != nil {
				return err
			}

			_, err = svc.protocolClient.AppMetadataSend(ctx, &bertytypes.AppMetadataSend_Request{GroupPK: pk, Payload: am})
			return err
		}()
		if err != nil {
			svc.logger.Error("failed to set group name", zap.Error(err))
		}
	}

	/* There is a tradoff between privacy and log size here, we could send the user name as a message but it would require
	** to re-add the name to the log everytime a new user arrives in the conversation which is bad for large public groups
	** It would make sense to offer it as an option for privacy sensitive groups of small sizes though
	** In the case that the group invitation leaks after an user leaves it, this user's name will be inaccessible to new users joining the group
	 */

	// Try to put user name 3 times in group metadata
	// FIXME: only do it once, once replication is ok
	{
		for i := 0; i < 3; i++ {
			err := func() error {
				acc, err := getAccount(svc.db)
				if err != nil {
					return err
				}

				am, err := AppMessage_TypeSetUserName.MarshalPayload(0, &AppMessage_SetUserName{Name: acc.GetDisplayName()})
				if err != nil {
					return err
				}

				_, err = svc.protocolClient.AppMetadataSend(ctx, &bertytypes.AppMetadataSend_Request{GroupPK: pk, Payload: am})
				return err
			}()
			if err != nil {
				svc.logger.Error("failed to set creator username in group", zap.Error(err))
			}
		}
	}

	for _, contactPK := range req.GetContactsToInvite() {
		am, err := AppMessage_TypeGroupInvitation.MarshalPayload(timestampMs(time.Now()), &AppMessage_GroupInvitation{Link: conv.GetLink()})
		if err != nil {
			return nil, err
		}
		cpkb, err := stringToBytes(contactPK)
		if err != nil {
			return nil, err
		}
		ginfo, err := svc.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{ContactPK: cpkb})
		if err != nil {
			return nil, err
		}
		_, err = svc.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{GroupPK: ginfo.GetGroup().GetPublicKey(), Payload: am})
		if err != nil {
			return nil, err
		}
	}

	rep := ConversationCreate_Reply{PublicKey: pkStr}
	return &rep, nil
}

func (svc *service) ConversationJoin(ctx context.Context, req *ConversationJoin_Request) (*ConversationJoin_Reply, error) {
	link := req.GetLink()
	if link == "" {
		return nil, errcode.ErrMissingInput
	}

	query, method, err := NormalizeDeepLinkURL(req.Link)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	var pdlr *ParseDeepLink_Reply
	switch method {
	case "/group":
		pdlr, err = ParseGroupInviteURLQuery(query)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}
	default:
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	bgroup := pdlr.GetBertyGroup()
	gpkb := bgroup.GetGroup().GetPublicKey()

	mmgjReq := &bertytypes.MultiMemberGroupJoin_Request{Group: pdlr.GetBertyGroup().GetGroup()}
	if _, err := svc.protocolClient.MultiMemberGroupJoin(ctx, mmgjReq); err != nil {
		// Rollback db ?
		return nil, errcode.TODO.Wrap(err)
	}

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(gpkb)))
		}
	}

	gir, err := svc.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	conv := Conversation{
		AccountMemberPublicKey: bytesToString(gir.GetMemberPK()),
		PublicKey:              bytesToString(gpkb),
		DisplayName:            bgroup.GetDisplayName(),
		Link:                   link,
		Type:                   Conversation_MultiMemberType,
		LocalDevicePublicKey:   bytesToString(gir.GetDevicePK()),
		CreatedDate:            timestampMs(time.Now()),
	}

	// update db
	{
		// Maybe turn this into a svc.updateConversation helper
		cl := clause.OnConflict{ // Maybe DoNothing ?
			Columns:   []clause.Column{{Name: "public_key"}},
			DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
		}
		if err = svc.db.Clauses(cl).Create(&conv).Error; err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	// dispatch event
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{Conversation: &conv})
		if err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	// Try to put user name in group metadata 3 times
	{
		for i := 0; i < 3; i++ {
			err := func() error {
				acc, err := getAccount(svc.db)
				if err != nil {
					return err
				}

				am, err := AppMessage_TypeSetUserName.MarshalPayload(0, &AppMessage_SetUserName{Name: acc.GetDisplayName()})
				if err != nil {
					return err
				}

				_, err = svc.protocolClient.AppMetadataSend(ctx, &bertytypes.AppMetadataSend_Request{GroupPK: gpkb, Payload: am})
				return err
			}()
			if err != nil {
				svc.logger.Error("failed to set username in group", zap.Error(err))
			}
		}
	}

	return &ConversationJoin_Reply{}, nil
}

func (svc *service) AccountUpdate(ctx context.Context, req *AccountUpdate_Request) (*AccountUpdate_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	acc, err := getAccount(svc.db)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	updated := false

	dn := req.GetDisplayName()
	svc.logger.Debug("updating account", zap.String("display_name", dn))
	if dn != "" && dn != acc.GetDisplayName() {
		acc.DisplayName = dn
		ret, err := svc.internalInstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{DisplayName: dn})
		if err != nil {
			return nil, err
		}
		acc.Link = ret.GetHTMLURL()
		updated = true
	}

	if updated {
		if acc.GetDisplayName() != "" {
			acc.State = Account_Ready
		} else {
			acc.State = Account_NotReady
		}

		if err := svc.db.Save(&acc).Error; err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// dispatch event
		{
			err := svc.dispatcher.StreamEvent(StreamEvent_TypeAccountUpdated, &StreamEvent_AccountUpdated{Account: &acc})
			if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}
		}
	}

	return &AccountUpdate_Reply{}, nil
}

func (svc *service) ContactRequest(ctx context.Context, req *ContactRequest_Request) (*ContactRequest_Reply, error) {
	query, method, err := NormalizeDeepLinkURL(req.GetLink())
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	var bid *BertyID

	switch method {
	case "/id":
		bid = &BertyID{}
		key := query.Get("key")
		if key == "" {
			return nil, errcode.ErrMessengerInvalidDeepLink
		}
		payload, err := stringToBytes(key)
		if err != nil {
			return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
		}
		err = proto.Unmarshal(payload, bid)
		if err != nil {
			return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
		}
		if len(bid.GetPublicRendezvousSeed()) == 0 || len(bid.GetAccountPK()) == 0 {
			return nil, errcode.ErrMessengerInvalidDeepLink
		}
		name := query.Get("name")
		svc.logger.Info("query display name", zap.String("dn", name))
		if name != "" {
			bid.DisplayName = name
		}
	default:
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	acc, err := getAccount(svc.db)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	om, err := proto.Marshal(&ContactMetadata{DisplayName: acc.GetDisplayName()})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	m, err := proto.Marshal(&ContactMetadata{DisplayName: bid.GetDisplayName()})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	contactRequest := bertytypes.ContactRequestSend_Request{
		Contact: &bertytypes.ShareableContact{
			PK:                   bid.GetAccountPK(),
			PublicRendezvousSeed: bid.GetPublicRendezvousSeed(),
			Metadata:             m,
		},
		OwnMetadata: om,
	}
	_, err = svc.protocolClient.ContactRequestSend(ctx, &contactRequest)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &ContactRequest_Reply{}, nil
}

func (svc *service) ContactAccept(ctx context.Context, req *ContactAccept_Request) (*ContactAccept_Reply, error) {
	pk := req.GetPublicKey()
	if pk == "" {
		return nil, errcode.ErrInvalidInput
	}

	pkb, err := stringToBytes(pk)
	if err != nil {
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	c, err := getContactByPK(svc.db, pk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if c.State != Contact_IncomingRequest {
		return nil, errcode.TODO
	}

	_, err = svc.protocolClient.ContactRequestAccept(ctx, &bertytypes.ContactRequestAccept_Request{ContactPK: pkb})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &ContactAccept_Reply{}, nil
}

func (svc *service) Interact(ctx context.Context, req *Interact_Request) (*Interact_Reply, error) {
	gpk := req.GetConversationPublicKey()
	if gpk == "" {
		return nil, errcode.ErrMissingInput
	}

	svc.logger.Info("interacting", zap.String("public-key", gpk))
	gpkb, err := stringToBytes(gpk)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	switch req.GetType() {
	case AppMessage_TypeUserMessage:
		var p AppMessage_UserMessage
		if err := proto.Unmarshal(req.GetPayload(), &p); err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}
		fp, err := AppMessage_TypeUserMessage.MarshalPayload(timestampMs(time.Now()), &p)
		if err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
		_, err = svc.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{GroupPK: gpkb, Payload: fp})
		if err != nil {
			return nil, err
		}
	case AppMessage_TypeAcknowledge:
		// trick gocritic
	}
	return &Interact_Reply{}, nil
}

func (svc *service) AccountGet(ctx context.Context, req *AccountGet_Request) (*AccountGet_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	acc, err := getAccount(svc.db)
	if err != nil {
		return nil, err
	}
	return &AccountGet_Reply{Account: &acc}, nil
}

func (svc *service) EchoTest(req *EchoTest_Request, srv MessengerService_EchoTestServer) error {
	for {
		err := srv.Send(&EchoTest_Reply{Echo: req.Echo})
		if err != nil {
			return err
		}

		time.Sleep(time.Duration(req.Delay) * time.Millisecond)
	}
}

func (svc *service) ConversationOpen(ctx context.Context, req *ConversationOpen_Request) (*ConversationOpen_Reply, error) {
	// check input
	if req.GroupPK == "" {
		return nil, errcode.ErrMissingInput
	}

	ret := ConversationOpen_Reply{}

	conv, err := getConversationByPK(svc.db, req.GetGroupPK())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// sanity checks
	{
		// should we raise an error instead?
		if conv.IsOpen {
			return &ret, nil
		}
	}

	// update entry in db
	{
		err := svc.db.
			Model(&conv).
			Update("is_open", true).
			Update("unread_count", 0).
			Error
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// dispatch event to subscribers
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conv})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	return &ret, nil
}

func (svc *service) ConversationClose(ctx context.Context, req *ConversationClose_Request) (*ConversationClose_Reply, error) {
	// check input
	if req.GroupPK == "" {
		return nil, errcode.ErrMissingInput
	}

	ret := ConversationClose_Reply{}

	// get entry from db
	conv, err := getConversationByPK(svc.db, req.GetGroupPK())
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// sanity checks
	{
		// should we raise an error instead?
		if !conv.IsOpen {
			return &ret, nil
		}
	}

	// update entry in db
	{
		err := svc.db.
			Model(&conv).
			Update("is_open", false).
			Error
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// dispatch event to subscribers
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conv})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// FIXME: trigger update
	return &ret, nil
}

func (svc *service) AuthServiceInitFlow(ctx context.Context, request *bertytypes.AuthServiceInitFlow_Request) (*bertytypes.AuthServiceInitFlow_Reply, error) {
	return svc.protocolClient.AuthServiceInitFlow(ctx, request)
}

func (svc *service) AuthServiceCompleteFlow(ctx context.Context, request *bertytypes.AuthServiceCompleteFlow_Request) (*bertytypes.AuthServiceCompleteFlow_Reply, error) {
	return svc.protocolClient.AuthServiceCompleteFlow(ctx, request)
}

func (svc *service) ServicesTokenList(request *bertytypes.ServicesTokenList_Request, server MessengerService_ServicesTokenListServer) error {
	cl, err := svc.protocolClient.ServicesTokenList(server.Context(), request)
	if err != nil {
		return err
	}

	for {
		item, err := cl.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			svc.logger.Error("error while getting token info from protocol", zap.Error(err))
			return err
		}

		if err := server.Send(item); err != nil {
			svc.logger.Error("error while sending token info to client", zap.Error(err))
			return err
		}
	}

	return nil
}

func (svc *service) ReplicationServiceRegisterGroup(ctx context.Context, request *bertytypes.ReplicationServiceRegisterGroup_Request) (*bertytypes.ReplicationServiceRegisterGroup_Reply, error) {
	return svc.protocolClient.ReplicationServiceRegisterGroup(ctx, request)
}
