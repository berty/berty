package orbitutilapi

import (
	"context"

	"berty.tech/berty/go/internal/group"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type GroupStore interface {
	iface.Store

	InitBaseStore(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error

	SetGroupContext(GroupContext)
	GetGroupContext() GroupContext
}

type MemberStore interface {
	GroupStore

	// ListMembers gets the list of the devices of the group
	ListMembers() ([]*group.MemberDevice, error)

	// RedeemInvitation add a device to the list of the members of the group
	RedeemInvitation(ctx context.Context, memberPrivateKey crypto.PrivKey, devicePrivateKey crypto.PrivKey, invitation *group.Invitation) (operation.Operation, error)
}

type SettingsStore interface {
	GroupStore

	Set(ctx context.Context, name string, value []byte, member crypto.PrivKey) (operation.Operation, error)
	Get(member crypto.PubKey) (map[string][]byte, error)
	SetForGroup(ctx context.Context, name string, value []byte, member crypto.PrivKey) (operation.Operation, error)
	GetForGroup() (map[string][]byte, error)
}

type GroupContext interface {
	GetGroup() *group.Group
	GetMemberStore() MemberStore
	GetSettingsStore() SettingsStore

	SetGroup(group *group.Group)
	SetMemberStore(s MemberStore)
	SetSettingsStore(s SettingsStore)
}

type BertyOrbitDB interface {
	iface.BaseOrbitDB

	RegisterGroupContext(GroupContext) error
	GetGroupContext(groupID string) (GroupContext, error)
	SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error
	InitStoresForGroup(context.Context, *group.Group, *orbitdb.CreateDBOptions) (GroupContext, error)

	InitGroupStore(ctx context.Context, indexConstructor func(g GroupContext) iface.IndexConstructor, store GroupStore, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error
	GroupSettingsStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (SettingsStore, error)
	GroupMemberStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (MemberStore, error)
}
