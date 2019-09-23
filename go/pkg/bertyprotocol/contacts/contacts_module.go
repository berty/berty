package contacts

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type module struct{}

func (m *module) ListContacts(ctx context.Context) (chan<- iface.Contact, error) {
	panic("implement me")
}

func (m *module) ListIncomingRequests(ctx context.Context) (chan<- iface.Contact, error) {
	panic("implement me")
}

func (m *module) GetByID(ctx context.Context, id []byte) (iface.Contact, error) {
	panic("implement me")
}

func (m *module) RequestContact(ctx context.Context, accountID, rendezvousSecret []byte) (iface.Contact, error) {
	panic("implement me")
}

func NewContactsModule() iface.ContactsModule {
	return &module{}
}

var _ iface.ContactsModule = (*module)(nil)
