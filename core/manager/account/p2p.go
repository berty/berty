package account

import (
	"context"

	"berty.tech/core/network"
	network_config "berty.tech/core/network/config"
	"berty.tech/core/pkg/tracing"
	"github.com/pkg/errors"
)

func (a *Account) UpdateNetwork(ctx context.Context, opts ...network_config.Option) error {
	tracer := tracing.EnterFunc(ctx, opts)
	defer tracer.Finish()
	ctx = tracer.Context()

	err := a.network.Close(ctx)
	if err != nil {
		return err
	}

	if err := WithNetwork(network.New(ctx, opts...))(a); err != nil {
		return errors.New("account failed to update network")
	}

	return a.node.UseNetworkDriver(ctx, a.network)
}
