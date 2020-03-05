package account

import (
	"crypto/rand"
	"math"
	"math/big"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

// OwnMemberDevice is own local device part of a group
type OwnMemberDevice struct {
	Member crypto.PrivKey
	Device crypto.PrivKey
}

func (d *OwnMemberDevice) Public() *MemberDevice {
	return &MemberDevice{
		Member: d.Member.GetPublic(),
		Device: d.Device.GetPublic(),
	}
}

// MemberDevice is a remote device part of a group
type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
	Secret *bertyprotocol.DeviceSecret
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
