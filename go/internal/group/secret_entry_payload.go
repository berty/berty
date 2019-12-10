package group

import (
	"berty.tech/go/pkg/errcode"
	cconv "github.com/agl/ed25519/extra25519"
	"github.com/libp2p/go-libp2p-core/crypto"
	crypto_pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	"golang.org/x/crypto/nacl/box"
)

// CheckStructure checks validity of SecretEntryPayload
func (s *SecretEntryPayload) CheckStructure() error {
	const (
		derivationStateSize = 32 // Fixed: see Berty Protocol paper
		counterSize         = 8  // Uint64
		deviceSecretMinSize = derivationStateSize + counterSize
	)

	_, err := crypto.UnmarshalEd25519PublicKey(s.DestMemberPubKey)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	_, err = crypto.UnmarshalEd25519PublicKey(s.SenderDevicePubKey)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if len(s.EncryptedDeviceSecret) < deviceSecretMinSize {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func (s *SecretEntryPayload) ToDeviceSecret(localMemberPrivateKey crypto.PrivKey, group *Group) (*DeviceSecret, error) {
	nonce, err := groupIDToNonce(group)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	destMemberPubKey, err := crypto.UnmarshalEd25519PublicKey(s.DestMemberPubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	} else if !destMemberPubKey.Equals(localMemberPrivateKey.GetPublic()) {
		return nil, errcode.ErrGroupSecretOtherDestMember
	}

	senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(s.SenderDevicePubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	mongPriv, mongPub, err := edwardsToMontgomery(localMemberPrivateKey, senderDevicePubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	decryptedSecret := &DeviceSecret{}
	decryptedMessage, ok := box.Open(nil, s.EncryptedDeviceSecret, nonce, mongPub, mongPriv)
	if !ok {
		return nil, errcode.TODO
	}

	err = decryptedSecret.Unmarshal(decryptedMessage)
	if err != nil {
		return nil, errcode.TODO
	}

	return decryptedSecret, nil
}

func (s *SecretEntryPayload) GetSignerPubKey() (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(s.SenderDevicePubKey)
}

func NewSecretEntryPayload(localDevicePrivKey crypto.PrivKey, remoteMemberPubKey crypto.PubKey, secret *DeviceSecret, group *Group) (*SecretEntryPayload, error) {
	message, err := secret.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	nonce, err := groupIDToNonce(group)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	remoteMemberPubKeyBytes, err := remoteMemberPubKey.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	localDevicePubKeyBytes, err := localDevicePrivKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	mongPriv, mongPub, err := edwardsToMontgomery(localDevicePrivKey, remoteMemberPubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	encryptedSecret := box.Seal(nil, message, nonce, mongPub, mongPriv)

	return &SecretEntryPayload{
		DestMemberPubKey:      remoteMemberPubKeyBytes,
		SenderDevicePubKey:    localDevicePubKeyBytes,
		EncryptedDeviceSecret: encryptedSecret,
	}, nil
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
		return nil, errcode.TODO.Wrap(err)
	}

	copy(nonce[:], gid)

	return &nonce, nil
}

func edwardsToMontgomery(privKey crypto.PrivKey, pubKey crypto.PubKey) (*[32]byte, *[32]byte, error) {
	var edPriv [64]byte
	var edPub, mongPriv, mongPub [32]byte

	if privKey.Type() != crypto_pb.KeyType_Ed25519 || pubKey.Type() != crypto_pb.KeyType_Ed25519 {
		return nil, nil, errcode.TODO
	}

	privKeyBytes, err := privKey.Raw()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	} else if len(privKeyBytes) != 64 {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	pubKeyBytes, err := pubKey.Raw()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	} else if len(pubKeyBytes) != 32 {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	copy(edPriv[:], privKeyBytes)
	copy(edPub[:], pubKeyBytes)

	cconv.PrivateKeyToCurve25519(&mongPriv, &edPriv)
	if !cconv.PublicKeyToCurve25519(&mongPub, &edPub) {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return &mongPriv, &mongPub, nil
}
