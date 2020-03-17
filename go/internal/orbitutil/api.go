package orbitutil

import (
	"context"
	"io"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type ContextGroup interface {
	io.Closer
	MessageStore() MessageStore
	MetadataStore() MetadataStore
	Group() *bertyprotocol.Group
	MemberPubKey() crypto.PubKey
	DevicePubKey() crypto.PubKey

	getMessageKeys() bertycrypto.MessageKeys
	getDevicePrivKey() crypto.PrivKey
	getMemberPrivKey() crypto.PrivKey
}

type GroupStore interface {
	iface.Store

	InitBaseStore(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error
}

type MetadataStore interface {
	GroupStore

	// GetIncomingContactRequestsStatus Get the status of incoming contact requests (whether they can should be received or not) and the contact request reference
	GetIncomingContactRequestsStatus() (bool, *bertyprotocol.ShareableContact)

	// ListEvents returns a channel of previously received events
	ListEvents(ctx context.Context) <-chan *bertyprotocol.GroupMetadataEvent

	// ListMembers returns a list of members pubkeys
	ListMembers() []crypto.PubKey

	// ListDevices returns a list of devices pubkeys
	ListDevices() []crypto.PubKey

	// ListAdmins returns a list of admin members pubkeys indexed in the member tree
	ListAdmins() []crypto.PubKey

	// ListMultiMemberGroups
	ListMultiMemberGroups() []*bertyprotocol.Group

	// ListContactsByStatus
	ListContactsByStatus(state bertyprotocol.ContactState) []*bertyprotocol.ShareableContact

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
	GroupJoin(ctx context.Context, g *bertyprotocol.Group) (operation.Operation, error)

	// GroupLeave
	GroupLeave(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactRequestDisable
	ContactRequestDisable(ctx context.Context) (operation.Operation, error)

	// ContactRequestEnable
	ContactRequestEnable(ctx context.Context) (operation.Operation, error)

	// ContactRequestReferenceReset
	ContactRequestReferenceReset(ctx context.Context) (operation.Operation, error)

	// ContactRequestOutgoingEnqueue
	ContactRequestOutgoingEnqueue(ctx context.Context, contact *bertyprotocol.ShareableContact) (operation.Operation, error)

	// ContactRequestOutgoingSent
	ContactRequestOutgoingSent(ctx context.Context, pk crypto.PubKey) (operation.Operation, error)

	// ContactRequestIncomingReceived
	ContactRequestIncomingReceived(ctx context.Context, contact *bertyprotocol.ShareableContact) (operation.Operation, error)

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

	OpenMultiMemberGroup(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (ContextGroup, error)
	OpenAccountGroup(ctx context.Context, options *orbitdb.CreateDBOptions) (ContextGroup, error)
	OpenContactGroup(ctx context.Context, pk crypto.PubKey, options *orbitdb.CreateDBOptions) (ContextGroup, error)

	GroupMetadataStore(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (MetadataStore, error)
	GroupMessageStore(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (MessageStore, error)
}
