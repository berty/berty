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

	updated, err := network.New(ctx, append(
		[]network_config.Option{network.WithConfig(a.network.Config())},
		opts...,
	)...)

	if err != nil {
		return errors.New("account failed to update network")
	}
	if err := a.node.UseNetworkDriver(ctx, updated); err != nil {
		return a.node.UseNetworkDriver(ctx, a.network)
	}

	a.node.UseNetworkMetric(ctx, updated.Metric())

	err = a.network.Close(ctx)
	if err != nil {
		logger().Error("last network cannot be closed: " + err.Error())
	}

	a.network = updated
	a.metric = updated.Metric()
	return nil
}

func (a *Account) Network() network.Driver {
	return a.network
}
