package account

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type account struct{}

func (a *account) GetID() []byte {
	panic("implement me")
}

func (a *account) Close() error {
	panic("implement me")
}

func (a *account) GetContact() iface.Contact {
	panic("implement me")
}

func (a *account) GetAccountInformation(ctx context.Context) (iface.AccountInformation, error) {
	panic("implement me")
}

func (a *account) GetNetworkConfiguration(ctx context.Context) (iface.NetworkConfiguration, error) {
	panic("implement me")
}

func (a *account) ResetRendezvousPoint(ctx context.Context) error {
	panic("implement me")
}

func (a *account) DisableRendezvousPoint(ctx context.Context) error {
	panic("implement me")
}

func (a *account) EnableRendezvousPoint(ctx context.Context) error {
	panic("implement me")
}

func (a *account) SyncToDevices(ctx context.Context) error {
	panic("implement me")
}

func (a *account) ExportAccountData(ctx context.Context) ([]byte, error) {
	panic("implement me")
}

func (a *account) LinkNewDevice(ctx context.Context /* params */) error {
	panic("implement me")
}

func (a *account) ContactsModule() iface.ContactsModule {
	panic("implement me")
}

func (a *account) GroupsModule() iface.GroupsModule {
	panic("implement me")
}

func (a *account) RegisterEventHandler(ctx context.Context) (chan<- iface.AccountEvent, error) {
	panic("implement me")
}

var _ iface.Account = (*account)(nil)
