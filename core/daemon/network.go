package daemon

import (
	"context"

	"berty.tech/network"
	"berty.tech/network/host"
)

func NewHost(ctx context.Context, cfg *NetworkConfig) (*host.BertyHost, error) {
	// base config
	opts := []host.Option{
		host.WithMetricsReporter(), // @TODO: opt this?
		host.WithSwarmKey(cfg.SwarmKey),
		host.WithIdentity(cfg.Identity),
		host.WithListeners(cfg.BindP2P...),
	}

	if cfg.Mobile {
		opts = append(opts, host.WithMobileMode())
	}

	if cfg.Mdns {
		opts = append(opts, host.WithMDNSService())
	}

	return host.New(ctx, opts...)
}

func NewNetworkDriver(ctx context.Context, cfg *NetworkConfig) (network.Driver, error) {
	bh, err := NewHost(ctx, cfg)
	if err != nil {
		return nil, err
	}

	opts := []network.Option{}
	if len(cfg.Bootstrap) > 0 {
		opts = append(opts, network.WithBootstrap(cfg.Bootstrap...))
	}

	if cfg.PeerCache {
		opts = append(opts, network.WithPeerCache())
	}

	return network.New(ctx, bh, opts...)
}
