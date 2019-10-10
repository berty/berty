package crypto

import (
	"context"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type Manager interface {
	// Getters
	GetDevicePublicKey() p2pcrypto.PubKey
	GetSigChain() *SigChain
	GetAccountPublicKey() (p2pcrypto.PubKey, error)

	// Actions
	Sign([]byte) ([]byte, error)
	AddDeviceToOwnSigChain(ctx context.Context, key p2pcrypto.PubKey) error

	Close() error
}
