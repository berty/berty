package bertymessenger

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/discordlog"
	"berty.tech/berty/v2/go/internal/sysutil"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/username"
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
	err = discordlog.ShareQRLink(ret.Link.BertyID.DisplayName, discordlog.QRCodeRoom, "Add me on Berty!", ret.InternalURL, ret.WebURL)
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

	displayName := strings.TrimSpace(req.DisplayName)
	id := &BertyID{
		DisplayName:          displayName,
		PublicRendezvousSeed: res.PublicRendezvousSeed,
		AccountPK:            config.AccountPK,
	}
	link := id.GetBertyLink()
	internal, web, err := link.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ret := InstanceShareableBertyID_Reply{
		Link:        link,
		InternalURL: internal,
		WebURL:      web,
	}
	return &ret, nil
}

func (svc *service) ParseDeepLink(_ context.Context, req *ParseDeepLink_Request) (*ParseDeepLink_Reply, error) {
	if req == nil {
		return nil, errcode.ErrMissingInput
	}
	ret := ParseDeepLink_Reply{}

	link, err := UnmarshalLink(req.Link)
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	ret.Link = link

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

	group := &BertyGroup{
		Group:       grpInfo.Group,
		DisplayName: request.GroupName,
	}
	link := group.GetBertyLink()
	internal, web, err := link.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	rep := ShareableBertyGroup_Reply{
		Link:        link,
		InternalURL: internal,
		WebURL:      web,
	}
	return &rep, nil
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

	go svc.autoReplicateContactGroupOnAllServers(req.BertyID.AccountPK)

	return &SendContactRequest_Reply{}, nil
}

func (svc *service) autoReplicateContactGroupOnAllServers(contactPK []byte) {
	groupPK, err := groupPKFromContactPK(svc.ctx, svc.protocolClient, contactPK)
	if err != nil {
		return
	}

	if _, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{
		GroupPK:   groupPK,
		LocalOnly: false,
	}); err != nil {
		return
	}

	svc.autoReplicateGroupOnAllServers(groupPK)
}

func (svc *service) autoReplicateGroupOnAllServers(groupPK []byte) {
	replicationServices := map[string]*ServiceToken{}
	acc, err := svc.db.getAccount()
	if err != nil {
		svc.logger.Error("unable to fetch account", zap.Error(err))
		return
	}

	if !acc.ReplicateNewGroupsAutomatically {
		svc.logger.Warn("group auto replication is not enabled")
		return
	}
	for _, s := range acc.ServiceTokens {
		if s.ServiceType == bertyprotocol.ServiceReplicationID {
			replicationServices[s.AuthenticationURL] = s
		}
	}

	if len(replicationServices) == 0 {
		svc.logger.Warn("group auto replication enabled, but no service available")
		return
	}

	for _, s := range replicationServices {
		if _, err := svc.ReplicationServiceRegisterGroup(svc.ctx, &ReplicationServiceRegisterGroup_Request{
			TokenID:               s.TokenID,
			ConversationPublicKey: b64EncodeBytes(groupPK),
		}); err != nil {
			svc.logger.Error("unable to replicate group on server", zap.Error(err))
		}
	}
}

func (svc *service) SystemInfo(ctx context.Context, req *SystemInfo_Request) (*SystemInfo_Reply, error) {
	reply := SystemInfo_Reply{}
	var errs error

	// messenger's process
	var process *bertytypes.SystemInfo_Process
	{
		var err error
		process, err = sysutil.SystemInfoProcess()
		errs = multierr.Append(errs, err)
		reply.Messenger = &SystemInfo_Messenger{Process: process}
		reply.Messenger.Process.StartedAt = svc.startedAt.Unix()
		reply.Messenger.Process.UptimeMS = time.Since(svc.startedAt).Milliseconds()
	}

	// messenger's db
	{
		dbInfo, err := svc.db.getDBInfo()
		if err != nil {
			errs = multierr.Append(errs, err)
			reply.Messenger.DB = &SystemInfo_DB{}
		} else {
			reply.Messenger.DB = dbInfo
		}
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
		Target: b64EncodeBytes(request.MessageID),
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
	convs, err := svc.db.getAllConversations()
	if err != nil {
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
		acc, err := svc.db.getAccount()
		if err != nil {
			return err
		}
		au, err := proto.Marshal(&StreamEvent_AccountUpdated{Account: acc})
		if err != nil {
			return err
		}
		if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeAccountUpdated, au, false}}); err != nil {
			return err
		}
	}

	// send contacts
	{
		contacts, err := svc.db.getAllContacts()
		if err != nil {
			return err
		}
		svc.logger.Info("sending existing contacts", zap.Int("count", len(contacts)))
		for _, contact := range contacts {
			cu, err := proto.Marshal(&StreamEvent_ContactUpdated{Contact: contact})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeContactUpdated, cu, false}}); err != nil {
				return err
			}
		}
	}

	// send conversations
	{
		convs, err := svc.db.getAllConversations()
		if err != nil {
			return err
		}
		svc.logger.Debug("sending existing conversations", zap.Int("count", len(convs)))
		for _, conv := range convs {
			cu, err := proto.Marshal(&StreamEvent_ConversationUpdated{Conversation: conv})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeConversationUpdated, cu, false}}); err != nil {
				return err
			}
		}
	}

	// send members
	{
		members, err := svc.db.getAllMembers()
		if err != nil {
			return err
		}
		svc.logger.Info("sending existing members", zap.Int("count", len(members)))
		for _, member := range members {
			mu, err := proto.Marshal(&StreamEvent_MemberUpdated{Member: member})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeMemberUpdated, mu, false}}); err != nil {
				return err
			}
		}
	}

	// send interactions
	{
		interactions, err := svc.db.getAllInteractions()
		if err != nil {
			return err
		}
		svc.logger.Info("sending existing interactions", zap.Int("count", len(interactions)))
		for _, inte := range interactions {
			iu, err := proto.Marshal(&StreamEvent_InteractionUpdated{Interaction: inte})
			if err != nil {
				return err
			}
			if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeInteractionUpdated, iu, false}}); err != nil {
				return err
			}
		}
	}

	// signal that we're done sending existing models
	{
		p, err := proto.Marshal(&StreamEvent_ListEnded{})
		if err != nil {
			return err
		}
		if err := sub.Send(&EventStream_Reply{Event: &StreamEvent{StreamEvent_TypeListEnded, p, false}}); err != nil {
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
	pkStr := b64EncodeBytes(pk)
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

	group := &BertyGroup{
		Group:       gir.GetGroup(),
		DisplayName: req.GetDisplayName(),
	}
	link := group.GetBertyLink()
	_, webURL, err := link.Marshal()
	if err != nil {
		return nil, err
	}

	// Create new conversation
	conv := &Conversation{
		AccountMemberPublicKey: b64EncodeBytes(gir.GetMemberPK()),
		PublicKey:              pkStr,
		DisplayName:            dn,
		Link:                   webURL,
		Type:                   Conversation_MultiMemberType,
		LocalDevicePublicKey:   b64EncodeBytes(gir.GetDevicePK()),
		CreatedDate:            timestampMs(time.Now()),
	}

	// Update database
	isNew, err := svc.db.updateConversation(*conv)
	if err != nil {
		return nil, err
	}

	// Dispatch new conversation
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conv}, isNew)
		if err != nil {
			svc.logger.Error("failed to dispatch ConversationUpdated event", zap.Error(err))
		}
	}

	// Try to put group name in group metadata
	{
		err := func() error {
			am, err := AppMessage_TypeSetGroupInfo.MarshalPayload(0, &AppMessage_SetGroupInfo{DisplayName: dn})
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
	if err := svc.sendAccountUserInfo(pkStr); err != nil {
		svc.logger.Error("failed to set creator username in group", zap.Error(err))
	}

	for _, contactPK := range req.GetContactsToInvite() {
		am, err := AppMessage_TypeGroupInvitation.MarshalPayload(timestampMs(time.Now()), &AppMessage_GroupInvitation{Link: conv.GetLink()})
		if err != nil {
			return nil, err
		}
		cpkb, err := b64DecodeBytes(contactPK)
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

	go svc.autoReplicateGroupOnAllServers(pk)

	rep := ConversationCreate_Reply{PublicKey: pkStr}
	return &rep, nil
}

func (svc *service) ConversationJoin(ctx context.Context, req *ConversationJoin_Request) (*ConversationJoin_Reply, error) {
	url := req.GetLink()
	if url == "" {
		return nil, errcode.ErrMissingInput
	}

	link, err := UnmarshalLink(url)
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	if !link.IsGroup() {
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	bgroup := link.GetBertyGroup()
	gpkb := bgroup.GetGroup().GetPublicKey()

	mmgjReq := &bertytypes.MultiMemberGroupJoin_Request{Group: bgroup.GetGroup()}
	if _, err := svc.protocolClient.MultiMemberGroupJoin(ctx, mmgjReq); err != nil {
		// Rollback db ?
		return nil, errcode.TODO.Wrap(err)
	}

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(gpkb)))
		}
	}

	gir, err := svc.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	conv := Conversation{
		AccountMemberPublicKey: b64EncodeBytes(gir.GetMemberPK()),
		PublicKey:              b64EncodeBytes(gpkb),
		DisplayName:            bgroup.GetDisplayName(),
		Link:                   url,
		Type:                   Conversation_MultiMemberType,
		LocalDevicePublicKey:   b64EncodeBytes(gir.GetDevicePK()),
		CreatedDate:            timestampMs(time.Now()),
	}

	// update db
	isNew, err := svc.db.updateConversation(conv)
	if err != nil {
		return nil, err
	}

	// dispatch event
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{Conversation: &conv}, isNew)
		if err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	// Try to put user name in group metadata 3 times
	for i := 0; i < 3; i++ {
		if err := svc.sendAccountUserInfo(conv.PublicKey); err != nil {
			svc.logger.Error("failed to set username in group", zap.Error(err))
		}
	}

	return &ConversationJoin_Reply{}, nil
}

func ensureValidBase64CID(str string) error {
	cidBytes, err := b64DecodeBytes(str)
	if err != nil {
		return fmt.Errorf("decode base64: %s", err.Error())
	}

	_, err = ipfscid.Cast(cidBytes)
	if err != nil {
		return fmt.Errorf("decode cid: %s", err.Error())
	}

	return nil
}

func (svc *service) AccountUpdate(ctx context.Context, req *AccountUpdate_Request) (*AccountUpdate_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	avatarCID := req.GetAvatarCID()
	if avatarCID != "" {
		if err := ensureValidBase64CID(avatarCID); err != nil {
			err = fmt.Errorf("couldn't ensure the avatar cid is a valid ipfs cid: %s", err)
			svc.logger.Error("AccountUpdate: bad avatar cid", zap.Error(err))
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}
	}

	err := svc.db.tx(func(tx *dbWrapper) error {
		acc, err := tx.getAccount()
		if err != nil {
			svc.logger.Error("AccountUpdate: failed to get account", zap.Error(err))
			return errcode.TODO.Wrap(err)
		}

		updated := false
		dn := req.GetDisplayName()
		if dn != "" && dn != acc.GetDisplayName() {
			updated = true
		}
		if avatarCID != "" && avatarCID != acc.GetAvatarCID() {
			updated = true
		}

		if !updated {
			svc.logger.Debug("AccountUpdate: nothing to do")
			return nil
		}
		svc.logger.Debug("AccountUpdate: updating account", zap.String("display_name", dn), zap.String("avatar_cid", avatarCID))

		ret, err := svc.internalInstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{DisplayName: dn})
		if err != nil {
			svc.logger.Error("AccountUpdate: account link", zap.Error(err))
			return err
		}

		acc, err = tx.updateAccount(acc.PublicKey, ret.GetWebURL(), dn, avatarCID)
		if err != nil {
			svc.logger.Error("AccountUpdate: updating account in db", zap.Error(err))
			return err
		}

		// dispatch event
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeAccountUpdated, &StreamEvent_AccountUpdated{Account: acc}, false)
		if err != nil {
			svc.logger.Error("AccountUpdate: failed to dispatch update", zap.Error(err))
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	convos, err := svc.db.getAllConversations()
	if err != nil {
		svc.logger.Error("AccountUpdate: get conversations", zap.Error(err))
	} else {
		for _, conv := range convos {
			if err := svc.sendAccountUserInfo(conv.GetPublicKey()); err != nil {
				svc.logger.Error("AccountUpdate: send user info", zap.Error(err))
			}
		}
	}

	svc.logger.Debug("AccountUpdate finished", zap.Error(err))
	return &AccountUpdate_Reply{}, err
}

func imin(a, b int) int {
	if b < a {
		return b
	}
	return a
}

func (svc *service) ContactRequest(ctx context.Context, req *ContactRequest_Request) (*ContactRequest_Reply, error) {
	link, err := UnmarshalLink(req.GetLink())
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	if !link.IsContact() {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	acc, err := svc.db.getAccount()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	om, err := proto.Marshal(&ContactMetadata{DisplayName: acc.GetDisplayName()})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	m, err := proto.Marshal(&ContactMetadata{DisplayName: link.BertyID.GetDisplayName()})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	contactRequest := bertytypes.ContactRequestSend_Request{
		Contact: &bertytypes.ShareableContact{
			PK:                   link.BertyID.GetAccountPK(),
			PublicRendezvousSeed: link.BertyID.GetPublicRendezvousSeed(),
			Metadata:             m,
		},
		OwnMetadata: om,
	}
	_, err = svc.protocolClient.ContactRequestSend(ctx, &contactRequest)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	go svc.autoReplicateContactGroupOnAllServers(contactRequest.Contact.PK)

	return &ContactRequest_Reply{}, nil
}

func (svc *service) ContactAccept(ctx context.Context, req *ContactAccept_Request) (*ContactAccept_Reply, error) {
	pk := req.GetPublicKey()
	if pk == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no public key supplied"))
	}

	pkb, err := b64DecodeBytes(pk)
	if err != nil {
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	svc.logger.Debug("retrieving contact", zap.String("contact_pk", pk))

	c, err := svc.db.getContactByPK(pk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if c.State != Contact_IncomingRequest {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("contact request status is not IncomingRequest %s)", c.State.String()))
	}

	_, err = svc.protocolClient.ContactRequestAccept(ctx, &bertytypes.ContactRequestAccept_Request{ContactPK: pkb})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	go svc.autoReplicateContactGroupOnAllServers(pkb)

	return &ContactAccept_Reply{}, nil
}

func (svc *service) Interact(ctx context.Context, req *Interact_Request) (*Interact_Reply, error) {
	gpk := req.GetConversationPublicKey()
	if gpk == "" {
		return nil, errcode.ErrMissingInput
	}

	svc.logger.Info("interacting", zap.String("public-key", gpk))
	gpkb, err := b64DecodeBytes(gpk)
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

	acc, err := svc.db.getAccount()
	if err != nil {
		return nil, err
	}
	return &AccountGet_Reply{Account: acc}, nil
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

	conv, updated, err := svc.db.setConversationIsOpenStatus(req.GetGroupPK(), true)

	if err != nil {
		return nil, err
	} else if !updated {
		return &ret, nil
	}

	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conv}, false); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &ret, nil
}

func (svc *service) ConversationClose(ctx context.Context, req *ConversationClose_Request) (*ConversationClose_Reply, error) {
	// check input
	if req.GroupPK == "" {
		return nil, errcode.ErrMissingInput
	}

	ret := ConversationClose_Reply{}

	conv, updated, err := svc.db.setConversationIsOpenStatus(req.GetGroupPK(), false)

	if err != nil {
		return nil, err
	} else if !updated {
		return &ret, nil
	}

	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conv}, false); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// FIXME: trigger update
	return &ret, nil
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

func (svc *service) ReplicationServiceRegisterGroup(ctx context.Context, request *ReplicationServiceRegisterGroup_Request) (*ReplicationServiceRegisterGroup_Reply, error) {
	gpk := request.GetConversationPublicKey()
	if gpk == "" {
		return nil, errcode.ErrMissingInput
	}

	svc.logger.Info("attempting replicating group", zap.String("public-key", gpk))
	gpkb, err := b64DecodeBytes(gpk)
	if err != nil {
		svc.logger.Error("failed to decode group pk", zap.String("public-key", gpk), zap.Error(err))
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	_, err = svc.protocolClient.ReplicationServiceRegisterGroup(ctx, &bertytypes.ReplicationServiceRegisterGroup_Request{
		TokenID: request.TokenID,
		GroupPK: gpkb,
	})

	if err != nil {
		svc.logger.Error("failed to replicate group", zap.String("public-key", gpk), zap.String("token-id", request.TokenID), zap.Error(err))
		return nil, err
	}

	svc.logger.Info("replicating group", zap.String("public-key", gpk), zap.String("token-id", request.TokenID), zap.Error(err))

	return &ReplicationServiceRegisterGroup_Reply{}, nil
}

func (svc *service) BannerQuote(ctx context.Context, request *BannerQuote_Request) (*BannerQuote_Reply, error) {
	var quote banner.Quote
	if request != nil && request.Random {
		quote = banner.RandomQuote()
	} else {
		quote = banner.QOTD()
	}
	ret := BannerQuote_Reply{
		Quote:  quote.Text,
		Author: quote.Author,
	}
	return &ret, nil
}

func (svc *service) GetUsername(ctx context.Context, request *GetUsername_Request) (*GetUsername_Reply, error) {
	return &GetUsername_Reply{
		Username: username.GetUsername(),
	}, nil
}

func (svc *service) SendReplyOptions(ctx context.Context, request *SendReplyOptions_Request) (*SendReplyOptions_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	payload, err := AppMessage_TypeReplyOptions.MarshalPayload(timestampMs(time.Now()), request.Options)
	if err != nil {
		return nil, err
	}

	_, err = svc.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: request.GroupPK,
		Payload: payload,
	})

	return &SendReplyOptions_Reply{}, err
}

func (svc *service) ReplicationSetAutoEnable(ctx context.Context, request *ReplicationSetAutoEnable_Request) (*ReplicationSetAutoEnable_Reply, error) {
	config, err := svc.protocolClient.InstanceGetConfiguration(svc.ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, err
	}

	if err := svc.db.accountSetReplicationAutoEnable(b64EncodeBytes(config.AccountPK), request.Enabled); err != nil {
		return nil, err
	}

	acc, err := svc.db.getAccount()
	if err != nil {
		return nil, err
	}

	// dispatch event
	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeAccountUpdated, &StreamEvent_AccountUpdated{Account: acc}, false); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &ReplicationSetAutoEnable_Reply{}, nil
}

func (svc *service) InstanceExportData(_ *InstanceExportData_Request, server MessengerService_InstanceExportDataServer) error {
	tmpFile, err := ioutil.TempFile(os.TempDir(), "export-")
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	defer os.Remove(tmpFile.Name())

	cl, err := svc.protocolClient.InstanceExportData(server.Context(), &bertytypes.InstanceExportData_Request{})
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	for {
		chunk, err := cl.Recv()
		if err == io.EOF {
			break
		} else if err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		if _, err := tmpFile.Write(chunk.ExportedData); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	// Remove trailing headers to append messenger data
	_, err = tmpFile.Seek(-1024, io.SeekEnd)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	if err := exportMessengerData(tmpFile, svc.db.db, svc.logger); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if _, err = tmpFile.Seek(0, io.SeekStart); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	buffer := make([]byte, 1024)
	for {
		_, err := tmpFile.Read(buffer)
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		if err := server.Send(&InstanceExportData_Reply{ExportedData: buffer}); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}
}
