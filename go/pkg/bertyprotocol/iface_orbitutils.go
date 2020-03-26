package bertyprotocol

import (
	"context"
	"io"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/ipfs/go-cid"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type ContextGroup interface {
	io.Closer
	MessageStore() MessageStore
	MetadataStore() MetadataStore
	Group() *bertytypes.Group
	MemberPubKey() crypto.PubKey
	DevicePubKey() crypto.PubKey
	GetMessageKeys() MessageKeys
	GetDevicePrivKey() crypto.PrivKey
	GetMemberPrivKey() crypto.PrivKey
}

type GroupStore interface {
	iface.Store

	InitBaseStore(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error
}

type MetadataStore interface {
	GroupStore

	// GetIncomingContactRequestsStatus Get the status of incoming contact requests (whether they can should be received or not) and the contact request reference
	GetIncomingContactRequestsStatus() (bool, *bertytypes.ShareableContact)

	// ListEvents returns a channel of previously received events
	ListEvents(ctx context.Context) <-chan *bertytypes.GroupMetadataEvent

	// ListMembers returns a list of members pubkeys
	ListMembers() []crypto.PubKey

	// ListDevices returns a list of devices pubkeys
	ListDevices() []crypto.PubKey

	// ListAdmins returns a list of admin members pubkeys indexed in the member tree
	ListAdmins() []crypto.PubKey

	// ListMultiMemberGroups
	ListMultiMemberGroups() []*bertytypes.Group

	// ListContactsByStatus
	ListContactsByStatus(state ...bertytypes.ContactState) []*bertytypes.ShareableContact

	// GetMemberByDevice
	GetMemberByDevice(crypto.PubKey) (crypto.PubKey, error)

	// GetDevicesForMember
	GetDevicesForMember(crypto.PubKey) ([]crypto.PubKey, error)

	// AddDeviceToGroup
	AddDeviceToGroup(ctx context.Context) (operation.Operation, error)

	// SendSecret sends secret of this device to group member
	SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error)

	// ClaimGroupOwnership
	ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error)

	// GroupJoin
	GroupJoin(ctx context.Context, g *bertytypes.Group) (operation.Operation, error)

	// GroupLeave
	GroupLeave(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactRequestDisable
	ContactRequestDisable(ctx context.Context) (operation.Operation, error)

	// ContactRequestEnable
	ContactRequestEnable(ctx context.Context) (operation.Operation, error)

	// ContactRequestReferenceReset
	ContactRequestReferenceReset(ctx context.Context) (operation.Operation, error)

	// ContactRequestOutgoingEnqueue
	ContactRequestOutgoingEnqueue(ctx context.Context, contact *bertytypes.ShareableContact) (operation.Operation, error)

	// ContactRequestOutgoingSent
	ContactRequestOutgoingSent(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactRequestIncomingReceived
	ContactRequestIncomingReceived(ctx context.Context, contact *bertytypes.ShareableContact) (operation.Operation, error)

	// ContactRequestIncomingDiscard
	ContactRequestIncomingDiscard(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactRequestIncomingAccept
	ContactRequestIncomingAccept(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactBlock
	ContactBlock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactUnblock
	ContactUnblock(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactSendAliasKey
	ContactSendAliasKey(ctx context.Context) (operation.Operation, error)

	// SendAliasProof
	SendAliasProof(ctx context.Context) (operation.Operation, error)

	// SendAppMetadata
	SendAppMetadata(ctx context.Context, payload []byte) (operation.Operation, error)
}

type MessageStore interface {
	GroupStore

	// ListMessages lists messages in the store
	ListMessages(ctx context.Context) (<-chan *bertytypes.GroupMessageEvent, error)

	// AddMessage appends a message to the store
	AddMessage(ctx context.Context, data []byte) (operation.Operation, error)
}

type BertyOrbitDB interface {
	iface.BaseOrbitDB

	OpenGroup(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (ContextGroup, error)
	OpenAccountGroup(ctx context.Context, options *orbitdb.CreateDBOptions) (ContextGroup, error)

	GroupMetadataStore(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (MetadataStore, error)
	GroupMessageStore(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (MessageStore, error)
}

type BertyOrbitDBConstructor func(ctx context.Context, ipfs coreapi.CoreAPI, acc AccountKeys, mk MessageKeys, options *baseorbitdb.NewOrbitDBOptions) (BertyOrbitDB, error)

type MessageKeys interface {
	// GetDeviceChainKey gets a device key chain from the key holder
	GetDeviceChainKey(ctx context.Context, pk crypto.PubKey) (*bertytypes.DeviceSecret, error)

	// PutDeviceChainKey puts a key chain into the key holder
	PutDeviceChainKey(ctx context.Context, device crypto.PubKey, ds *bertytypes.DeviceSecret) error

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
}
