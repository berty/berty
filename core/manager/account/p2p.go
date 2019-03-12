package account

import (
	"context"

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

	if err := a.network.Update(ctx, opts...); err != nil {
		return errors.New("account failed to update network")
	}
	a.metric = a.network.Metric()
	a.node.UseNetworkMetric(ctx, a.metric)
	return a.node.UseNetworkDriver(ctx, a.network)
}
