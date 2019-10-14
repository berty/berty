package crypto

import (
	"context"

	"github.com/gogo/protobuf/proto"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type Manager interface {
	// Getters
	GetDevicePublicKey() p2pcrypto.PubKey
	GetSigChain() SigChainManager
	GetAccountPublicKey() (p2pcrypto.PubKey, error)

	// Actions
	Sign([]byte) ([]byte, error)
	AddDeviceToOwnSigChain(ctx context.Context, key p2pcrypto.PubKey) error

	Close() error
}

type SigChainManager interface {
	proto.Marshaler
	proto.Unmarshaler
	Unwrap() *SigChain

	GetInitialEntry() (*SigChainEntry, error)
	GetLastEntry() *SigChainEntry
	ListEntries() []*SigChainEntry
	ListCurrentPubKeys() []p2pcrypto.PubKey
	Init(privKey p2pcrypto.PrivKey) (*SigChainEntry, error)
	AddEntry(privKey p2pcrypto.PrivKey, pubKey p2pcrypto.PubKey, opts *Opts) (*SigChainEntry, error)
	RemoveEntry(privKey p2pcrypto.PrivKey, pubKey p2pcrypto.PubKey, opts *Opts) (*SigChainEntry, error)
	Check() error
}
