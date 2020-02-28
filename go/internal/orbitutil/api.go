package orbitutil

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/bertyprotocol"
)

type GroupStore interface {
	iface.Store

	InitBaseStore(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error
}

type MetadataStore interface {
	GroupStore

	// ListEvents returns a channel of previously received events
	ListEvents(ctx context.Context) <-chan *bertyprotocol.GroupMetadataEvent

	// MemberCount returns the number of members in the member tree
	MemberCount() int

	// DeviceCount returns the number of devices in the member tree
	DeviceCount() int

	// ListMembers returns a list of members pubkeys indexed in the member tree
	ListMembers() []crypto.PubKey

	// ListDevices returns a list of devices pubkeys indexed in the member tree
	ListDevices() []crypto.PubKey

	// ListAdmins returns a list of admin members pubkeys indexed in the member tree
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

type BertyOrbitDB interface {
	iface.BaseOrbitDB

	OpenGroup(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (*GroupContext, error)

	GroupMetadataStore(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (MetadataStore, error)
	GroupMessageStore(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (MessageStore, error)
}
