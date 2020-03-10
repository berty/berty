package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"

	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

func handlerAccountGroupJoined(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountGroupJoined{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	cg, err := v.v.odb.OpenMultiMemberGroup(ctx, casted.Group, nil)
	if err != nil {
		return errors.Wrap(err, "Can't open group")
	}

	if err := orbitutil.ActivateGroupContext(v.v.ctx, cg); err != nil {
		return errors.Wrap(err, "Can't activate group")
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("joined a group")),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	v.v.AddContextGroup(cg)

	return nil
}

func handlerGroupDeviceSecretAdded(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.GroupAddDeviceSecret{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("has exchanged a secret")),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil
}

func handlerGroupMemberDeviceAdded(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.GroupAddMemberDevice{}
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

func handlerAccountContactRequestOutgoingSent(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountContactRequestSent{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(casted.ContactPK)
	if err != nil {
		return errors.Wrap(err, "Can't open contact group")
	}

	cg, err := v.v.odb.OpenContactGroup(ctx, pk, nil)
	if err != nil {
		return errors.Wrap(err, "Can't open contact group")
	}

	if err := orbitutil.ActivateGroupContext(v.v.ctx, cg); err != nil {
		return errors.Wrap(err, "Can't activate contact group")
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("outgoing contact request sent"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	v.v.AddContextGroup(cg)

	return nil
}

func handlerAccountContactRequestStatusChanged(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	return contactShareCommand(ctx, v, "")
}

func handlerAccountGroupLeft(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountGroupLeft{}
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

func handlerAccountContactRequestIncomingReceived(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountContactRequestReceived{}
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

func handlerAccountContactRequestIncomingDiscarded(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountContactRequestDiscarded{}
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

func handlerMultiMemberGroupInitialMemberAnnounced(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.MultiMemberInitialMember{}
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

func handlerAccountContactRequestOutgoingEnqueued(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountContactRequestEnqueued{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("outgoing contact request enqueued (%s)", base64.StdEncoding.EncodeToString(casted.ContactPK))),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("fake request on the other end by typing `/contact received` with the value of `/contact share`")),
		sender:      casted.DevicePK,
	}, nil, v, false)

	return nil
}

func handlerContactAliasKeyAdded(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.ContactAddAliasKey{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("contact alias public key received")),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil

}

func handlerMultiMemberGroupAliasResolverAdded(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.MultiMemberGroupAddAliasResolver{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("contact alias proof received")),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	return nil

}

func handlerAccountContactRequestIncomingAccepted(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) error {
	casted := &bertyprotocol.AccountContactRequestSent{}
	if err := casted.Unmarshal(e.Event); err != nil {
		return err
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(casted.ContactPK)
	if err != nil {
		return errors.Wrap(err, "Can't open contact group")
	}

	cg, err := v.v.odb.OpenContactGroup(ctx, pk, nil)
	if err != nil {
		return errors.Wrap(err, "Can't open contact group")
	}

	if err := orbitutil.ActivateGroupContext(v.v.ctx, cg); err != nil {
		return errors.Wrap(err, "Can't activate contact group")
	}

	addToBuffer(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("incoming contact request accepted"),
		sender:      casted.DevicePK,
	}, e, v, isHistory)

	v.v.AddContextGroup(cg)

	return nil
}

func metadataEventHandler(ctx context.Context, v *groupView, e *bertyprotocol.GroupMetadataEvent, isHistory bool) {
	actions := map[bertyprotocol.EventType]func(context.Context, *groupView, *bertyprotocol.GroupMetadataEvent, bool) error{
		bertyprotocol.EventTypeAccountContactBlocked:                  nil, // do it later
		bertyprotocol.EventTypeAccountContactRequestDisabled:          handlerAccountContactRequestStatusChanged,
		bertyprotocol.EventTypeAccountContactRequestEnabled:           handlerAccountContactRequestStatusChanged,
		bertyprotocol.EventTypeAccountContactRequestIncomingAccepted:  handlerAccountContactRequestIncomingAccepted,
		bertyprotocol.EventTypeAccountContactRequestIncomingDiscarded: handlerAccountContactRequestIncomingDiscarded,
		bertyprotocol.EventTypeAccountContactRequestIncomingReceived:  handlerAccountContactRequestIncomingReceived,
		bertyprotocol.EventTypeAccountContactRequestOutgoingEnqueued:  handlerAccountContactRequestOutgoingEnqueued,
		bertyprotocol.EventTypeAccountContactRequestOutgoingSent:      handlerAccountContactRequestOutgoingSent,
		bertyprotocol.EventTypeAccountContactRequestReferenceReset:    handlerAccountContactRequestStatusChanged,
		bertyprotocol.EventTypeAccountContactUnblocked:                nil, // do it later
		bertyprotocol.EventTypeAccountGroupJoined:                     handlerAccountGroupJoined,
		bertyprotocol.EventTypeAccountGroupLeft:                       handlerAccountGroupLeft,
		bertyprotocol.EventTypeContactAliasKeyAdded:                   handlerContactAliasKeyAdded,
		bertyprotocol.EventTypeGroupDeviceSecretAdded:                 handlerGroupDeviceSecretAdded,
		bertyprotocol.EventTypeGroupMemberDeviceAdded:                 handlerGroupMemberDeviceAdded,
		bertyprotocol.EventTypeGroupMetadataPayloadSent:               nil, // do it later
		bertyprotocol.EventTypeMultiMemberGroupAdminRoleGranted:       nil, // do it later
		bertyprotocol.EventTypeMultiMemberGroupAliasResolverAdded:     handlerMultiMemberGroupAliasResolverAdded,
		bertyprotocol.EventTypeMultiMemberGroupInitialMemberAnnounced: handlerMultiMemberGroupInitialMemberAnnounced,
	}

	action, ok := actions[e.Metadata.EventType]
	if !ok || action == nil {
		v.messages.AppendErr(fmt.Errorf("action handler for %s not found", e.Metadata.EventType.String()))
		return
	}

	if err := action(ctx, v, e, isHistory); err != nil {
		v.messages.AppendErr(errors.Wrap(err, "error while handling metadata event"))
	}
}

func addToBuffer(evt *historyMessage, e *bertyprotocol.GroupMetadataEvent, v *groupView, isHistory bool) {
	if isHistory {
		v.messages.Prepend(evt, time.Time{})
	} else {
		v.messages.Append(evt)
	}
}
