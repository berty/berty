package network

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/network/config"
	host "berty.tech/core/network/host"
	"berty.tech/core/pkg/tracing"
	"go.uber.org/zap"
)

type Network struct {
	host *host.BertyHost

	handler func(context.Context, *entity.Envelope) (*entity.Void, error)

	shutdown context.CancelFunc
}

// Chainconfig.Options chains multiple options into a single option.
func ChainOptions(opts ...config.Option) config.Option {
	return func(cfg *config.Config) error {
		for _, opt := range opts {
			if err := opt(cfg); err != nil {
				return err
			}
		}
		return nil
	}
}

func New(ctx context.Context, opts ...config.Option) (*Network, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	ctx, cancel := context.WithCancel(ctx)

	var err error
	var cfg config.Config

	net := &Network{
		shutdown: cancel,
	}

	if err := cfg.Apply(ctx, opts...); err != nil {
		cancel()
		return nil, err
	}

	net.host, err = cfg.NewNode(ctx)
	if err != nil {
		cancel()
		return nil, err
	}

	net.host.SetStreamHandler(ProtocolID, net.handleEnvelope)
	net.logHostInfos()

	// bootstrap default peers
	if err := net.Bootstrap(ctx, false, cfg.Bootstrap...); err != nil {
		logger().Error(err.Error())
		return nil, err
	}

	// advertise and find peers on berty discovery service
	net.Discover(ctx)

	return net, nil
}

func (net *Network) Close(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	net.shutdown()

	// FIXME: save cache to speedup next connections
	var err error

	// close host
	if net.host != nil {
		err = net.host.Close()
		if err != nil {
			logger().Error("p2p close error", zap.Error(err))
		}
	}

	return nil
}
