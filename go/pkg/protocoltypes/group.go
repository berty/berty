package protocoltypes

import (
	"encoding/hex"
	"io"

	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/ed25519"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/sha3"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Group) GetSigningPrivKey() (crypto.PrivKey, error) {
	if len(m.Secret) == 0 {
		return nil, errcode.ErrMissingInput
	}

	edSK := ed25519.NewKeyFromSeed(m.Secret)

	sk, _, err := crypto.KeyPairFromStdKey(&edSK)
	if err != nil {
		return nil, err
	}

	return sk, nil
}

func (m *Group) GetPubKey() (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(m.PublicKey)
}

func (m *Group) GetSigningPubKey() (crypto.PubKey, error) {
	if len(m.SignPub) != 0 {
		return crypto.UnmarshalEd25519PublicKey(m.SignPub)
	}

	sk, err := m.GetSigningPrivKey()
	if err != nil {
		return nil, err
	}

	return sk.GetPublic(), nil
}

func ComputeUpdatesKey(publicKey, secret []byte) (*[cryptoutil.KeySize]byte, error) {
	arr := [cryptoutil.KeySize]byte{}

	kdf := hkdf.New(sha3.New256, secret, nil, publicKey)
	if _, err := io.ReadFull(kdf, arr[:]); err != nil {
		return nil, errcode.ErrStreamRead.Wrap(err)
	}

	return &arr, nil
}

func (m *Group) GetUpdatesKeyArray() (*[cryptoutil.KeySize]byte, error) {
	if len(m.UpdatesKey) == cryptoutil.KeySize {
		arr := [cryptoutil.KeySize]byte{}

		for i, c := range m.UpdatesKey {
			arr[i] = c
		}

		return &arr, nil
	}

	return ComputeUpdatesKey(m.PublicKey, m.Secret)
}

func (m *Group) IsValid() error {
	pk, err := m.GetPubKey()
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err := pk.Verify(m.Secret, m.SecretSig)
	if err != nil {
		return errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	if !ok {
		return errcode.ErrCryptoSignatureVerification
	}

	return nil
}

// GroupIDAsString returns the group pub key as a string
func (m *Group) GroupIDAsString() string {
	return hex.EncodeToString(m.PublicKey)
}

func (m *Group) GetSharedSecret() *[cryptoutil.KeySize]byte {
	sharedSecret := [cryptoutil.KeySize]byte{}
	copy(sharedSecret[:], m.Secret)

	return &sharedSecret
}

func (m *Group) FilterForReplication() (*Group, error) {
	groupSigPK, err := m.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	groupSigPKBytes, err := groupSigPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	updatesKey, err := m.GetUpdatesKeyArray()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &Group{
		PublicKey:  m.PublicKey,
		SignPub:    groupSigPKBytes,
		UpdatesKey: updatesKey[:],
	}, nil
}
