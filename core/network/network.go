package network

import (
	"context"
	"sync"
	"time"

	"berty.tech/core/entity"
	"berty.tech/core/network/config"
	host "berty.tech/core/network/host"
	"berty.tech/core/pkg/tracing"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type Network struct {
	config *config.Config

	host *host.BertyHost

	handler func(context.Context, *entity.Envelope) (*entity.Void, error)

	updating *sync.Mutex

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

	net := &Network{
		config:   &config.Config{},
		updating: &sync.Mutex{},
		shutdown: cancel,
	}

	if err := net.config.Apply(ctx, opts...); err != nil {
		cancel()
		return nil, err
	}

	net.host, err = net.config.NewNode(ctx)
	if err != nil {
		cancel()
		return nil, err
	}

	net.host.SetStreamHandler(ProtocolID, net.handleEnvelope)
	net.logHostInfos()

	// advertise and find peers on berty discovery service
	net.Discover(ctx)

	// bootstrap default peers
	// TOOD: infinite bootstrap + don't permit routing to provide when no peers are discovered
	for {
		bootstrap := net.config.Bootstrap
		if net.config.DefaultBootstrap {
			bootstrap = append(config.DefaultBootstrap, bootstrap...)
		}
		if err := net.Bootstrap(ctx, true, bootstrap...); err != nil {
			logger().Error(err.Error())
			time.Sleep(time.Second)
			continue
		}
		break
	}

	return net, nil
}

// Update create new network and permit to override previous config
func (net *Network) Update(ctx context.Context, opts ...config.Option) error {
	net.updating.Lock()
	defer net.updating.Unlock()

	updated, err := New(ctx, append([]config.Option{WithConfig(net.config)}, opts...)...)
	if err != nil {
		return errors.Wrap(err, "cannot update network: abort")
	}

	swap := *net

	*net = *updated

	net.updating = swap.updating

	(&swap).Close(ctx)

	return nil
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
