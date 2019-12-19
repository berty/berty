package orbitutilapi

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	"berty.tech/go/internal/group"
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

	// MemberForDevice gets member associated to the device passed as argument
	MemberForDevice(crypto.PubKey) (crypto.PubKey, error)

	// RedeemInvitation add a device to the list of the members of the group
	RedeemInvitation(ctx context.Context, invitation *group.Invitation) (operation.Operation, error)
}

type SettingStore interface {
	GroupStore

	Set(ctx context.Context, name string, value []byte) (operation.Operation, error)
	Get(member crypto.PubKey) (map[string][]byte, error)
	SetForGroup(ctx context.Context, name string, value []byte) (operation.Operation, error)
	GetForGroup() (map[string][]byte, error)
}

type SecretStore interface {
	GroupStore

	// GetDeviceSecret gets secret device
	GetDeviceSecret(senderDevicePubKey crypto.PubKey) (*group.DeviceSecret, error)

	// SendSecret sends secret of this device to another group member
	SendSecret(ctx context.Context, remoteMemberPubKey crypto.PubKey) (operation.Operation, error)
}

type GroupContext interface {
	GetGroup() *group.Group
	GetMemberPrivKey() crypto.PrivKey
	GetDevicePrivKey() crypto.PrivKey
	GetDeviceSecret() *group.DeviceSecret
	GetMemberStore() MemberStore
	GetSettingStore() SettingStore
	GetSecretStore() SecretStore

	SetMemberStore(s MemberStore)
	SetSettingStore(s SettingStore)
	SetSecretStore(s SecretStore)
}

type BertyOrbitDB interface {
	iface.BaseOrbitDB

	RegisterGroupContext(GroupContext) error
	GetGroupContext(groupID string) (GroupContext, error)
	SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error
	InitStoresForGroup(context.Context, GroupContext, *orbitdb.CreateDBOptions) error

	InitGroupStore(ctx context.Context, indexConstructor func(g GroupContext) iface.IndexConstructor, store GroupStore, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error
	GroupMemberStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (MemberStore, error)
	GroupSettingStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (SettingStore, error)
	GroupSecretStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (SecretStore, error)
}
