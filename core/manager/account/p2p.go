package account

import (
	"context"

	"berty.tech/core/pkg/tracing"
	"berty.tech/network"
	"berty.tech/network/host"
)

func (a *Account) UpdateNetworkHost(ctx context.Context, bh *host.BertyHost) error {
	tracer := tracing.EnterFunc(ctx, bh)
	defer tracer.Finish()
	ctx = tracer.Context()

	a.network.UpdateHost(bh)
	return nil
}

func (a *Account) Network() network.Driver {
	return a.network
}
