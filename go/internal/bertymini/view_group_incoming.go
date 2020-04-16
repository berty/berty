package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"time"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"go.uber.org/zap"
)

func handlerAccountGroupJoined(ctx context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountGroupJoined{}
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

func handlerGroupDeviceSecretAdded(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.GroupAddDeviceSecret{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("has exchanged a secret"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerGroupMemberDeviceAdded(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.GroupAddMemberDevice{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("new device joined the group"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerAccountContactRequestOutgoingSent(ctx context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountContactRequestSent{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("outgoing contact request sent"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	gInfo, err := v.v.client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		ContactPK: casted.ContactPK,
	})

	if err != nil {
		return err
	}

	v.v.AddContextGroup(ctx, gInfo.Group)
	v.v.recomputeChannelList(true)

	return nil
}

func handlerAccountContactRequestStatusChanged(ctx context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	_ = e
	_ = isHistory
	return contactShareCommand(ctx, v, "")
}

func handlerAccountGroupLeft(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountGroupLeft{}
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

func handlerAccountContactRequestIncomingReceived(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountContactRequestReceived{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("incoming request received, type /contact {accept,discard} %s", base64.StdEncoding.EncodeToString(casted.ContactPK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerAccountContactRequestIncomingDiscarded(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountContactRequestDiscarded{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("incoming request discarded, contact: %s", base64.StdEncoding.EncodeToString(casted.ContactPK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerMultiMemberGroupInitialMemberAnnounced(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.MultiMemberInitialMember{}
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

func handlerAccountContactRequestOutgoingEnqueued(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountContactRequestEnqueued{}
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

	return nil
}

func handlerContactAliasKeyAdded(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.ContactAddAliasKey{}
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

func handlerMultiMemberGroupAliasResolverAdded(_ context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.MultiMemberGroupAddAliasResolver{}
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

func handlerAccountContactRequestIncomingAccepted(ctx context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool) error {
	casted := &bertytypes.AccountContactRequestSent{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("incoming contact request accepted"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	gInfo, err := v.v.client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		ContactPK: casted.ContactPK,
	})

	if err != nil {
		return err
	}

	v.v.AddContextGroup(ctx, gInfo.Group)
	v.v.recomputeChannelList(false)

	return nil
}

func metadataEventHandler(ctx context.Context, v *groupView, e *bertytypes.GroupMetadataEvent, isHistory bool, logger *zap.Logger) {
	actions := map[bertytypes.EventType]func(context.Context, *groupView, *bertytypes.GroupMetadataEvent, bool) error{
		bertytypes.EventTypeAccountContactBlocked:                  nil, // do it later
		bertytypes.EventTypeAccountContactRequestDisabled:          handlerAccountContactRequestStatusChanged,
		bertytypes.EventTypeAccountContactRequestEnabled:           handlerAccountContactRequestStatusChanged,
		bertytypes.EventTypeAccountContactRequestIncomingAccepted:  handlerAccountContactRequestIncomingAccepted,
		bertytypes.EventTypeAccountContactRequestIncomingDiscarded: handlerAccountContactRequestIncomingDiscarded,
		bertytypes.EventTypeAccountContactRequestIncomingReceived:  handlerAccountContactRequestIncomingReceived,
		bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:  handlerAccountContactRequestOutgoingEnqueued,
		bertytypes.EventTypeAccountContactRequestOutgoingSent:      handlerAccountContactRequestOutgoingSent,
		bertytypes.EventTypeAccountContactRequestReferenceReset:    handlerAccountContactRequestStatusChanged,
		bertytypes.EventTypeAccountContactUnblocked:                nil, // do it later
		bertytypes.EventTypeAccountGroupJoined:                     handlerAccountGroupJoined,
		bertytypes.EventTypeAccountGroupLeft:                       handlerAccountGroupLeft,
		bertytypes.EventTypeContactAliasKeyAdded:                   handlerContactAliasKeyAdded,
		bertytypes.EventTypeGroupDeviceSecretAdded:                 handlerGroupDeviceSecretAdded,
		bertytypes.EventTypeGroupMemberDeviceAdded:                 handlerGroupMemberDeviceAdded,
		bertytypes.EventTypeGroupMetadataPayloadSent:               nil, // do it later
		bertytypes.EventTypeMultiMemberGroupAdminRoleGranted:       nil, // do it later
		bertytypes.EventTypeMultiMemberGroupAliasResolverAdded:     handlerMultiMemberGroupAliasResolverAdded,
		bertytypes.EventTypeMultiMemberGroupInitialMemberAnnounced: handlerMultiMemberGroupInitialMemberAnnounced,
	}
	logger.Debug("metadataEventHandler", zap.Stringer("event-type", e.Metadata.EventType))

	action, ok := actions[e.Metadata.EventType]
	if !ok || action == nil {
		v.messages.AppendErr(fmt.Errorf("action handler for %s not found", e.Metadata.EventType.String()))
		return
	}

	if err := action(ctx, v, e, isHistory); err != nil {
		v.messages.AppendErr(fmt.Errorf("error while handling metadata event (type: %s): %w", e.Metadata.EventType.String(), err))
	}
}

func addToBuffer(evt *historyMessage, _ *bertytypes.GroupMetadataEvent, v *groupView, isHistory bool) {
	if isHistory {
		v.messages.Prepend(evt, time.Time{})
	} else {
		v.messages.Append(evt)
	}
}
