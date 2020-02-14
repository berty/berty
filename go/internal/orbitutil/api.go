package orbitutil

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/ipfs/go-cid"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type GroupStore interface {
	iface.Store

	InitBaseStore(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error

	SetGroupContext(GroupContext)
	GetGroupContext() GroupContext
}

type MetadataStore interface {
	GroupStore

	// ListEvents returns a channel of previously received events
	ListEvents(ctx context.Context) <-chan *bertyprotocol.GroupMetadataEvent

	// MemberCount returns the number of members in the member tree
	MemberCount() int

	// DeviceCount returns the number of devices in the member tree
	DeviceCount() int

	// ListMembers returns a list of members's pubkey indexed in the member tree
	ListMembers() []crypto.PubKey

	// ListDevices returns a list of devices's pubkey indexed in the member tree
	ListDevices() []crypto.PubKey

	// ListAdmins returns a list of devices's pubkey indexed in the member tree
	ListAdmins() []crypto.PubKey

	// GetMemberByDevice
	GetMemberByDevice(crypto.PubKey) (crypto.PubKey, error)

	// GetDevicesForMember
	GetDevicesForMember(crypto.PubKey) ([]crypto.PubKey, error)

	// JoinGroup
	JoinGroup(ctx context.Context) (operation.Operation, error)

	// SendSecret sends secret of this device to group member
	SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error)

	// ClaimGroupOwnership
	ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error)
}

type MessageStore interface {
	GroupStore

	// ListMessages lists messages in the store
	ListMessages(ctx context.Context) (<-chan *bertyprotocol.GroupMessageEvent, error)

	// AddMessage appends a message to the store
	AddMessage(ctx context.Context, data []byte) (operation.Operation, error)
}

type GroupContext interface {
	GetGroup() *group.Group
	GetMemberPrivKey() crypto.PrivKey
	GetDevicePrivKey() crypto.PrivKey
	GetDeviceSecret(context.Context) (*bertyprotocol.DeviceSecret, error)
	GetMetadataStore() MetadataStore
	SetMetadataStore(s MetadataStore)
	GetMessageKeysHolder() MessageKeysHolder
	SetMessageKeysHolder(m MessageKeysHolder)
	GetMessageStore() MessageStore
	SetMessageStore(s MessageStore)
}

type BertyOrbitDB interface {
	iface.BaseOrbitDB

	RegisterGroupContext(GroupContext) error
	GetGroupContext(groupID string) (GroupContext, error)
	SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error
	InitStoresForGroup(context.Context, GroupContext, *orbitdb.CreateDBOptions) error

	InitGroupStore(ctx context.Context, indexConstructor func(g GroupContext) iface.IndexConstructor, store GroupStore, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error
	GroupMetadataStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (MetadataStore, error)
}
type MessageKeysHolder interface {
	// GetDeviceChainKey gets a device key chain from the key holder
	GetDeviceChainKey(ctx context.Context, pk crypto.PubKey) (*bertyprotocol.DeviceSecret, error)

	// PutDeviceChainKey puts a key chain into the key holder
	PutDeviceChainKey(ctx context.Context, device crypto.PubKey, ds *bertyprotocol.DeviceSecret) error

	// GetPrecomputedKey gets a precomputed key for a device and its message counter value
	GetPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) (*[32]byte, error)

	// DelPrecomputedKey removes a precomputed key for a device and its message counter value
	DelPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) error

	// PutPrecomputedKey stores a precomputed key for a device and its message counter value
	PutPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64, mk *[32]byte) error

	// PutKeyForCID stores a message key for a CID
	PutKeyForCID(ctx context.Context, id cid.Cid, key *[32]byte) error

	// GetKeyForCID gets a message key for a CID
	GetKeyForCID(ctx context.Context, id cid.Cid) (*[32]byte, error)

	// GetPrecomputedKeyExpectedCount returns how many keys are precomputed
	GetPrecomputedKeyExpectedCount() int

	// GroupContext gets the group context associated with this store
	GetGroupContext() GroupContext

	// GetOwnDeviceChainKey gets the current device chain key
	GetOwnDeviceChainKey(ctx context.Context) (*bertyprotocol.DeviceSecret, error)
}
