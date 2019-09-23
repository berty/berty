package iface

import (
	"context"
	"io"
	"net"
)

type AccountEvent interface {
	// StreamRequest
	// GroupMessage
	// GroupBroadcast
	// GroupInvitation
	// GroupMember
}

type NetworkConfiguration interface {
}

type AccountInformation interface {
}

type Identifiable interface {
	GetID() []byte
}

type Reachable interface {
	GetRendezvousPoint() []byte
}

type Verifiable interface {
	GetPublicKey() []byte
	GetSignature() []byte
}

// Items

type Account interface {
	Identifiable
	io.Closer

	// Getters
	GetContact() Contact
	GetAccountInformation(ctx context.Context) (AccountInformation, error)
	GetNetworkConfiguration(ctx context.Context) (NetworkConfiguration, error)

	// Rendezvous point methods
	ResetRendezvousPoint(ctx context.Context) error
	DisableRendezvousPoint(ctx context.Context) error
	EnableRendezvousPoint(ctx context.Context) error

	// Devices related methods
	SyncToDevices(ctx context.Context) error
	ExportAccountData(ctx context.Context) ([]byte, error)
	LinkNewDevice(ctx context.Context /* params */) error

	// Modules
	ContactsModule() ContactsModule
	GroupsModule() GroupsModule

	// Subscriptions
	RegisterEventHandler(ctx context.Context) (chan<- AccountEvent, error)
}

type StreamRequest interface {
	Identifiable

	// Getters
	GetPayload() []byte
	GetDevice() Device

	// Actions
	AcceptRequest(ctx context.Context) (net.Conn, error)
	DiscardRequest(ctx context.Context) error
	RefuseRequest(ctx context.Context) error
}

type Device interface {
	Identifiable

	// Getters
	GetContact() Contact

	// Actions
	OpenStreamToDevice(ctx context.Context) (net.Conn, error)
}

type Contact interface {
	Identifiable
	Reachable

	// Getters
	GetSigChain() SigChain
	ListDevices(ctx context.Context) (chan<- Device, error)

	// Actions
	AcceptRequest(ctx context.Context) error
	DiscardRequest(ctx context.Context) error
	OpenStream(ctx context.Context) (net.Conn, error)
	Remove(ctx context.Context) error
}

type GroupBroadcastMessage interface {
	Identifiable

	// Getters
	GetGroupBroadcast() GroupBroadcast
	GetPayload() []byte
}

type GroupBroadcast interface {
	Identifiable
	io.Closer

	// Getters
	GetLastPayload() GroupBroadcastMessage

	// Actions
	Subscribe(ctx context.Context) (chan<- GroupBroadcastMessage, error)
	Send(ctx context.Context, payload []byte) error
}

type GroupMessage interface {
	Identifiable

	GetMember() GroupMember
	GetPayload() []byte
	// ...
}

type GroupMember interface {
	Identifiable
	Verifiable

	GetGroup() Group
	GetDevice() Device // Should we replace it with a "unique to this group" contact?
}

type GroupInvitation interface {
	Identifiable
	Reachable

	// Getters
	GetGroupID() []byte

	// Actions
	AcceptRequest(ctx context.Context) (Group, error)
	DiscardRequest(ctx context.Context) error
}

type Group interface {
	Identifiable
	Reachable

	// Getter
	GetRendezvousSeed() []byte

	// Lists
	ListMessages(ctx context.Context) (chan<- GroupMessage, error)

	// Actions
	InviteContact(ctx context.Context, contact Contact) error
	GenerateInviteToken(ctx context.Context) ([]byte, error)
	AddMessage(ctx context.Context, payload []byte) (GroupMessage, error)
	InitGroupBroadcast(ctx context.Context) (GroupBroadcast, error)

	Leave(ctx context.Context) error
}

// Static methods

type AccountModule interface {
	NewAccount(ctx context.Context /* params */) (Account, error)
	NewAccountFromExistingDevice(ctx context.Context /* params */) (Account, error)
	NewAccountFromExport(ctx context.Context, export []byte) (Account, error)
	OpenAccount(ctx context.Context /* params */) (Account, error)
	DeleteAccount(ctx context.Context /* params */) error
}

type ContactsModule interface {
	ListContacts(ctx context.Context) (chan<- Contact, error)
	ListIncomingRequests(ctx context.Context) (chan<- Contact, error)

	GetByID(ctx context.Context, id []byte) (Contact, error)
	RequestContact(ctx context.Context, accountID, rendezvousSecret []byte) (Contact, error)
}

type GroupsModule interface {
	ListGroups(ctx context.Context) (chan<- Group, error)
	ListIncomingInvitations(ctx context.Context) (chan<- GroupMember, error)

	Create(ctx context.Context, members []Contact /* meta (name ...) */)
}
