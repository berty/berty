package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync/atomic"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

func handlerAccountGroupJoined(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountGroupJoined{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("joined a group"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	v.v.AddContextGroup(ctx, casted.Group)
	v.v.recomputeChannelList(false)

	return nil
}

func handlerGroupDeviceChainKeyAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.GroupDeviceChainKeyAdded{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	v.muAggregates.Lock()
	v.secrets[string(casted.DevicePk)] = casted
	v.muAggregates.Unlock()

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("has exchanged a secret"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	return nil
}

func handlerGroupMemberDeviceAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.GroupMemberDeviceAdded{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	v.muAggregates.Lock()
	v.devices[string(casted.DevicePk)] = casted
	v.muAggregates.Unlock()

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("new device joined the group"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	return nil
}

func handlerAccountContactRequestOutgoingSent(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestOutgoingSent{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("outgoing contact request sent"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPk: casted.ContactPk,
	})
	if err != nil {
		return err
	}

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPk)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPk)] = protocoltypes.ContactState_ContactStateAdded
	}

	v.v.lock.Unlock()

	v.v.AddContextGroup(ctx, gInfo.Group)
	v.v.recomputeChannelList(true)

	return nil
}

func handlerAccountGroupLeft(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountGroupLeft{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("left group %s", base64.StdEncoding.EncodeToString(casted.GroupPk))),
		sender:      casted.DevicePk,
	}, v, isHistory)

	return nil
}

func handlerAccountContactRequestIncomingReceived(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestIncomingReceived{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	name := string(casted.ContactMetadata)

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("incoming request received %s, type /contact accept %s (alt. /contact discard <id>)", name, base64.StdEncoding.EncodeToString(casted.ContactPk))),
		sender:      casted.DevicePk,
	}, v, isHistory)

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPk)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPk)] = protocoltypes.ContactState_ContactStateReceived
	}
	v.v.lock.Unlock()

	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPk: casted.ContactPk,
	})

	if err == nil {
		v.v.lock.Lock()
		if _, hasValue := v.v.contactNames[string(gInfo.Group.PublicKey)]; (!hasValue || !isHistory) && len(casted.ContactMetadata) > 0 {
			v.v.contactNames[string(gInfo.Group.PublicKey)] = string(casted.ContactMetadata)
		}
		v.v.lock.Unlock()
	}

	return nil
}

func handlerAccountContactRequestIncomingDiscarded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestIncomingDiscarded{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("incoming request discarded, contact: %s", base64.StdEncoding.EncodeToString(casted.ContactPk))),
		sender:      casted.DevicePk,
	}, v, isHistory)

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPk)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPk)] = protocoltypes.ContactState_ContactStateRemoved
	}
	v.v.lock.Unlock()

	return nil
}

func handlerMultiMemberGroupInitialMemberAnnounced(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.MultiMemberGroupInitialMemberAnnounced{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("member claimed group ownership"),
		sender:      casted.MemberPk,
	}, v, isHistory)

	return nil
}

func handlerAccountContactRequestOutgoingEnqueued(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestOutgoingEnqueued{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}
	if casted.Contact == nil {
		return errcode.ErrCode_ErrInvalidInput
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("outgoing contact request enqueued (%s)", base64.StdEncoding.EncodeToString(casted.Contact.Pk))),
		sender:      casted.DevicePk,
	}, v, isHistory)

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("fake request on the other end by typing `/contact received` with the value of `/contact share`"),
		sender:      casted.DevicePk,
	}, v, false)

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.Contact.Pk)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.Contact.Pk)] = protocoltypes.ContactState_ContactStateToRequest
	}
	v.v.lock.Unlock()

	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPk: casted.Contact.Pk,
	})

	if err == nil {
		v.v.AddContextGroup(ctx, gInfo.Group)
		v.v.recomputeChannelList(true)

		v.v.lock.Lock()
		if _, hasValue := v.v.contactNames[string(gInfo.Group.PublicKey)]; (!hasValue || !isHistory) && len(casted.Contact.Metadata) > 0 {
			v.v.contactNames[string(gInfo.Group.PublicKey)] = string(casted.Contact.Metadata)
		}

		v.v.lock.Unlock()
	}

	return nil
}

func handlerContactAliasKeyAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.ContactAliasKeyAdded{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("contact alias public key received"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	return nil
}

func handlerMultiMemberGroupAliasResolverAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.MultiMemberGroupAliasResolverAdded{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("contact alias proof received"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	return nil
}

func handlerAccountContactRequestIncomingAccepted(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestOutgoingSent{}
	if err := proto.Unmarshal(e.Event, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("incoming contact request accepted"),
		sender:      casted.DevicePk,
	}, v, isHistory)

	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPk: casted.ContactPk,
	})
	if err != nil {
		return err
	}

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPk)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPk)] = protocoltypes.ContactState_ContactStateAdded
	}
	v.v.lock.Unlock()

	v.v.AddContextGroup(ctx, gInfo.Group)
	v.v.recomputeChannelList(false)

	return nil
}

func handlerNoop(_ context.Context, _ *groupView, _ *protocoltypes.GroupMetadataEvent, _ bool) error {
	return nil
}

func groupDeviceStatusHandler(logger *zap.Logger, v *groupView, e *protocoltypes.GroupDeviceStatus_Reply) {
	var payload string

	switch t := e.GetType(); t {
	case protocoltypes.GroupDeviceStatus_TypePeerConnected:
		event := &protocoltypes.GroupDeviceStatus_Reply_PeerConnected{}
		if err := proto.Unmarshal(e.GetEvent(), event); err != nil {
			logger.Error("unmarshal error", zap.Error(err))
			return
		}

		activeAddr := "<unknown>"
		if maddrs := event.GetMaddrs(); len(maddrs) > 0 {
			activeAddr = maddrs[0]
		}

		activeTransport := "<unknown>"
		if tpts := event.GetTransports(); len(tpts) > 0 {
			activeTransport = tpts[0].String()
		}

		payload = fmt.Sprintf("device status updated: connected <%.15s> on: %s(%s)", event.GetPeerId(), activeAddr, activeTransport)

	case protocoltypes.GroupDeviceStatus_TypePeerDisconnected:
		event := &protocoltypes.GroupDeviceStatus_Reply_PeerDisconnected{}
		if err := proto.Unmarshal(e.GetEvent(), event); err != nil {
			logger.Error("unmarshal error", zap.Error(err))
			return
		}
		payload = fmt.Sprintf("device status updated: left <%.15s>", event.GetPeerId())

	case protocoltypes.GroupDeviceStatus_TypePeerReconnecting:
		event := &protocoltypes.GroupDeviceStatus_Reply_PeerReconnecting{}
		if err := proto.Unmarshal(e.GetEvent(), event); err != nil {
			logger.Error("unmarshal error", zap.Error(err))
			return
		}
		payload = fmt.Sprintf("device status updated: reconnecting <%.15s>", event.GetPeerId())
	default:
		logger.Warn("unknow group device status event received")
		return
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(payload),
	})
}

func metadataEventHandler(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool, logger *zap.Logger) {
	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("event type: %s", e.Metadata.EventType.String())),
	}, v, isHistory)

	actions := map[protocoltypes.EventType]func(context.Context, *groupView, *protocoltypes.GroupMetadataEvent, bool) error{
		protocoltypes.EventType_EventTypeAccountContactBlocked:                  nil, // do it later
		protocoltypes.EventType_EventTypeAccountContactRequestDisabled:          handlerNoop,
		protocoltypes.EventType_EventTypeAccountContactRequestEnabled:           handlerNoop,
		protocoltypes.EventType_EventTypeAccountContactRequestIncomingAccepted:  handlerAccountContactRequestIncomingAccepted,
		protocoltypes.EventType_EventTypeAccountContactRequestIncomingDiscarded: handlerAccountContactRequestIncomingDiscarded,
		protocoltypes.EventType_EventTypeAccountContactRequestIncomingReceived:  handlerAccountContactRequestIncomingReceived,
		protocoltypes.EventType_EventTypeAccountContactRequestOutgoingEnqueued:  handlerAccountContactRequestOutgoingEnqueued,
		protocoltypes.EventType_EventTypeAccountContactRequestOutgoingSent:      handlerAccountContactRequestOutgoingSent,
		protocoltypes.EventType_EventTypeAccountContactRequestReferenceReset:    handlerNoop,
		protocoltypes.EventType_EventTypeAccountContactUnblocked:                nil, // do it later
		protocoltypes.EventType_EventTypeAccountGroupJoined:                     handlerAccountGroupJoined,
		protocoltypes.EventType_EventTypeAccountGroupLeft:                       handlerAccountGroupLeft,
		protocoltypes.EventType_EventTypeContactAliasKeyAdded:                   handlerContactAliasKeyAdded,
		protocoltypes.EventType_EventTypeGroupDeviceChainKeyAdded:               handlerGroupDeviceChainKeyAdded,
		protocoltypes.EventType_EventTypeGroupMemberDeviceAdded:                 handlerGroupMemberDeviceAdded,
		protocoltypes.EventType_EventTypeGroupMetadataPayloadSent:               nil, // do it later
		protocoltypes.EventType_EventTypeMultiMemberGroupAdminRoleGranted:       nil, // do it later
		protocoltypes.EventType_EventTypeMultiMemberGroupAliasResolverAdded:     handlerMultiMemberGroupAliasResolverAdded,
		protocoltypes.EventType_EventTypeMultiMemberGroupInitialMemberAnnounced: handlerMultiMemberGroupInitialMemberAnnounced,
	}
	logger.Debug("metadataEventHandler", zap.Stringer("event-type", e.Metadata.EventType))

	action, ok := actions[e.Metadata.EventType]
	if !ok || action == nil {
		v.messages.AppendErr(fmt.Errorf("action handler for %s not found", e.Metadata.EventType.String()))
		v.addBadge()
		return
	}

	if err := action(ctx, v, e, isHistory); err != nil {
		v.messages.AppendErr(fmt.Errorf("error while handling metadata event (type: %s): %w", e.Metadata.EventType.String(), err))
		v.addBadge()
	}
}

func addToBuffer(evt *historyMessage, v *groupView, isHistory bool) {
	if isHistory {
		v.messages.Prepend(evt, time.Time{})
	} else {
		v.messages.Append(evt)
		v.addBadge()
	}
}

func (v *groupView) addBadge() {
	// Display unread badge
	recompute := false
	v.v.lock.Lock()
	if v.v.selectedGroupView != v {
		atomic.StoreInt32(&v.hasNew, 1)
		recompute = true
	}
	v.v.lock.Unlock()

	if recompute {
		v.v.recomputeChannelList(true)
	}
}

func streamEventHandler(ctx context.Context, v *groupView, e *messengertypes.EventStream_Reply, isHistory bool, logger *zap.Logger) {
	streamEvent := e.GetEvent()

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("event type: %s", streamEvent.GetType().String())),
	}, v, isHistory)

	actions := map[messengertypes.StreamEvent_Type]func(context.Context, *groupView, *messengertypes.StreamEvent, bool) error{
		messengertypes.StreamEvent_TypeServiceTokenAdded: handlerServiceTokenAdded,
	}
	logger.Debug("StreamEventHandler", zap.Stringer("event-type", streamEvent.GetType()))

	action, ok := actions[streamEvent.GetType()]
	if !ok || action == nil {
		v.messages.AppendErr(fmt.Errorf("action handler for %s not found", streamEvent.GetType().String()))
		v.addBadge()
		return
	}

	if err := action(ctx, v, streamEvent, isHistory); err != nil {
		v.messages.AppendErr(fmt.Errorf("error while handling metadata event (type: %s): %w", streamEvent.GetType().String(), err))
		v.addBadge()
	}
}

func handlerServiceTokenAdded(_ context.Context, v *groupView, e *messengertypes.StreamEvent, isHistory bool) error {
	casted := &messengertypes.StreamEvent_ServiceTokenAdded{}
	if err := proto.Unmarshal(e.Payload, casted); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("service token registered for account (%s: auth via %s)", casted.Token.TokenId, casted.Token.AuthenticationUrl)),
	}, v, isHistory)

	for _, s := range casted.Token.SupportedServices {
		addToBuffer(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf(" - %s, %s", s.Type, s.Address)),
		}, v, isHistory)
	}

	return nil
}
