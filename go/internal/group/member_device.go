package group

import (
	"crypto/rand"
	"math"
	"math/big"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

// MemberDevice is a remote device part of a group
type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
	Secret *bertyprotocol.DeviceSecret
}

// OwnMemberDevice is own local device part of a group
type OwnMemberDevice struct {
	Member crypto.PrivKey
	Device crypto.PrivKey
}

func NewOwnMemberDevice() (*OwnMemberDevice, error) {
	member, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	device, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return &OwnMemberDevice{
		Member: member,
		Device: device,
	}, nil
}

func NewDeviceSecret() (*bertyprotocol.DeviceSecret, error) {
	counter, err := rand.Int(rand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		return nil, errcode.ErrRandomGenerationFailed.Wrap(err)
	}

	chainKey := make([]byte, 32)
	_, err = rand.Read(chainKey)
	if err != nil {
		return nil, errcode.ErrRandomGenerationFailed.Wrap(err)
	}

	return &bertyprotocol.DeviceSecret{
		ChainKey: chainKey,
		Counter:  counter.Uint64(),
	}, nil
}
