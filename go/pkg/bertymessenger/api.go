package bertymessenger

import (
	"context"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/internal/discordlog"
	"berty.tech/berty/v2/go/internal/streamutil"
	"berty.tech/berty/v2/go/internal/sysutil"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/username"
)

func (svc *service) DevShareInstanceBertyID(ctx context.Context, req *messengertypes.DevShareInstanceBertyID_Request) (*messengertypes.DevShareInstanceBertyID_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	ret, err := svc.internalInstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{
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

	return &messengertypes.DevShareInstanceBertyID_Reply{}, nil
}

func (svc *service) InstanceShareableBertyID(ctx context.Context, req *messengertypes.InstanceShareableBertyID_Request) (*messengertypes.InstanceShareableBertyID_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()
	// need to split the function for internal calls to prevent deadlocks
	return svc.internalInstanceShareableBertyID(ctx, req)
}

func (svc *service) internalInstanceShareableBertyID(ctx context.Context, req *messengertypes.InstanceShareableBertyID_Request) (*messengertypes.InstanceShareableBertyID_Reply, error) {
	if req == nil {
		req = &messengertypes.InstanceShareableBertyID_Request{}
	}
	config, err := svc.protocolClient.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	svc.logger.Debug("enable contact request (may be already done)")
	_, err = svc.protocolClient.ContactRequestEnable(ctx, &protocoltypes.ContactRequestEnable_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if req.Reset_ {
		svc.logger.Info("reset contact reference")
		_, err = svc.protocolClient.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	res, err := svc.protocolClient.ContactRequestReference(ctx, &protocoltypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// if this call does not return a PublicRendezvousSeed, then we need to call Reset
	if res.PublicRendezvousSeed == nil {
		svc.logger.Info("reset contact reference")
		_, err = svc.protocolClient.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}
	res, err = svc.protocolClient.ContactRequestReference(ctx, &protocoltypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	displayName := strings.TrimSpace(req.DisplayName)
	id := &messengertypes.BertyID{
		DisplayName:          displayName,
		PublicRendezvousSeed: res.PublicRendezvousSeed,
		AccountPK:            config.AccountPK,
	}
	link := id.GetBertyLink()

	if req.Passphrase != nil && string(req.Passphrase) != "" {
		link, err = bertylinks.EncryptLink(link, req.Passphrase)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}
	}

	internal, web, err := bertylinks.MarshalLink(link)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ret := messengertypes.InstanceShareableBertyID_Reply{
		Link:        link,
		InternalURL: internal,
		WebURL:      web,
	}
	return &ret, nil
}

func (svc *service) ParseDeepLink(_ context.Context, req *messengertypes.ParseDeepLink_Request) (*messengertypes.ParseDeepLink_Reply, error) {
	if req == nil {
		return nil, errcode.ErrMissingInput
	}
	ret := messengertypes.ParseDeepLink_Reply{}

	link, err := bertylinks.UnmarshalLink(req.Link, req.Passphrase)
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	ret.Link = link

	return &ret, nil
}

func (svc *service) ShareableBertyGroup(ctx context.Context, req *messengertypes.ShareableBertyGroup_Request) (*messengertypes.ShareableBertyGroup_Reply, error) {
	if req == nil {
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	grpInfo, err := svc.protocolClient.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		GroupPK: req.GroupPK,
	})
	if err != nil {
		return nil, err
	}

	group := &messengertypes.BertyGroup{
		Group:       grpInfo.Group,
		DisplayName: req.GroupName,
	}
	link := group.GetBertyLink()
	internal, web, err := bertylinks.MarshalLink(link)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	rep := messengertypes.ShareableBertyGroup_Reply{
		Link:        link,
		InternalURL: internal,
		WebURL:      web,
	}
	return &rep, nil
}

// maybe we should preserve the previous generic api
func (svc *service) SendContactRequest(ctx context.Context, req *messengertypes.SendContactRequest_Request) (*messengertypes.SendContactRequest_Reply, error) {
	if req == nil || req.BertyID == nil || req.BertyID.AccountPK == nil || req.BertyID.PublicRendezvousSeed == nil {
		return nil, errcode.ErrMissingInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	contactRequest := protocoltypes.ContactRequestSend_Request{
		Contact: &protocoltypes.ShareableContact{
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

	return &messengertypes.SendContactRequest_Reply{}, nil
}

func (svc *service) autoReplicateContactGroupOnAllServers(contactPK []byte) {
	groupPK, err := groupPKFromContactPK(svc.ctx, svc.protocolClient, contactPK)
	if err != nil {
		return
	}

	if _, err := svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK:   groupPK,
		LocalOnly: false,
	}); err != nil {
		return
	}

	svc.autoReplicateGroupOnAllServers(groupPK)
}

func (svc *service) autoReplicateGroupOnAllServers(groupPK []byte) {
	replicationServices := map[string]*messengertypes.ServiceToken{}
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
		if _, err := svc.ReplicationServiceRegisterGroup(svc.ctx, &messengertypes.ReplicationServiceRegisterGroup_Request{
			TokenID:               s.TokenID,
			ConversationPublicKey: b64EncodeBytes(groupPK),
		}); err != nil {
			svc.logger.Error("unable to replicate group on server", zap.Error(err))
		}
	}
}

func (svc *service) SystemInfo(ctx context.Context, req *messengertypes.SystemInfo_Request) (*messengertypes.SystemInfo_Reply, error) {
	reply := messengertypes.SystemInfo_Reply{}
	var errs error

	// messenger's process
	var process *protocoltypes.SystemInfo_Process
	{
		var err error
		process, err = sysutil.SystemInfoProcess()
		errs = multierr.Append(errs, err)
		reply.Messenger = &messengertypes.SystemInfo_Messenger{Process: process}
		reply.Messenger.Process.StartedAt = svc.startedAt.Unix()
		reply.Messenger.Process.UptimeMS = time.Since(svc.startedAt).Milliseconds()
	}

	// messenger's db
	{
		dbInfo, err := svc.db.getDBInfo()
		if err != nil {
			errs = multierr.Append(errs, err)
			reply.Messenger.DB = &messengertypes.SystemInfo_DB{}
		} else {
			reply.Messenger.DB = dbInfo
		}
	}

	// protocol
	protocol, err := svc.protocolClient.SystemInfo(ctx, &protocoltypes.SystemInfo_Request{})
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

func (svc *service) SendAck(ctx context.Context, req *messengertypes.SendAck_Request) (*messengertypes.SendAck_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	gInfo, err := svc.protocolClient.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		GroupPK: req.GroupPK,
	})
	if err != nil {
		return nil, err
	}

	if gInfo.Group.GroupType != protocoltypes.GroupTypeContact {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("only %s groups are supported", protocoltypes.GroupTypeContact.String()))
	}

	am, err := messengertypes.AppMessage_TypeAcknowledge.MarshalPayload(0, b64EncodeBytes(req.MessageID), nil, &messengertypes.AppMessage_Acknowledge{})
	if err != nil {
		return nil, err
	}

	_, err = svc.protocolClient.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: req.GroupPK,
		Payload: am,
	})

	if err != nil {
		return nil, err
	}

	return &messengertypes.SendAck_Reply{}, nil
}

func (svc *service) ConversationStream(req *messengertypes.ConversationStream_Request, sub messengertypes.MessengerService_ConversationStreamServer) error {
	// TODO: cursors

	// send existing convs
	convs, err := svc.db.getAllConversations()
	if err != nil {
		return err
	}
	for _, c := range convs {
		if err := sub.Send(&messengertypes.ConversationStream_Reply{Conversation: c}); err != nil {
			return err
		}
	}

	// FIXME: case where a conversation is created/updated/deleted between the list and the stream
	// dunno how to add a test to trigger, maybe it can never happen? don't know how to prove either way

	// stream new convs
	errch := make(chan error)
	defer close(errch)
	n := NotifieeBundle{
		StreamEventImpl: func(e *messengertypes.StreamEvent) error {
			if e.Type == messengertypes.StreamEvent_TypeConversationUpdated {
				var cu messengertypes.StreamEvent_ConversationUpdated
				if err := proto.Unmarshal(e.GetPayload(), &cu); err != nil {
					errch <- err
				}
				if err := sub.Send(&messengertypes.ConversationStream_Reply{Conversation: cu.GetConversation()}); err != nil {
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

func (svc *service) streamEverything(sub messengertypes.MessengerService_EventStreamServer) error {
	if err := svc.streamShallow(sub, 0); err != nil {
		return err
	}

	// send interactions
	{
		interactions, err := svc.db.getAllInteractions()
		if err != nil {
			return err
		}
		svc.logger.Info("sending existing interactions", zap.Int("count", len(interactions)))
		for _, inte := range interactions {
			iu, err := proto.Marshal(&messengertypes.StreamEvent_InteractionUpdated{Interaction: inte})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeInteractionUpdated, Payload: iu, IsNew: false}}); err != nil {
				return err
			}
		}
	}

	// send medias
	{
		medias, err := svc.db.getAllMedias()
		if err != nil {
			return err
		}
		svc.logger.Info("sending existing medias", zap.Int("count", len(medias)))
		for _, media := range medias {
			mu, err := proto.Marshal(&messengertypes.StreamEvent_MediaUpdated{Media: media})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeMediaUpdated, Payload: mu, IsNew: false}}); err != nil {
				return err
			}
		}
	}

	return nil
}

func (svc *service) streamShallow(sub messengertypes.MessengerService_EventStreamServer, includeInteractionsAndMedias int32) error {
	// send account
	{
		svc.logger.Debug("sending account")
		acc, err := svc.db.getAccount()
		if err != nil {
			return err
		}
		au, err := proto.Marshal(&messengertypes.StreamEvent_AccountUpdated{Account: acc})
		if err != nil {
			return err
		}
		if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeAccountUpdated, Payload: au, IsNew: false}}); err != nil {
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
			cu, err := proto.Marshal(&messengertypes.StreamEvent_ContactUpdated{Contact: contact})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeContactUpdated, Payload: cu, IsNew: false}}); err != nil {
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
			cu, err := proto.Marshal(&messengertypes.StreamEvent_ConversationUpdated{Conversation: conv})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeConversationUpdated, Payload: cu, IsNew: false}}); err != nil {
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
			mu, err := proto.Marshal(&messengertypes.StreamEvent_MemberUpdated{Member: member})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeMemberUpdated, Payload: mu, IsNew: false}}); err != nil {
				return err
			}
		}
	}

	// send interactions
	if includeInteractionsAndMedias > 0 {
		interactions, medias, err := svc.db.getPaginatedInteractions(&messengertypes.PaginatedInteractionsOptions{Amount: includeInteractionsAndMedias})
		if err != nil {
			return err
		}
		svc.logger.Info("sending existing interactions", zap.Int("count", len(interactions)))
		for _, inte := range interactions {
			iu, err := proto.Marshal(&messengertypes.StreamEvent_InteractionUpdated{Interaction: inte})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeInteractionUpdated, Payload: iu, IsNew: false}}); err != nil {
				return err
			}
		}

		svc.logger.Info("sending existing medias", zap.Int("count", len(medias)))
		for _, media := range medias {
			mu, err := proto.Marshal(&messengertypes.StreamEvent_MediaUpdated{Media: media})
			if err != nil {
				return err
			}
			if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeMediaUpdated, Payload: mu, IsNew: false}}); err != nil {
				return err
			}
		}
	}

	return nil
}

func (svc *service) EventStream(req *messengertypes.EventStream_Request, sub messengertypes.MessengerService_EventStreamServer) error {
	if req.ShallowAmount > 0 {
		if err := svc.streamShallow(sub, req.ShallowAmount); err != nil {
			return err
		}
	} else {
		err := svc.streamEverything(sub)
		if err != nil {
			return err
		}
	}

	// signal that we're done sending existing models
	{
		p, err := proto.Marshal(&messengertypes.StreamEvent_ListEnded{})
		if err != nil {
			return err
		}
		if err := sub.Send(&messengertypes.EventStream_Reply{Event: &messengertypes.StreamEvent{Type: messengertypes.StreamEvent_TypeListEnded, Payload: p, IsNew: false}}); err != nil {
			return err
		}
	}

	// FIXME: case where a model is created/updated/deleted between the list and the stream
	// dunno how to add a test to trigger, maybe it can never happen? don't know how to prove either way

	// stream new events
	{
		errch := make(chan error)
		defer close(errch)
		n := NotifieeBundle{StreamEventImpl: func(e *messengertypes.StreamEvent) error {
			{
				payload, err := e.UnmarshalPayload()
				if err != nil {
					svc.logger.Error("failed to unmarshal payload for logging", zap.Error(err))
					payload = nil
				}
				svc.logger.Debug("sending stream event", zap.String("type", e.GetType().String()), zap.Any("payload", payload))
			}

			if err := sub.Send(&messengertypes.EventStream_Reply{Event: e}); err != nil {
				// next commented line allows me to manually test the behavior on a send error. How to isolate into an automatic test?
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

func (svc *service) ConversationCreate(ctx context.Context, req *messengertypes.ConversationCreate_Request) (*messengertypes.ConversationCreate_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	dn := req.GetDisplayName()

	// Create a multimember group
	cr, err := svc.protocolClient.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return nil, err
	}
	pk := cr.GetGroupPK()
	pkStr := b64EncodeBytes(pk)
	svc.logger.Info("Created conv", zap.String("dn", req.GetDisplayName()), zap.String("pk", pkStr))

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: pk})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", pkStr))
		}
	}

	gir, err := svc.protocolClient.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{GroupPK: pk})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	group := &messengertypes.BertyGroup{
		Group:       gir.GetGroup(),
		DisplayName: req.GetDisplayName(),
	}
	link := group.GetBertyLink()
	_, webURL, err := bertylinks.MarshalLink(link)
	if err != nil {
		return nil, err
	}

	// Create new conversation
	conv := &messengertypes.Conversation{
		AccountMemberPublicKey: b64EncodeBytes(gir.GetMemberPK()),
		PublicKey:              pkStr,
		DisplayName:            dn,
		Link:                   webURL,
		Type:                   messengertypes.Conversation_MultiMemberType,
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
		err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, isNew)
		if err != nil {
			svc.logger.Error("failed to dispatch ConversationUpdated event", zap.Error(err))
		}
	}

	// Try to put group name in group metadata
	{
		err := func() error {
			am, err := messengertypes.AppMessage_TypeSetGroupInfo.MarshalPayload(0, "", nil, &messengertypes.AppMessage_SetGroupInfo{DisplayName: dn})
			if err != nil {
				return err
			}

			_, err = svc.protocolClient.AppMetadataSend(ctx, &protocoltypes.AppMetadataSend_Request{GroupPK: pk, Payload: am})
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
		am, err := messengertypes.AppMessage_TypeGroupInvitation.MarshalPayload(timestampMs(time.Now()), "", nil, &messengertypes.AppMessage_GroupInvitation{Link: conv.GetLink()})
		if err != nil {
			return nil, err
		}
		cpkb, err := b64DecodeBytes(contactPK)
		if err != nil {
			return nil, err
		}
		ginfo, err := svc.protocolClient.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{ContactPK: cpkb})
		if err != nil {
			return nil, err
		}
		_, err = svc.protocolClient.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{GroupPK: ginfo.GetGroup().GetPublicKey(), Payload: am})
		if err != nil {
			return nil, err
		}
	}

	go svc.autoReplicateGroupOnAllServers(pk)

	rep := messengertypes.ConversationCreate_Reply{PublicKey: pkStr}
	return &rep, nil
}

func (svc *service) ConversationJoin(ctx context.Context, req *messengertypes.ConversationJoin_Request) (*messengertypes.ConversationJoin_Reply, error) {
	url := req.GetLink()
	if url == "" {
		return nil, errcode.ErrMissingInput
	}

	link, err := bertylinks.UnmarshalLink(url, req.Passphrase)
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	if link.Kind == messengertypes.BertyLink_EncryptedV1Kind {
		return nil, errcode.ErrMessengerDeepLinkRequiresPassphrase
	}
	if !link.IsGroup() {
		return nil, errcode.ErrInvalidInput
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	bgroup := link.GetBertyGroup()
	gpkb := bgroup.GetGroup().GetPublicKey()

	mmgjReq := &protocoltypes.MultiMemberGroupJoin_Request{Group: bgroup.GetGroup()}
	if _, err := svc.protocolClient.MultiMemberGroupJoin(ctx, mmgjReq); err != nil {
		// Rollback db ?
		return nil, errcode.TODO.Wrap(err)
	}

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gpkb})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(gpkb)))
		}
	}

	gir, err := svc.protocolClient.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	conv := messengertypes.Conversation{
		AccountMemberPublicKey: b64EncodeBytes(gir.GetMemberPK()),
		PublicKey:              b64EncodeBytes(gpkb),
		DisplayName:            bgroup.GetDisplayName(),
		Link:                   url,
		Type:                   messengertypes.Conversation_MultiMemberType,
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
		err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: &conv}, isNew)
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

	return &messengertypes.ConversationJoin_Reply{}, nil
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

func (svc *service) AccountUpdate(ctx context.Context, req *messengertypes.AccountUpdate_Request) (*messengertypes.AccountUpdate_Reply, error) {
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

		ret, err := svc.internalInstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{DisplayName: dn})
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
		err = svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeAccountUpdated, &messengertypes.StreamEvent_AccountUpdated{Account: acc}, false)
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
	return &messengertypes.AccountUpdate_Reply{}, err
}

func (svc *service) ContactRequest(ctx context.Context, req *messengertypes.ContactRequest_Request) (*messengertypes.ContactRequest_Reply, error) {
	link, err := bertylinks.UnmarshalLink(req.GetLink(), req.Passphrase)
	if err != nil {
		return nil, errcode.ErrMessengerInvalidDeepLink.Wrap(err)
	}
	if link.Kind == messengertypes.BertyLink_EncryptedV1Kind {
		return nil, errcode.ErrMessengerDeepLinkRequiresPassphrase
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
	om, err := proto.Marshal(&messengertypes.ContactMetadata{DisplayName: acc.GetDisplayName()})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	m, err := proto.Marshal(&messengertypes.ContactMetadata{DisplayName: link.BertyID.GetDisplayName()})
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	contactRequest := protocoltypes.ContactRequestSend_Request{
		Contact: &protocoltypes.ShareableContact{
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

	return &messengertypes.ContactRequest_Reply{}, nil
}

func (svc *service) ContactAccept(ctx context.Context, req *messengertypes.ContactAccept_Request) (*messengertypes.ContactAccept_Reply, error) {
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

	if c.State != messengertypes.Contact_IncomingRequest {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("contact request status is not IncomingRequest %s)", c.State.String()))
	}

	_, err = svc.protocolClient.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{ContactPK: pkb})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	go svc.autoReplicateContactGroupOnAllServers(pkb)

	return &messengertypes.ContactAccept_Reply{}, nil
}

func (svc *service) Interact(ctx context.Context, req *messengertypes.Interact_Request) (*messengertypes.Interact_Reply, error) {
	gpk := req.GetConversationPublicKey()
	if gpk == "" {
		return nil, errcode.ErrMissingInput
	}

	svc.logger.Info("interacting", zap.String("public-key", gpk))
	gpkb, err := b64DecodeBytes(gpk)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	payload, err := (&messengertypes.AppMessage{
		Type:    req.GetType(),
		Payload: req.GetPayload(),
	}).UnmarshalPayload()
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	medias, err := svc.db.getMedias(req.GetMediaCids())
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}
	fp, err := req.GetType().MarshalPayload(timestampMs(time.Now()), req.GetTargetCID(), medias, payload)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}
	cids := make([][]byte, len(req.GetMediaCids()))
	for i, mediaCID := range req.GetMediaCids() {
		cids[i], err = b64DecodeBytes(mediaCID)
		if err != nil {
			return nil, errcode.ErrDeserialization.Wrap(err)
		}
	}
	reply, err := svc.protocolClient.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{GroupPK: gpkb, Payload: fp, AttachmentCIDs: cids})
	if err != nil {
		return nil, err
	}
	cid, err := ipfscid.Cast(reply.GetCID())
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}
	return &messengertypes.Interact_Reply{CID: cid.String()}, nil
}

func (svc *service) AccountGet(ctx context.Context, req *messengertypes.AccountGet_Request) (*messengertypes.AccountGet_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	acc, err := svc.db.getAccount()
	if err != nil {
		return nil, err
	}
	return &messengertypes.AccountGet_Reply{Account: acc}, nil
}

func (svc *service) EchoTest(req *messengertypes.EchoTest_Request, srv messengertypes.MessengerService_EchoTestServer) error {
	if req.TriggerError {
		return errcode.ErrTestEcho
	}

	for {
		err := srv.Send(&messengertypes.EchoTest_Reply{Echo: req.Echo})
		if err != nil {
			return errcode.ErrTestEchoSend.Wrap(err)
		}

		time.Sleep(time.Duration(req.Delay) * time.Millisecond)
	}
}

func (svc *service) EchoDuplexTest(srv messengertypes.MessengerService_EchoDuplexTestServer) error {
	for {
		req, err := srv.Recv()
		if err != nil {
			return errcode.ErrTestEchoRecv.Wrap(err)
		}

		if req.TriggerError {
			return errcode.ErrTestEcho
		}

		err = srv.Send(&messengertypes.EchoDuplexTest_Reply{
			Echo: req.Echo,
		})
		if err != nil {
			return errcode.ErrTestEchoSend.Wrap(err)
		}
	}
}

func (svc *service) ConversationOpen(ctx context.Context, req *messengertypes.ConversationOpen_Request) (*messengertypes.ConversationOpen_Reply, error) {
	// check input
	if req.GroupPK == "" {
		return nil, errcode.ErrMissingInput
	}

	ret := messengertypes.ConversationOpen_Reply{}

	conv, updated, err := svc.db.setConversationIsOpenStatus(req.GetGroupPK(), true)

	if err != nil {
		return nil, err
	} else if !updated {
		return &ret, nil
	}

	if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &ret, nil
}

func (svc *service) ConversationClose(ctx context.Context, req *messengertypes.ConversationClose_Request) (*messengertypes.ConversationClose_Reply, error) {
	// check input
	if req.GroupPK == "" {
		return nil, errcode.ErrMissingInput
	}

	ret := messengertypes.ConversationClose_Reply{}

	conv, updated, err := svc.db.setConversationIsOpenStatus(req.GetGroupPK(), false)

	if err != nil {
		return nil, err
	} else if !updated {
		return &ret, nil
	}

	if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// FIXME: trigger update
	return &ret, nil
}

func (svc *service) ServicesTokenList(req *protocoltypes.ServicesTokenList_Request, server messengertypes.MessengerService_ServicesTokenListServer) error {
	cl, err := svc.protocolClient.ServicesTokenList(server.Context(), req)
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

func (svc *service) ReplicationServiceRegisterGroup(ctx context.Context, req *messengertypes.ReplicationServiceRegisterGroup_Request) (*messengertypes.ReplicationServiceRegisterGroup_Reply, error) {
	gpk := req.GetConversationPublicKey()
	if gpk == "" {
		return nil, errcode.ErrMissingInput
	}

	svc.logger.Info("attempting replicating group", zap.String("public-key", gpk))
	gpkb, err := b64DecodeBytes(gpk)
	if err != nil {
		svc.logger.Error("failed to decode group pk", zap.String("public-key", gpk), zap.Error(err))
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	_, err = svc.protocolClient.ReplicationServiceRegisterGroup(ctx, &protocoltypes.ReplicationServiceRegisterGroup_Request{
		TokenID: req.TokenID,
		GroupPK: gpkb,
	})

	if err != nil {
		svc.logger.Error("failed to replicate group", zap.String("public-key", gpk), zap.String("token-id", req.TokenID), zap.Error(err))
		return nil, err
	}

	svc.logger.Info("replicating group", zap.String("public-key", gpk), zap.String("token-id", req.TokenID), zap.Error(err))

	return &messengertypes.ReplicationServiceRegisterGroup_Reply{}, nil
}

func (svc *service) BannerQuote(ctx context.Context, req *messengertypes.BannerQuote_Request) (*messengertypes.BannerQuote_Reply, error) {
	var quote banner.Quote
	if req != nil && req.Random {
		quote = banner.RandomQuote()
	} else {
		quote = banner.QOTD()
	}
	ret := messengertypes.BannerQuote_Reply{
		Quote:  quote.Text,
		Author: quote.Author,
	}
	return &ret, nil
}

func (svc *service) GetUsername(ctx context.Context, req *messengertypes.GetUsername_Request) (*messengertypes.GetUsername_Reply, error) {
	return &messengertypes.GetUsername_Reply{
		Username: username.GetUsername(),
	}, nil
}

func (svc *service) SendReplyOptions(ctx context.Context, req *messengertypes.SendReplyOptions_Request) (*messengertypes.SendReplyOptions_Reply, error) {
	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	payload, err := messengertypes.AppMessage_TypeReplyOptions.MarshalPayload(timestampMs(time.Now()), "", nil, req.Options)
	if err != nil {
		return nil, err
	}

	_, err = svc.protocolClient.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: req.GroupPK,
		Payload: payload,
	})

	return &messengertypes.SendReplyOptions_Reply{}, err
}

func (svc *service) ReplicationSetAutoEnable(ctx context.Context, req *messengertypes.ReplicationSetAutoEnable_Request) (*messengertypes.ReplicationSetAutoEnable_Reply, error) {
	config, err := svc.protocolClient.InstanceGetConfiguration(svc.ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, err
	}

	if err := svc.db.accountSetReplicationAutoEnable(b64EncodeBytes(config.AccountPK), req.Enabled); err != nil {
		return nil, err
	}

	acc, err := svc.db.getAccount()
	if err != nil {
		return nil, err
	}

	// dispatch event
	if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeAccountUpdated, &messengertypes.StreamEvent_AccountUpdated{Account: acc}, false); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &messengertypes.ReplicationSetAutoEnable_Reply{}, nil
}

func (svc *service) InstanceExportData(_ *messengertypes.InstanceExportData_Request, server messengertypes.MessengerService_InstanceExportDataServer) error {
	tmpFile, err := ioutil.TempFile(os.TempDir(), "export-")
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	defer os.Remove(tmpFile.Name())

	cl, err := svc.protocolClient.InstanceExportData(server.Context(), &protocoltypes.InstanceExportData_Request{})
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

		if err := server.Send(&messengertypes.InstanceExportData_Reply{ExportedData: buffer}); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}
}

func (svc *service) MediaPrepare(srv messengertypes.MessengerService_MediaPrepareServer) error {
	// read header
	header, err := srv.Recv()
	if err != nil {
		return errcode.ErrStreamHeaderRead.Wrap(err)
	}
	if len(header.GetBlock()) > 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected empty block, got %v bytes", len(header.GetBlock())))
	}
	if header.GetInfo() == nil {
		return errcode.ErrInvalidInput.Wrap(errors.New("nil info"))
	}

	var file io.ReadCloser
	if header.GetUri() != "" {
		// open uri file
		path := header.GetUri()
		u, err := url.Parse(header.GetUri())
		if err == nil && u.Scheme == "file" {
			path = u.Path
		}
		file, err = os.Open(path)
		if err != nil {
			return errcode.ErrInvalidInput.Wrap(err)
		}
	} else {
		// open requests reader
		file = streamutil.FuncReader(func() ([]byte, error) {
			req, err := srv.Recv()
			return req.GetBlock(), err
		}, svc.logger)
	}
	defer file.Close()

	// upload media and get cid in return
	cidBytes, err := svc.attachmentPrepare(file)
	if err != nil {
		return errcode.ErrAttachmentPrepare.Wrap(err)
	}
	cid := b64EncodeBytes(cidBytes)

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()

	return svc.db.tx(func(tx *dbWrapper) error {
		// add to db
		media := *header.Info
		media.CID = cid
		media.State = messengertypes.Media_StatePrepared
		added, err := tx.addMedias([]*messengertypes.Media{&media})
		if err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		// dispatch event if new
		if added[0] {
			if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeMediaUpdated, &messengertypes.StreamEvent_MediaUpdated{Media: &media}, true); err != nil {
				svc.logger.Error("unable to dispatch notification for media", zap.String("cid", media.CID), zap.Error(err))
			}
		}

		// reply
		if err := srv.SendAndClose(&messengertypes.MediaPrepare_Reply{Cid: cid}); err != nil {
			return errcode.ErrStreamSendAndClose.Wrap(err)
		}

		// success
		return nil
	})
}

func (svc *service) MediaRetrieve(req *messengertypes.MediaRetrieve_Request, srv messengertypes.MessengerService_MediaRetrieveServer) error {
	var attachment *io.PipeReader
	if err := func() error {
		svc.handlerMutex.Lock()
		defer svc.handlerMutex.Unlock()

		// prepare header
		medias, err := svc.db.getMedias([]string{req.GetCid()})
		if err != nil {
			return errcode.ErrInvalidInput.Wrap(err)
		}
		if len(medias) == 0 {
			return errcode.ErrInternal.Wrap(err)
		}
		media := medias[0]

		// send header
		if err := srv.Send(&messengertypes.MediaRetrieve_Reply{Info: media}); err != nil {
			return errcode.ErrStreamHeaderWrite.Wrap(err)
		}

		// open download
		if attachment, err = svc.attachmentRetrieve(req.GetCid()); err != nil {
			return errcode.ErrAttachmentRetrieve.Wrap(err)
		}
		return nil
	}(); err != nil {
		return err
	}
	defer attachment.Close()

	// stream to client
	if err := streamutil.FuncSink(make([]byte, 64*1024), attachment, func(b []byte) error {
		return srv.Send(&messengertypes.MediaRetrieve_Reply{Block: b})
	}); err != nil {
		return errcode.ErrStreamSink.Wrap(err)
	}

	// success
	return nil
}

func (svc *service) ConversationLoad(ctx context.Context, request *messengertypes.ConversationLoad_Request) (*messengertypes.ConversationLoad_Reply, error) {
	if request.Options.ConversationPK == "" && request.Options.RefCID == "" {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no conversation pk or ref cid specified"))
	}

	interactions, medias, err := svc.db.getPaginatedInteractions(request.Options)
	if err != nil {
		return nil, err
	}

	if len(interactions) == 0 {
		return nil, errcode.ErrNotFound.Wrap(fmt.Errorf("nothing to return"))
	}

	if !request.Options.NoBulk {
		if medias == nil {
			medias = []*messengertypes.Media{}
		}

		if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationPartialLoad, &messengertypes.StreamEvent_ConversationPartialLoad{
			ConversationPK: interactions[0].ConversationPublicKey,
			Interactions:   interactions,
			Medias:         medias,
		}, false); err != nil {
			svc.logger.Error("unable to bulk send conversation events", zap.Error(err))
			return nil, errcode.ErrInternal.Wrap(err)
		}
	} else {
		svc.logger.Info("sending found interactions", zap.Int("count", len(interactions)))
		for _, inte := range interactions {
			if err := svc.streamInteraction(svc.db, inte.CID, false); err != nil {
				return nil, err
			}
		}

		svc.logger.Info("sending found medias", zap.Int("count", len(medias)))
		for _, media := range medias {
			if err := svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeMediaUpdated, &messengertypes.StreamEvent_MediaUpdated{Media: media}, false); err != nil {
				return nil, err
			}
		}
	}

	return &messengertypes.ConversationLoad_Reply{}, nil
}

func (svc *service) MediaGetRelated(ctx context.Context, request *messengertypes.MediaGetRelated_Request) (*messengertypes.MediaGetRelated_Reply, error) {
	media, err := svc.db.getNextMedia(request.CID, nextMediaOpts{
		fileNames: request.FileNames,
		mimeTypes: request.MimeTypes,
	})
	if err != nil || media == nil {
		if err != nil {
			svc.logger.Error("unable to retrieve next audio message", zap.Error(err))
		}

		return &messengertypes.MediaGetRelated_Reply{End: true}, nil
	}

	return &messengertypes.MediaGetRelated_Reply{Media: media}, nil
}
