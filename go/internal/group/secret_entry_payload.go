package group

import (
	cconv "github.com/agl/ed25519/extra25519"
	"github.com/libp2p/go-libp2p-core/crypto"
	crypto_pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func OpenDeviceSecret(m *bertyprotocol.GroupMetadata, localMemberPrivateKey crypto.PrivKey, group *Group) (crypto.PubKey, *bertyprotocol.DeviceSecret, error) {
	if m.EventType != bertyprotocol.EventTypeGroupDeviceSecretAdded {
		return nil, nil, errcode.ErrInvalidInput
	}

	s := &bertyprotocol.GroupAddDeviceSecret{}
	if err := s.Unmarshal(m.Payload); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	nonce, err := groupIDToNonce(group)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(s.DevicePK)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	mongPriv, mongPub, err := edwardsToMontgomery(localMemberPrivateKey, senderDevicePubKey)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	decryptedSecret := &bertyprotocol.DeviceSecret{}
	decryptedMessage, ok := box.Open(nil, s.Payload, nonce, mongPub, mongPriv)
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt
	}

	err = decryptedSecret.Unmarshal(decryptedMessage)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization
	}

	return senderDevicePubKey, decryptedSecret, nil
}

func NewSecretEntryPayload(localDevicePrivKey crypto.PrivKey, remoteMemberPubKey crypto.PubKey, secret *bertyprotocol.DeviceSecret, group *Group) ([]byte, error) {
	message, err := secret.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := groupIDToNonce(group)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	mongPriv, mongPub, err := edwardsToMontgomery(localDevicePrivKey, remoteMemberPubKey)
	if err != nil {
		return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	encryptedSecret := box.Seal(nil, message, nonce, mongPub, mongPriv)

	return encryptedSecret, nil
}

func groupIDToNonce(group *Group) (*[24]byte, error) {
	// Nonce doesn't need to be secret, random nor unpredictable, it just needs
	// to be used only once for a given {sender, receiver} set and we will send
	// only one SecretEntryPayload per {localDevicePrivKey, remoteMemberPubKey}
	// So we can reuse groupID as nonce for all SecretEntryPayload and save
	// 24 bytes of storage and bandwidth for each of them.
	//
	// See https://pynacl.readthedocs.io/en/stable/secret/#nonce
	// See Security Model here: https://nacl.cr.yp.to/box.html
	var nonce [24]byte

	gid, err := group.PubKey.Bytes()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	copy(nonce[:], gid)

	return &nonce, nil
}

func edwardsToMontgomery(privKey crypto.PrivKey, pubKey crypto.PubKey) (*[32]byte, *[32]byte, error) {
	var edPriv [64]byte
	var edPub, mongPriv, mongPub [32]byte

	if privKey.Type() != crypto_pb.KeyType_Ed25519 || pubKey.Type() != crypto_pb.KeyType_Ed25519 {
		return nil, nil, errcode.ErrInvalidInput
	}

	privKeyBytes, err := privKey.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	} else if len(privKeyBytes) != 64 {
		return nil, nil, errcode.ErrInvalidInput
	}

	pubKeyBytes, err := pubKey.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	} else if len(pubKeyBytes) != 32 {
		return nil, nil, errcode.ErrInvalidInput
	}

	copy(edPriv[:], privKeyBytes)
	copy(edPub[:], pubKeyBytes)

	cconv.PrivateKeyToCurve25519(&mongPriv, &edPriv)
	if !cconv.PublicKeyToCurve25519(&mongPub, &edPub) {
		return nil, nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	return &mongPriv, &mongPub, nil
}
