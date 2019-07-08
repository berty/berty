package account

import (
	"context"

	"berty.tech/core/pkg/tracing"
	"berty.tech/network"
	network_config "berty.tech/network/config"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func (a *Account) UpdateNetwork(ctx context.Context, opts ...network_config.Option) error {
	tracer := tracing.EnterFunc(ctx, opts)
	defer tracer.Finish()
	ctx = tracer.Context()

	updated, err := network.New(ctx, append(
		[]network_config.Option{
			network.WithConfig(a.network.Config()),
			// FIXME: this should not be here, enable metric here
			// avoid some panic if metric was enable before
			network.EnableMetric(),
		},
		opts...,
	)...)

	if err != nil {
		return errors.New("account failed to update network")
	}
	if err := a.node.UseNetworkDriver(ctx, updated); err != nil {
		logger().Error("use network driver error", zap.Error(err))
		return a.node.UseNetworkDriver(ctx, a.network)
	}

	metric := updated.Metric()
	if metric == nil {
		logger().Info("metric disabled")
	} else {
		logger().Info("metric enabled")
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
