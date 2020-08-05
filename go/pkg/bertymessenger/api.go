package bertymessenger

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/url"
	"os"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"berty.tech/berty/v2/go/internal/discordlog"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
	"moul.io/godev"
	"moul.io/openfiles"
)

func (s *service) DevShareInstanceBertyID(ctx context.Context, req *DevShareInstanceBertyID_Request) (*DevShareInstanceBertyID_Reply, error) {
	ret, err := s.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{
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

func (s *service) InstanceShareableBertyID(ctx context.Context, req *InstanceShareableBertyID_Request) (*InstanceShareableBertyID_Reply, error) {
	if req == nil {
		req = &InstanceShareableBertyID_Request{}
	}
	config, err := s.protocolClient.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	s.logger.Debug("enable contact request (may be already done)")
	_, err = s.protocolClient.ContactRequestEnable(ctx, &bertytypes.ContactRequestEnable_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if req.Reset_ {
		s.logger.Info("reset contact reference")
		_, err = s.protocolClient.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	res, err := s.protocolClient.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// if this call does not return a PublicRendezvousSeed, then we need to call Reset
	if res.PublicRendezvousSeed == nil {
		s.logger.Info("reset contact reference")
		_, err = s.protocolClient.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}
	res, err = s.protocolClient.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
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
	ret.BertyIDPayload = base64.StdEncoding.EncodeToString(bertyIDPayloadBytes)

	// create QRCodes with standalone display_name variable
	lightID := BertyID{
		PublicRendezvousSeed: ret.BertyID.PublicRendezvousSeed,
		AccountPK:            ret.BertyID.AccountPK,
	}
	lightIDBytes, _ := proto.Marshal(&lightID)
	lightIDPayload := base64.StdEncoding.EncodeToString(lightIDBytes)
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

func (s *service) ParseDeepLink(ctx context.Context, req *ParseDeepLink_Request) (*ParseDeepLink_Reply, error) {
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
		payload, err := base64.StdEncoding.DecodeString(key)
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
	payload, err := base64.StdEncoding.DecodeString(invite)

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

func (s *service) ShareableBertyGroup(ctx context.Context, request *ShareableBertyGroup_Request) (*ShareableBertyGroup_Reply, error) {
	if request == nil {
		return nil, errcode.ErrInvalidInput
	}

	grpInfo, err := s.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
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

	rep.BertyGroupPayload = base64.StdEncoding.EncodeToString(bertyGroupPayload)
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

	inviteB64 := base64.StdEncoding.EncodeToString(invite)

	v := url.Values{}
	v.Set("invite", url.QueryEscape(inviteB64)) // double-encoding to keep "+" as "+" and not as spaces
	if groupName != "" {
		v.Set("name", groupName)
	}

	fragment := v.Encode()

	return fmt.Sprintf("berty://group/#%s", fragment), fmt.Sprintf("https://berty.tech/group#%s", fragment), nil
}

// maybe we should preserve the previous generic api
func (s *service) SendContactRequest(ctx context.Context, req *SendContactRequest_Request) (*SendContactRequest_Reply, error) {
	if req == nil || req.BertyID == nil || req.BertyID.AccountPK == nil || req.BertyID.PublicRendezvousSeed == nil {
		return nil, errcode.ErrMissingInput
	}

	contactRequest := bertytypes.ContactRequestSend_Request{
		Contact: &bertytypes.ShareableContact{
			PK:                   req.BertyID.AccountPK,
			PublicRendezvousSeed: req.BertyID.PublicRendezvousSeed,
			Metadata:             req.Metadata,
		},
		OwnMetadata: req.OwnMetadata,
	}
	_, err := s.protocolClient.ContactRequestSend(ctx, &contactRequest)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &SendContactRequest_Reply{}, nil
}

func (s *service) SystemInfo(ctx context.Context, req *SystemInfo_Request) (*SystemInfo_Reply, error) {
	// rlimit
	rlimitNofile := syscall.Rlimit{}
	_ = syscall.Getrlimit(syscall.RLIMIT_NOFILE, &rlimitNofile)

	// rusage
	selfUsage := syscall.Rusage{}
	_ = syscall.Getrusage(syscall.RUSAGE_SELF, &selfUsage)
	childrenUsage := syscall.Rusage{}
	_ = syscall.Getrusage(syscall.RUSAGE_CHILDREN, &childrenUsage)

	nofile, nofileErr := openfiles.Count()

	hn, _ := os.Hostname()
	reply := SystemInfo_Reply{
		SelfRusage:       godev.JSON(selfUsage),
		ChildrenRusage:   godev.JSON(childrenUsage),
		RlimitCur:        rlimitNofile.Cur,
		Nofile:           nofile,
		TooManyOpenFiles: openfiles.IsTooManyError(nofileErr),
		StartedAt:        s.startedAt.Unix(),
		NumCPU:           int64(runtime.NumCPU()),
		GoVersion:        runtime.Version(),
		HostName:         hn,
		NumGoroutine:     int64(runtime.NumGoroutine()),
		OperatingSystem:  runtime.GOOS,
		Arch:             runtime.GOARCH,
		Version:          Version,
		VcsRef:           VcsRef,
		RlimitMax:        rlimitNofile.Max,
	}
	if BuildTime != "n/a" {
		buildTime, err := strconv.Atoi(BuildTime)
		if err == nil {
			reply.BuildTime = int64(buildTime)
		}
	}
	if s.protocolService != nil && s.protocolService.IpfsCoreAPI() != nil {
		api := s.protocolService.IpfsCoreAPI()
		peers, _ := api.Swarm().Peers(ctx)
		reply.ConnectedPeers = int64(len(peers))
	}

	return &reply, nil
}

func (s *service) SendAck(ctx context.Context, request *SendAck_Request) (*SendAck_Reply, error) {
	gInfo, err := s.protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: request.GroupPK,
	})

	if err != nil {
		return nil, err
	}

	if gInfo.Group.GroupType != bertytypes.GroupTypeContact {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("only %s groups are supported", bertytypes.GroupTypeContact.String()))
	}

	am, err := AppMessage_TypeAcknowledge.MarshalPayload(&AppMessage_Acknowledge{
		Target: base64.StdEncoding.EncodeToString(request.MessageID),
	})
	if err != nil {
		return nil, err
	}

	_, err = s.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: request.GroupPK,
		Payload: am,
	})

	return nil, err
}

func (s *service) SendMessage(ctx context.Context, request *SendMessage_Request) (*SendMessage_Reply, error) {
	payload, err := AppMessage_TypeUserMessage.MarshalPayload(&AppMessage_UserMessage{
		Body:        request.Message,
		Attachments: nil,
		SentDate:    time.Now().UnixNano() / 1000000,
	})
	if err != nil {
		return nil, err
	}

	_, err = s.protocolClient.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: request.GroupPK,
		Payload: payload,
	})

	return nil, err
}

func (s *service) ConversationStream(req *ConversationStream_Request, sub MessengerService_ConversationStreamServer) error {
	// TODO: cursors

	// send existing convs
	var convs []*Conversation
	if err := s.db.Find(&convs).Error; err != nil {
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
	unreg := s.dispatcher.Register(&n)
	defer unreg()

	// don't return until we have a send error or the context is canceled
	select {
	case e := <-errch:
		return e
	case <-sub.Context().Done():
		return nil
	}
}

func (s *service) EventStream(req *EventStream_Request, sub MessengerService_EventStreamServer) error {
	// TODO: cursors

	// TODO: send existing models

	// FIXME: case where a conversation is created/updated/deleted between the list and the stream
	// dunno how to add a test to trigger, maybe it can never happen? don't know how to prove either way

	// stream new convs
	errch := make(chan error)
	defer close(errch)
	n := NotifieeBundle{StreamEventImpl: func(e *StreamEvent) error {
		err := sub.Send(&EventStream_Reply{Event: e})
		if err != nil {
			// next commmented line allows me to manually test the behavior on a send error. How to isolate into an automatic test?
			// errch <- errors.New("TEST ERROR")
			errch <- err
		}
		return nil
	}}
	unreg := s.dispatcher.Register(&n)
	defer unreg()

	// don't return until we have a send error or the context is canceled
	select {
	case e := <-errch:
		return e
	case <-sub.Context().Done():
		return nil
	}
}

func (s *service) ConversationCreate(ctx context.Context, req *ConversationCreate_Request) (*ConversationCreate_Reply, error) {
	dn := req.GetDisplayName()

	// Create a multimember group
	cr, err := s.protocolClient.MultiMemberGroupCreate(ctx, &bertytypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return nil, err
	}
	pk := cr.GetGroupPK()
	pkStr := base64.StdEncoding.EncodeToString(pk)
	s.logger.Info("Created conv", zap.String("dn", req.GetDisplayName()), zap.String("pk", pkStr))

	// Add conversation to database
	conv := &Conversation{PublicKey: pkStr, DisplayName: dn}
	if err = s.db.Save(conv).Error; err != nil {
		return nil, err
	}

	// Dispatch new conversation
	{
		payload, err := proto.Marshal(&StreamEvent_ConversationUpdated{conv})
		if err != nil {
			s.logger.Error("Failed to marshal ConversationUpdated", zap.Error(err))
		} else {
			s.dispatcher.StreamEvent(&StreamEvent{Type: StreamEvent_TypeConversationUpdated, Payload: payload})
		}
	}

	// Try to put group name in group metadata
	{
		am, err := AppMessage_TypeSetGroupName.MarshalPayload(&AppMessage_SetGroupName{Name: dn})
		if err != nil {
			s.logger.Error("failed to create SetGroupName payload", zap.Error(err))
		} else {
			_, err = s.protocolClient.AppMetadataSend(ctx, &bertytypes.AppMetadataSend_Request{GroupPK: pk, Payload: am})
			if err != nil {
				s.logger.Error("failed to set group name", zap.Error(err))
			}
		}
	}

	/* There is a tradoff between privacy and log size here, we could send the user name as a message but it would require
	** to re-add the name to the log everytime a new user arrives in the conversation which is bad for large public groups
	** It would make sense to offer it as an option for privacy sensitive groups of small sizes though
	** In the case that the group invitation leaks after an user leaves it, this user's name will be inaccessible to new users joining the group
	 */

	// Try to put user name in group metadata
	var acc Account
	if err = s.db.First(&acc).Error; err != nil {
		s.logger.Warn("failed to get account name", zap.Error(err))
	} else {
		am, err := AppMessage_TypeSetUserName.MarshalPayload(&AppMessage_SetUserName{Name: acc.GetDisplayName()})
		if err != nil {
			s.logger.Error("failed to create SetUserName payload", zap.Error(err))
		} else {
			_, err = s.protocolClient.AppMetadataSend(ctx, &bertytypes.AppMetadataSend_Request{GroupPK: pk, Payload: am})
			if err != nil {
				s.logger.Warn("Failed to set user name in group", zap.Error(err))
			}
		}
	}

	rep := ConversationCreate_Reply{PublicKey: pkStr}
	return &rep, nil
}

func (s *service) AccountGet(ctx context.Context, req *AccountGet_Request) (*AccountGet_Reply, error) {
	var acc Account
	if err := s.db.First(&acc).Error; err != nil {
		return nil, err
	}
	return &AccountGet_Reply{Account: &acc}, nil
}
