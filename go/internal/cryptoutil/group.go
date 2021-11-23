package cryptoutil

import (
	"encoding/binary"
	"fmt"
	"io"

	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/sha3"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const PushSecretNamespace = "push_secret_ref" // nolint:gosec

type GroupWithSecret interface {
	GetPublicKey() []byte
	GetSecret() []byte
}

type GroupWithLinkKey interface {
	GroupWithSecret
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

func GetGroupPushSecret(m GroupWithSecret) ([]byte, error) {
	if len(m.GetSecret()) == 0 {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no secret known for group"))
	}

	arr := [KeySize]byte{}

	kdf := hkdf.New(sha3.New256, m.GetSecret(), nil, []byte(PushSecretNamespace))
	if _, err := io.ReadFull(kdf, arr[:]); err != nil {
		return nil, errcode.ErrStreamRead.Wrap(err)
	}

	return arr[:], nil
}

func CreatePushGroupReference(sender []byte, counter uint64, secret []byte) ([]byte, error) {
	arr := [KeySize]byte{}

	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, counter)

	kdf := hkdf.New(sha3.New256, secret, nil, append(sender, buf...))
	if _, err := io.ReadFull(kdf, arr[:]); err != nil {
		return nil, errcode.ErrStreamRead.Wrap(err)
	}

	return arr[:], nil
}
