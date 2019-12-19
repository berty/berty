package group

import (
	"crypto/rand"
	"math"
	"math/big"

	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

// MemberDevice is a remote device part of a group
type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
	Secret *DeviceSecret
}

// OwnMemberDevice is own local device part of a group
type OwnMemberDevice struct {
	Member crypto.PrivKey
	Device crypto.PrivKey
	Secret *DeviceSecret
}

func NewOwnMemberDevice() (*OwnMemberDevice, error) {
	member, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	device, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	counter, err := rand.Int(rand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	derivationState := make([]byte, 32)
	_, err = rand.Read(derivationState)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	secret := &DeviceSecret{
		DerivationState: derivationState,
		Counter:         counter.Uint64(),
	}

	return &OwnMemberDevice{
		Member: member,
		Device: device,
		Secret: secret,
	}, nil
}
