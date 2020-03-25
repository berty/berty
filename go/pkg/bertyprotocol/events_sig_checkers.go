package bertyprotocol

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type SigChecker func(g *Group, metadata *GroupMetadata, message proto.Message) error

type EventGroupSigned interface {
	proto.Message
}

func SigCheckerGroupSigned(g *Group, metadata *GroupMetadata, message proto.Message) error {
	pk, err := g.GetPubKey()
	if err != nil {
		return err
	}

	ok, err := pk.Verify(metadata.Payload, metadata.Sig)
	if err != nil {
		return errcode.ErrSignatureVerificationFailed.Wrap(err)
	}

	if !ok {
		return errcode.ErrSignatureVerificationFailed
	}

	return nil
}

func SigCheckerMissing(g *Group, metadata *GroupMetadata, message proto.Message) error {
	return errcode.ErrNotImplemented
}

type EventDeviceSigned interface {
	proto.Message
	GetDevicePK() []byte
}

func SigCheckerDeviceSigned(g *Group, metadata *GroupMetadata, message proto.Message) error {
	msg, ok := message.(EventDeviceSigned)
	if !ok {
		return errcode.ErrDeserialization
	}

	devPK, err := crypto.UnmarshalEd25519PublicKey(msg.GetDevicePK())
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err = devPK.Verify(metadata.Payload, metadata.Sig)
	if err != nil {
		return errcode.ErrSignatureVerificationFailed.Wrap(err)
	}

	if !ok {
		return errcode.ErrSignatureVerificationFailed
	}

	return nil
}

func SigCheckerMemberDeviceAdded(g *Group, metadata *GroupMetadata, message proto.Message) error {
	msg, ok := message.(*GroupAddMemberDevice)
	if !ok {
		return errcode.ErrDeserialization
	}

	memPK, err := crypto.UnmarshalEd25519PublicKey(msg.MemberPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err = memPK.Verify(msg.DevicePK, msg.MemberSig)
	if err != nil {
		return errcode.ErrSignatureVerificationFailed.Wrap(err)
	}

	if !ok {
		return errcode.ErrSignatureVerificationFailed
	}

	return SigCheckerDeviceSigned(g, metadata, message)
}
