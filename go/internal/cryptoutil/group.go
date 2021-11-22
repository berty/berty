package cryptoutil

import (
	"io"

	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/sha3"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type GroupWithLinkKey interface {
	GetPublicKey() []byte
	GetSecret() []byte
	GetLinkKey() []byte
}

func ComputeLinkKey(publicKey, secret []byte) (*[KeySize]byte, error) {
	arr := [KeySize]byte{}

	kdf := hkdf.New(sha3.New256, secret, nil, publicKey)
	if _, err := io.ReadFull(kdf, arr[:]); err != nil {
		return nil, errcode.ErrStreamRead.Wrap(err)
	}

	return &arr, nil
}

func GetLinkKeyArray(m GroupWithLinkKey) (*[KeySize]byte, error) {
	if len(m.GetLinkKey()) == KeySize {
		arr := [KeySize]byte{}

		for i, c := range m.GetLinkKey() {
			arr[i] = c
		}

		return &arr, nil
	}

	return ComputeLinkKey(m.GetPublicKey(), m.GetSecret())
}

func GetSharedSecret(m GroupWithLinkKey) *[KeySize]byte {
	sharedSecret := [KeySize]byte{}
	copy(sharedSecret[:], m.GetSecret())

	return &sharedSecret
}
