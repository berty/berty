package iface

import (
	"context"
	"time"

	"github.com/libp2p/go-libp2p-core/crypto"
)

type SigChainEntryType int8

const (
	SigChainEntryType_UNDEFINED  SigChainEntryType = 0
	SigChainEntryType_INIT_CHAIN SigChainEntryType = 1
	SigChainEntryType_ADD_KEY    SigChainEntryType = 2
	SigChainEntryType_REVOKE_KEY SigChainEntryType = 3
)

type SigChainEntry interface {
	// Parent item
	GetSigChain() SigChain

	// Getters
	GetEntryType() SigChainEntryType
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
	GetInitialEntry() SigChainEntry
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
	CryptoModule

	// Getters
	GetPublicKey() crypto.PubKey
	GetPublicRendezvousSeed(ctx context.Context) ([]byte, error)
	GetSigChain() SigChain
	GetSigChainForAccount(accountID []byte) (SigChain, error)

	// Actions
	Sign([]byte) ([]byte, error)
	AddDeviceToOwnSigChain(ctx context.Context, key crypto.PubKey) error
	SaveContactSigChain(ctx context.Context, chain SigChain) error
	ResetPublicRendezvousSeed(ctx context.Context) ([]byte, error)
	SetDerivationStatusForGroupMember(ctx context.Context, member CryptoGroupMember, derivationStatus []byte, counter uint64) error

	// Modules
	Handshake() CryptoHandshakeModule
	Groups() CryptoGroupsModule

	// Subscriptions
	RegisterEventHandler(ctx context.Context) (chan<- CryptoEvent, error)

	Close() error
}

type HandshakeSession interface {
	// Parent
	Crypto() Crypto

	// Actions
	SetOtherPubKey(key crypto.PubKey)
	ProveOtherKey(key crypto.PubKey) ([]byte, error)
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

type CryptoEnvelope interface {
	// Getters
	GetGroupID() []byte
	GetSenderID() []byte
	GetCounter() []byte
	GetEvent() []byte
	GetTimestamp() time.Time
	GetSignature() []byte
}

type CryptoGroupMember interface {
	GetID() []byte

	GetGroup() CryptoGroup
	GetPublicKey() (crypto.PubKey, error)
	GetAccountPublicKey() (crypto.PubKey, error)
	GetSigChain() (SigChain, error)
	GetGroupSecret() []byte
	GetDerivationState() []byte
	GetDerivationCounter() uint64

	// Secrets
	GetCounterValue() []byte
	GetCounterValueAt(value uint64) []byte
	DeriveKey(ctx context.Context, salt []byte) error
	GetNextSymmetricKey() ([]byte, error)
}

type CryptoGroup interface {
	GetID() []byte

	GetRendezvousSeed() []byte
	GetCreatorPubKey() (crypto.PubKey, error)

	GetMembers() []CryptoGroupMember

	SealMessage(ctx context.Context, payload []byte) (envelope CryptoEnvelope, symKey []byte, err error)
	OpenMessage(env CryptoEnvelope) (payload []byte, symKey []byte, err error)

	AddMembers([]CryptoGroupMember) ([]CryptoGroupMember, error)
}

type CryptoGroupsModule interface {
	Crypto() Crypto

	InitGroup(members []CryptoGroupMember, groupMetadata []byte) (CryptoGroup, []CryptoGroupMember, error)
	JoinGroup(groupID []byte, members []CryptoGroupMember, rendezvousSeed []byte, creatorPubKey []byte, groupMetadata []byte) (CryptoGroup, error)
}

type CryptoHandshakeModule interface {
	Crypto() Crypto

	Init() (HandshakeSession, error)
	Join(sigPubKey crypto.PubKey) (HandshakeSession, error)
}

type CryptoModule interface {
	// Open crypto instance
	InitNewIdentity(ctx context.Context, ds CryptoDataStore) (Crypto, crypto.PrivKey, error)
	InitFromOtherDeviceIdentity(ctx context.Context, ds CryptoDataStore /* other params */) (Crypto, crypto.PrivKey, error)
	OpenIdentity(ctx context.Context, ds CryptoDataStore, key crypto.PrivKey, chain SigChain) (Crypto, error)

	//
	InitSigChain(crypto.PrivKey) (SigChain, error)
	GeneratePrivateKey() (crypto.PrivKey, error)

	// Utils
	GetCurrentRendezvousPoint(id, seed []byte) ([]byte, error)
	GetRendezvousPointForTime(id, seed []byte, date time.Time) ([]byte, error)
	VerifySig(value []byte, sig []byte, key crypto.PubKey) error
}
