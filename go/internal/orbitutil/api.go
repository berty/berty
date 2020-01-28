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

	// GetDeviceSecret
	GetDeviceSecret(crypto.PubKey) (*bertyprotocol.DeviceSecret, error)

	// SendSecret sends secret of this device to group member
	SendSecret(ctx context.Context, memberPK crypto.PubKey) (operation.Operation, error)

	// ClaimGroupOwnership
	ClaimGroupOwnership(ctx context.Context, groupSK crypto.PrivKey) (operation.Operation, error)
}

type GroupContext interface {
	GetGroup() *group.Group
	GetMemberPrivKey() crypto.PrivKey
	GetDevicePrivKey() crypto.PrivKey
	GetDeviceSecret() *bertyprotocol.DeviceSecret
	GetMetadataStore() MetadataStore
	SetMetadataStore(s MetadataStore)
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
