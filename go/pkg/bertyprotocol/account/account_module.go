package account

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type module struct{}

func (m *module) NewAccount(ctx context.Context /* params */) (iface.Account, error) {
	panic("implement me")
}

func (m *module) NewAccountFromExistingDevice(ctx context.Context /* params */) (iface.Account, error) {
	panic("implement me")
}

func (m *module) NewAccountFromExport(ctx context.Context, export []byte) (iface.Account, error) {
	panic("implement me")
}

func (m *module) OpenAccount(ctx context.Context /* params */) (iface.Account, error) {
	panic("implement me")
}

func (m *module) DeleteAccount(ctx context.Context /* params */) error {
	panic("implement me")
}

func AccountModule() iface.AccountModule {
	if instance == nil {
		instance = &module{}
	}

	return instance
}

var instance iface.AccountModule = (*module)(nil)
