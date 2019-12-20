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

type MemberEntry struct {
	Member   crypto.PubKey
	Devices  []crypto.PubKey
	Inviters []crypto.PubKey
}

type GroupStore interface {
	iface.Store

	InitBaseStore(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error

	SetGroupContext(GroupContext)
	GetGroupContext() GroupContext
}

type MemberStore interface {
	GroupStore

	// InviterCount returns the number of inviters in the member tree
	InviterCount() (int, error)
	// GetEntriesByInviter returns the entries associated to an inviterPubKey
	GetEntriesByInviter(inviterPubKey crypto.PubKey) ([]MemberEntry, error)
	// ListInviters returns a list of inviters's pubkey indexed in the member tree
	ListInviters() ([]crypto.PubKey, error)

	// MemberCount returns the number of members in the member tree
	MemberCount() (int, error)
	// GetEntriesByMember returns the entry associated to a memberPubKey
	GetEntryByMember(memberPubKey crypto.PubKey) (MemberEntry, error)
	// ListMembers returns a list of members's pubkey indexed in the member tree
	ListMembers() ([]crypto.PubKey, error)

	// DeviceCount returns the number of devices in the member tree
	DeviceCount() (int, error)
	// GetEntriesByDevice returns the entry associated to an devicePubKey
	GetEntryByDevice(devicePubKey crypto.PubKey) (MemberEntry, error)
	// ListDevices returns a list of devices's pubkey indexed in the member tree
	ListDevices() ([]crypto.PubKey, error)

	// GetGroupCreator returns the entry of the group creator
	GetGroupCreator() (MemberEntry, error)

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

	// SendSecret sends secret of this device to group member
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
