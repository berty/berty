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

type CryptoEvent interface {
	// New Contact
	// New Contact Device
}

type Crypto interface {
	// Getters
	GetDevicePublicKey() crypto.PubKey
	GetPublicRendezvousSeed(ctx context.Context) ([]byte, error)
	GetSigChain() SigChain
	GetAccountPublicKey() (crypto.PubKey, error)
	GetSigChainForAccount(accountID []byte) (SigChain, error)

	// Actions
	Sign([]byte) ([]byte, error)
	AddDeviceToOwnSigChain(ctx context.Context, key crypto.PubKey) error
	SaveContactSigChain(ctx context.Context, chain SigChain) error
	ResetPublicRendezvousSeed(ctx context.Context) ([]byte, error)
	SetDerivationStatusForGroupMember(ctx context.Context, member CryptoGroupMember, derivationStatus []byte, counter uint64) error

	// Subscriptions
	RegisterEventHandler(ctx context.Context) (chan<- CryptoEvent, error)

	Close() error
}

type HandshakeSession interface {
	// Getters/Setters
	SetOtherKeys(sign crypto.PubKey, box []byte) error
	GetPublicKeys() (sign crypto.PubKey, box []byte)

	// Actions
	ProveOtherKey() ([]byte, error)
	CheckOwnKeyProof(sig []byte) error
	ProveOwnDeviceKey() ([]byte, error)
	CheckOtherKeyProof(sig []byte, chain SigChain, deviceKey crypto.PubKey) error
	ProveOtherKnownAccount() ([]byte, error)
	CheckOwnKnownAccountProof(attemptedDeviceKey crypto.PubKey, proof []byte) error

	// Utils
	Encrypt(data []byte) ([]byte, error)
	Decrypt(data []byte) ([]byte, error)

	Close() error
}

//type CryptoEnvelope interface {
//	// Getters
//	GetGroupID() []byte
//	GetSenderID() []byte
//	GetCounter() []byte
//	GetEvent() []byte
//	GetTimestamp() time.Time
//	GetSignature() []byte
//}

type CryptoGroupMember interface {
	//	GetID() []byte
	//
	//	GetGroup() CryptoGroup
	//	GetPublicKey() (crypto.PubKey, error)
	//	GetAccountPublicKey() (crypto.PubKey, error)
	//	GetSigChain() (SigChain, error)
	//	GetGroupSecret() []byte
	//	GetDerivationState() []byte
	//	GetDerivationCounter() uint64
	//
	//	// Secrets
	//	GetCounterValue() []byte
	//	GetCounterValueAt(value uint64) []byte
	//	DeriveKey(ctx context.Context, salt []byte) error
	//	GetNextSymmetricKey() ([]byte, error)
}

//type CryptoGroup interface {
//	GetID() []byte
//
//	GetRendezvousSeed() []byte
//	GetCreatorPubKey() (crypto.PubKey, error)
//
//	GetMembers() []CryptoGroupMember
//
//	SealMessage(ctx context.Context, payload []byte) (envelope CryptoEnvelope, symKey []byte, err error)
//	OpenMessage(env CryptoEnvelope) (payload []byte, symKey []byte, err error)
//
//	AddMembers([]CryptoGroupMember) ([]CryptoGroupMember, error)
//}
