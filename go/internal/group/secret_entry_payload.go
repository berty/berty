package group

import (
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/go/internal/cryptoutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func OpenDeviceSecret(m *bertyprotocol.GroupMetadata, localMemberPrivateKey crypto.PrivKey, group *bertyprotocol.Group) (crypto.PubKey, *bertyprotocol.DeviceSecret, error) {
	if m == nil || m.EventType != bertyprotocol.EventTypeGroupDeviceSecretAdded {
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

	mongPriv, mongPub, err := cryptoutil.EdwardsToMontgomery(localMemberPrivateKey, senderDevicePubKey)
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

func NewSecretEntryPayload(localDevicePrivKey crypto.PrivKey, remoteMemberPubKey crypto.PubKey, secret *bertyprotocol.DeviceSecret, group *bertyprotocol.Group) ([]byte, error) {
	message, err := secret.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := groupIDToNonce(group)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	mongPriv, mongPub, err := cryptoutil.EdwardsToMontgomery(localDevicePrivKey, remoteMemberPubKey)
	if err != nil {
		return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	encryptedSecret := box.Seal(nil, message, nonce, mongPub, mongPriv)

	return encryptedSecret, nil
}

func groupIDToNonce(group *bertyprotocol.Group) (*[24]byte, error) {
	// Nonce doesn't need to be secret, random nor unpredictable, it just needs
	// to be used only once for a given {sender, receiver} set and we will send
	// only one SecretEntryPayload per {localDevicePrivKey, remoteMemberPubKey}
	// So we can reuse groupID as nonce for all SecretEntryPayload and save
	// 24 bytes of storage and bandwidth for each of them.
	//
	// See https://pynacl.readthedocs.io/en/stable/secret/#nonce
	// See Security Model here: https://nacl.cr.yp.to/box.html
	var nonce [24]byte

	gid := group.GetPublicKey()

	copy(nonce[:], gid)

	return &nonce, nil
}
