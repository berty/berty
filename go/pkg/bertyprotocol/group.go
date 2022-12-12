package bertyprotocol

import (
	crand "crypto/rand"

	"github.com/libp2p/go-libp2p/core/crypto"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const CurrentGroupVersion = 1

// NewGroupMultiMember creates a new Group object and an invitation to be used by
// the first member of the group
func NewGroupMultiMember() (*protocoltypes.Group, crypto.PrivKey, error) {
	priv, pub, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	pubBytes, err := pub.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	signing, _, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(signing)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	skSig, err := priv.Sign(signingBytes)
	if err != nil {
		return nil, nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	group := &protocoltypes.Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: skSig,
		GroupType: protocoltypes.GroupTypeMultiMember,
	}

	updateKey, err := cryptoutil.GetLinkKeyArray(group)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	linkKeySig, err := priv.Sign(updateKey[:])
	if err != nil {
		return nil, nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	group.LinkKeySig = linkKeySig

	return group, priv, nil
}

func openDeviceSecret(m *protocoltypes.GroupMetadata, localMemberPrivateKey crypto.PrivKey, group *protocoltypes.Group) (crypto.PubKey, *protocoltypes.DeviceSecret, error) {
	if m == nil || m.EventType != protocoltypes.EventTypeGroupDeviceSecretAdded {
		return nil, nil, errcode.ErrInvalidInput
	}

	s := &protocoltypes.GroupAddDeviceSecret{}
	if err := s.Unmarshal(m.Payload); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(s.DevicePK)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	destMemberPubKey, err := crypto.UnmarshalEd25519PublicKey(s.DestMemberPK)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	if !localMemberPrivateKey.GetPublic().Equals(destMemberPubKey) {
		return nil, nil, errcode.ErrGroupSecretOtherDestMember
	}

	mongPriv, mongPub, err := cryptoutil.EdwardsToMontgomery(localMemberPrivateKey, senderDevicePubKey)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	nonce := groupIDToNonce(group)
	decryptedSecret := &protocoltypes.DeviceSecret{}
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

func groupIDToNonce(group *protocoltypes.Group) *[cryptoutil.NonceSize]byte {
	// Nonce doesn't need to be secret, random nor unpredictable, it just needs
	// to be used only once for a given {sender, receiver} set and we will send
	// only one SecretEntryPayload per {localDevicePrivKey, remoteMemberPubKey}
	// So we can reuse groupID as nonce for all SecretEntryPayload and save
	// 24 bytes of storage and bandwidth for each of them.
	//
	// See https://pynacl.readthedocs.io/en/stable/secret/#nonce
	// See Security Model here: https://nacl.cr.yp.to/box.html
	var nonce [cryptoutil.NonceSize]byte

	gid := group.GetPublicKey()

	copy(nonce[:], gid)

	return &nonce
}
