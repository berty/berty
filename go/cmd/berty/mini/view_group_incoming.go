package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync/atomic"
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func handlerAccountGroupJoined(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountGroupJoined{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("joined a group"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	v.v.AddContextGroup(ctx, casted.Group)
	v.v.recomputeChannelList(false)

	return nil
}

func handlerGroupDeviceSecretAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.GroupAddDeviceSecret{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	v.muAggregates.Lock()
	v.secrets[string(casted.DevicePK)] = casted
	v.muAggregates.Unlock()

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("has exchanged a secret"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerGroupMemberDeviceAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.GroupAddMemberDevice{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	v.muAggregates.Lock()
	v.devices[string(casted.DevicePK)] = casted
	v.muAggregates.Unlock()

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("new device joined the group"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerAccountContactRequestOutgoingSent(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestSent{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("outgoing contact request sent"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPK: casted.ContactPK,
	})
	if err != nil {
		return err
	}

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPK)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPK)] = protocoltypes.ContactStateAdded
	}

	v.v.lock.Unlock()

	v.v.AddContextGroup(ctx, gInfo.Group)
	v.v.recomputeChannelList(true)

	return nil
}

func handlerAccountGroupLeft(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountGroupLeft{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("left group %s", base64.StdEncoding.EncodeToString(casted.GroupPK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerAccountContactRequestIncomingReceived(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestReceived{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	name := string(casted.ContactMetadata)

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("incoming request received %s, type /contact accept %s (alt. /contact discard <id>)", name, base64.StdEncoding.EncodeToString(casted.ContactPK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPK)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPK)] = protocoltypes.ContactStateReceived
	}
	v.v.lock.Unlock()

	v.v.lock.Lock()
	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPK: casted.ContactPK,
	})

	if err == nil {
		if _, hasValue := v.v.contactNames[string(gInfo.Group.PublicKey)]; (!hasValue || !isHistory) && len(casted.ContactMetadata) > 0 {
			v.v.contactNames[string(gInfo.Group.PublicKey)] = string(casted.ContactMetadata)
		}
	}
	v.v.lock.Unlock()

	return nil
}

func handlerAccountContactRequestIncomingDiscarded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestDiscarded{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("incoming request discarded, contact: %s", base64.StdEncoding.EncodeToString(casted.ContactPK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPK)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPK)] = protocoltypes.ContactStateRemoved
	}
	v.v.lock.Unlock()

	return nil
}

func handlerMultiMemberGroupInitialMemberAnnounced(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.MultiMemberInitialMember{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("member claimed group ownership"),
		sender:      casted.MemberPK,
	}, e, v, isHistory)

	return nil
}

func handlerAccountContactRequestOutgoingEnqueued(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestEnqueued{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}
	if casted.Contact == nil {
		return errcode.ErrInvalidInput
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("outgoing contact request enqueued (%s)", base64.StdEncoding.EncodeToString(casted.Contact.PK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("fake request on the other end by typing `/contact received` with the value of `/contact share`"),
		sender:      casted.DevicePK,
	}, nil, v, false)

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.Contact.PK)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.Contact.PK)] = protocoltypes.ContactStateToRequest
	}
	v.v.lock.Unlock()

	v.v.lock.Lock()
	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPK: casted.Contact.PK,
	})

	if err == nil {
		if _, hasValue := v.v.contactNames[string(gInfo.Group.PublicKey)]; (!hasValue || !isHistory) && len(casted.Contact.Metadata) > 0 {
			v.v.contactNames[string(gInfo.Group.PublicKey)] = string(casted.Contact.Metadata)
		}
	}
	v.v.lock.Unlock()

	return nil
}

func handlerContactAliasKeyAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.ContactAddAliasKey{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("contact alias public key received"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerMultiMemberGroupAliasResolverAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.MultiMemberGroupAddAliasResolver{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("contact alias proof received"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerAccountContactRequestIncomingAccepted(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountContactRequestSent{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("incoming contact request accepted"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	gInfo, err := v.v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		ContactPK: casted.ContactPK,
	})
	if err != nil {
		return err
	}

	v.v.lock.Lock()
	if _, hasValue := v.v.contactStates[string(casted.ContactPK)]; !hasValue || !isHistory {
		v.v.contactStates[string(casted.ContactPK)] = protocoltypes.ContactStateAdded
	}
	v.v.lock.Unlock()

	v.v.AddContextGroup(ctx, gInfo.Group)
	v.v.recomputeChannelList(false)

	return nil
}

func handlerNoop(_ context.Context, _ *groupView, _ *protocoltypes.GroupMetadataEvent, _ bool) error {
	return nil
}

func groupMonitorEventHandler(logger *zap.Logger, v *groupView, e *protocoltypes.MonitorGroup_EventMonitor) {
	var payload string

	switch t := e.GetType(); t {
	case protocoltypes.TypeEventMonitorPeerJoin:
		peerjoin := e.GetPeerJoin()
		if peerjoin.IsSelf {
			payload = "you just joined this group"
		} else {
			activeAddr := "<unknown>"
			if len(peerjoin.GetMaddrs()) > 0 {
				activeAddr = peerjoin.Maddrs[0]
			}
			payload = fmt.Sprintf("peer joined <%.15s> on: %s", peerjoin.GetPeerID(), activeAddr)
		}

	case protocoltypes.TypeEventMonitorPeerLeave:
		peerleave := e.GetPeerLeave()
		if peerleave.IsSelf {
			payload = "you just left this group"
		} else {
			payload = fmt.Sprintf("peer left <%.15s>", peerleave.GetPeerID())
		}
	case protocoltypes.TypeEventMonitorAdvertiseGroup:
		advertisegroup := e.GetAdvertiseGroup()
		drivername := advertisegroup.GetDriverName()
		if drivername != "" {
			payload = fmt.Sprintf("local peer advertised <%.15s> on `%s`, with %d maddrs",
				advertisegroup.GetPeerID(), advertisegroup.GetDriverName(), len(advertisegroup.GetMaddrs()))
		} else {
			payload = fmt.Sprintf("local peer advertised <%.15s>", advertisegroup.GetPeerID())
		}

	case protocoltypes.TypeEventMonitorPeerFound:
		peerfound := e.GetPeerFound()
		drivername := peerfound.GetDriverName()
		if drivername != "" {
			payload = fmt.Sprintf("new peer found <%.15s> on `%s`, with %d maddrs",
				peerfound.GetPeerID(), drivername, len(peerfound.GetMaddrs()))
		} else {
			payload = fmt.Sprintf("grabbed a peer <%.15s> ", peerfound.GetPeerID())
		}
	default:
		logger.Warn("unknow monitor event received")
		return
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(payload),
	})
}

func metadataEventHandler(ctx context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool, logger *zap.Logger) {
	actions := map[protocoltypes.EventType]func(context.Context, *groupView, *protocoltypes.GroupMetadataEvent, bool) error{
		protocoltypes.EventTypeAccountContactBlocked:                  nil, // do it later
		protocoltypes.EventTypeAccountContactRequestDisabled:          handlerNoop,
		protocoltypes.EventTypeAccountContactRequestEnabled:           handlerNoop,
		protocoltypes.EventTypeAccountContactRequestIncomingAccepted:  handlerAccountContactRequestIncomingAccepted,
		protocoltypes.EventTypeAccountContactRequestIncomingDiscarded: handlerAccountContactRequestIncomingDiscarded,
		protocoltypes.EventTypeAccountContactRequestIncomingReceived:  handlerAccountContactRequestIncomingReceived,
		protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued:  handlerAccountContactRequestOutgoingEnqueued,
		protocoltypes.EventTypeAccountContactRequestOutgoingSent:      handlerAccountContactRequestOutgoingSent,
		protocoltypes.EventTypeAccountContactRequestReferenceReset:    handlerNoop,
		protocoltypes.EventTypeAccountContactUnblocked:                nil, // do it later
		protocoltypes.EventTypeAccountGroupJoined:                     handlerAccountGroupJoined,
		protocoltypes.EventTypeAccountGroupLeft:                       handlerAccountGroupLeft,
		protocoltypes.EventTypeContactAliasKeyAdded:                   handlerContactAliasKeyAdded,
		protocoltypes.EventTypeGroupDeviceSecretAdded:                 handlerGroupDeviceSecretAdded,
		protocoltypes.EventTypeGroupMemberDeviceAdded:                 handlerGroupMemberDeviceAdded,
		protocoltypes.EventTypeGroupMetadataPayloadSent:               nil, // do it later
		protocoltypes.EventTypeMultiMemberGroupAdminRoleGranted:       nil, // do it later
		protocoltypes.EventTypeMultiMemberGroupAliasResolverAdded:     handlerMultiMemberGroupAliasResolverAdded,
		protocoltypes.EventTypeMultiMemberGroupInitialMemberAnnounced: handlerMultiMemberGroupInitialMemberAnnounced,
		protocoltypes.EventTypeAccountServiceTokenAdded:               handlerAccountServiceTokenAdded,
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

func handlerAccountServiceTokenAdded(_ context.Context, v *groupView, e *protocoltypes.GroupMetadataEvent, isHistory bool) error {
	casted := &protocoltypes.AccountServiceTokenAdded{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("service token registered for account (%s: auth via %s)", casted.ServiceToken.TokenID(), casted.ServiceToken.AuthenticationURL)),
	}, e, v, isHistory)

	for _, s := range casted.ServiceToken.SupportedServices {
		addToBuffer(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf(" - %s, %s", s.ServiceType, s.ServiceEndpoint)),
		}, e, v, isHistory)
	}

	return nil
}

func addToBuffer(evt *historyMessage, _ *protocoltypes.GroupMetadataEvent, v *groupView, isHistory bool) {
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
