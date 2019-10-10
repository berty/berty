package iface

import (
	"context"
	"time"

	"github.com/libp2p/go-libp2p-core/crypto"
)

type SigChainEntry interface {
	// Getters
	GetEntryHash() []byte
	GetParentEntryHash() []byte
	GetCreatedAt() time.Time
	GetExpiringAt() time.Time
	GetSignedBy() (crypto.PubKey, error)
	GetSignature() []byte
	GetSubject() (crypto.PubKey, error)

	// Serialization
	Unmarshal([]byte) error
	Marshal() ([]byte, error)

	// Actions
	Check() error
	Sign(key crypto.PrivKey) error
}

type SigChain interface {
	// Getters
	GetID() []byte
	GetInitialEntry() (SigChainEntry, error)
	GetLastEntry() SigChainEntry
	ListEntries() []SigChainEntry
	ListCurrentPubKeys() []crypto.PubKey

	// Serialization
	Unmarshal([]byte) error
	Marshal() ([]byte, error)

	// Actions
	Init(crypto.PrivKey) (SigChainEntry, error)
	AddEntry(crypto.PrivKey, crypto.PubKey) (SigChainEntry, error)
	RemoveEntry(crypto.PrivKey, crypto.PubKey) (SigChainEntry, error)
	Check() error
}

type CryptoManager interface {
	// Getters
	GetDevicePublicKey() crypto.PubKey
	GetSigChain() SigChain
	GetAccountPublicKey() (crypto.PubKey, error)

	// Actions
	Sign([]byte) ([]byte, error)
	AddDeviceToOwnSigChain(ctx context.Context, key crypto.PubKey) error

	Close() error
}
