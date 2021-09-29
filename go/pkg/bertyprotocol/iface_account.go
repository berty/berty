package bertyprotocol

import (
	crand "crypto/rand"
	"math"
	"math/big"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type AccountKeys interface {
	AccountPrivKey() (crypto.PrivKey, error)
	AccountProofPrivKey() (crypto.PrivKey, error)
	DevicePrivKey() (crypto.PrivKey, error)
	ContactGroupPrivKey(pk crypto.PubKey) (crypto.PrivKey, error)
	MemberDeviceForGroup(g *protocoltypes.Group) (*cryptoutil.OwnMemberDevice, error)
}

// MemberDevice is a remote device part of a group
type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
	Secret *protocoltypes.DeviceSecret
}

func NewDeviceSecret() (*protocoltypes.DeviceSecret, error) {
	counter, err := crand.Int(crand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	chainKey := make([]byte, 32)
	_, err = crand.Read(chainKey)
	if err != nil {
		return nil, errcode.ErrCryptoRandomGeneration.Wrap(err)
	}

	return &protocoltypes.DeviceSecret{
		ChainKey: chainKey,
		Counter:  counter.Uint64(),
	}, nil
}
