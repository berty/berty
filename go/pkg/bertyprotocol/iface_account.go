package bertyprotocol

import (
	crand "crypto/rand"
	"math"
	"math/big"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type AccountKeys interface {
	AccountPrivKey() (crypto.PrivKey, error)
	AccountProofPrivKey() (crypto.PrivKey, error)
	DevicePrivKey() (crypto.PrivKey, error)
	ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error)
	MemberDeviceForGroup(g *bertytypes.Group) (*OwnMemberDevice, error)
}

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
	Secret *bertytypes.DeviceSecret
}

func NewDeviceSecret() (*bertytypes.DeviceSecret, error) {
	counter, err := crand.Int(crand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	chainKey := make([]byte, 32)
	_, err = crand.Read(chainKey)
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return &bertytypes.DeviceSecret{
		ChainKey: chainKey,
		Counter:  counter.Uint64(),
	}, nil
}
