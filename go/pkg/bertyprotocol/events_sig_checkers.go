package bertyprotocol

import (
	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type sigChecker func(g *protocoltypes.Group, metadata *protocoltypes.GroupMetadata, message proto.Message) error

func sigCheckerGroupSigned(g *protocoltypes.Group, metadata *protocoltypes.GroupMetadata, message proto.Message) error {
	pk, err := g.GetPubKey()
	if err != nil {
		return err
	}

	ok, err := pk.Verify(metadata.Payload, metadata.Sig)
	if err != nil {
		return errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	if !ok {
		return errcode.ErrCryptoSignatureVerification
	}

	return nil
}

type eventDeviceSigned interface {
	proto.Message
	GetDevicePK() []byte
}

func sigCheckerDeviceSigned(g *protocoltypes.Group, metadata *protocoltypes.GroupMetadata, message proto.Message) error {
	msg, ok := message.(eventDeviceSigned)
	if !ok {
		return errcode.ErrDeserialization
	}

	devPK, err := crypto.UnmarshalEd25519PublicKey(msg.GetDevicePK())
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err = devPK.Verify(metadata.Payload, metadata.Sig)
	if err != nil {
		return errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	if !ok {
		return errcode.ErrCryptoSignatureVerification
	}

	return nil
}

func sigCheckerMemberDeviceAdded(g *protocoltypes.Group, metadata *protocoltypes.GroupMetadata, message proto.Message) error {
	msg, ok := message.(*protocoltypes.GroupAddMemberDevice)
	if !ok {
		return errcode.ErrDeserialization
	}

	memPK, err := crypto.UnmarshalEd25519PublicKey(msg.MemberPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err = memPK.Verify(msg.DevicePK, msg.MemberSig)
	if err != nil {
		return errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	if !ok {
		return errcode.ErrCryptoSignatureVerification
	}

	return sigCheckerDeviceSigned(g, metadata, message)
}
