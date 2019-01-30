package account

import (
	"context"
	"encoding/base64"
	"io"
	"runtime"
	"time"

	"berty.tech/core/pkg/errorcodes"

	"berty.tech/core/network"
	"berty.tech/core/network/p2p"
	"berty.tech/core/pkg/tracing"
	grpc_ot "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	"github.com/jinzhu/gorm"
	p2pcrypto "github.com/libp2p/go-libp2p-crypto"
)

type P2PNetworkOptions struct {
	Bind      []string
	Transport []string
	Bootstrap []string
	MDNS      bool
	Relay     bool
	Metrics   bool
	SwarmKey  io.Reader
	Identity  string
}

func makeTransport(opts *P2PNetworkOptions, p2pOptions []p2p.Option, db *gorm.DB) []p2p.Option {
	for _, v := range opts.Transport {
		if v == "default" {
			p2pOptions = append(p2pOptions, p2p.WithDefaultTransports())
		} else if v == "ble" {
			p2pOptions = append(p2pOptions, p2p.WithTransportBle(opts.Bind, db))
		}
	}
	return p2pOptions
}

func createP2PNetwork(ctx context.Context, opts *P2PNetworkOptions, db *gorm.DB) (network.Driver, network.Metrics, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()
	span := tracer.Span()

	if opts == nil {
		opts = &P2PNetworkOptions{}
	}

	p2pOptions := []p2p.Option{}

	// Bind
	if opts.Bind == nil {
		opts.Bind = []string{"/ip4/0.0.0.0/tcp/0"}
		if runtime.GOOS != "android" {
			opts.Bind = append(opts.Bind, "/ble/00000000-0000-0000-0000-000000000000")
		}
	}

	var identity p2p.Option
	if opts.Identity == "" {
		identity = p2p.WithRandomIdentity()
	} else {
		bytes, err := base64.StdEncoding.DecodeString(opts.Identity)
		if err != nil {
			return nil, nil, errorcodes.ErrNetP2PIdentity.Wrap(err)
		}

		prvKey, err := p2pcrypto.UnmarshalPrivateKey(bytes)
		if err != nil {
			return nil, nil, errorcodes.ErrNetP2PPublicKey.Wrap(err)
		}

		identity = p2p.WithIdentity(prvKey)
	}

	p2pOptions = makeTransport(opts, p2pOptions, db)

	p2pOptions = append(p2pOptions,
		p2p.WithDefaultMuxers(),
		p2p.WithDefaultPeerstore(),
		p2p.WithDefaultSecurity(),
		p2p.WithQUICTransport(),
		// @TODO: Allow static identity loaded from a file (useful for relay
		// server for creating static endpoint for bootstrap)
		// p2p.WithIdentity(<key>),
		p2p.WithJaeger(grpc_ot.WithTracer(span.Tracer())),
		p2p.WithNATPortMap(), // @TODO: Is this a pb on mobile?
		p2p.WithListenAddrStrings(opts.Bind...),
		p2p.WithBootstrap(opts.Bootstrap...),
		p2p.WithConnManager(10, 20, time.Duration(60*1000)),
		identity,
	)

	if opts.MDNS {
		p2pOptions = append(p2pOptions, p2p.WithMDNS())
	}

	if opts.Relay {
		p2pOptions = append(p2pOptions, p2p.WithRelayHOP())
	} else {
		p2pOptions = append(p2pOptions, p2p.WithRelayClient())
	}

	if opts.SwarmKey != nil {
		p2pOptions = append(p2pOptions, p2p.WithSwarmKey(opts.SwarmKey))
	}

	driver, err := p2p.NewDriver(ctx, p2pOptions...)
	if err != nil {
		return nil, nil, err
	}

	var metrics network.Metrics
	if opts.Metrics {
		metrics = p2p.NewMetrics(ctx, driver)
	}

	return driver, metrics, nil
}

func WithP2PNetwork(opts *P2PNetworkOptions) NewOption {
	return func(a *Account) error {
		tracer := tracing.EnterFunc(a.rootContext)
		defer tracer.Finish()
		ctx := tracer.Context()

		var err error

		a.network, a.metrics, err = createP2PNetwork(ctx, opts, a.db)
		if err != nil {
			return err
		}

		return nil
	}
}

func (a *Account) UpdateP2PNetwork(ctx context.Context, opts *P2PNetworkOptions) error {
	tracer := tracing.EnterFunc(ctx, opts)
	defer tracer.Finish()
	ctx = tracer.Context()

	err := a.network.Close(ctx)
	if err != nil {
		return err
	}

	a.network, a.metrics, err = createP2PNetwork(ctx, opts, a.db)
	if err != nil {
		return err
	}

	return a.node.UseNetworkDriver(ctx, a.network)
}
