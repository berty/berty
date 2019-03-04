package network

import (
	"strings"

	pnet "github.com/libp2p/go-libp2p-pnet"

	"berty.tech/core/network/config"
	"berty.tech/core/network/protocol/ble"
	libp2p "github.com/libp2p/go-libp2p"
	circuit "github.com/libp2p/go-libp2p-circuit"
	quic "github.com/libp2p/go-libp2p-quic-transport"
)

// WithLibp2pconfig.Options
// Permit to override network default configuration for libp2p
func WithLibp2pOptions(opts ...libp2p.Option) config.Option {
	return func(cfg *config.Config) error {
		return libp2p.ChainOptions(opts...)(&cfg.Config)
	}
}

// Default options

func WithDefaultOptions() config.Option {
	return ChainOptions(
		WithLibp2pOptions(
			libp2p.DefaultListenAddrs,
			libp2p.DefaultMuxers,
			libp2p.DefaultPeerstore,
			libp2p.DefaultSecurity,
			libp2p.NATPortMap(),
			libp2p.DefaultTransports,
			libp2p.Transport(quic.NewTransport),
			libp2p.Transport(ble.NewTransport),
			libp2p.RandomIdentity,
			libp2p.EnableRelay(circuit.OptActive),
			libp2p.EnableAutoRelay(),
		),
		EnableDefaultBootstrap(),
		EnablePing(),
		EnableMDNS(),
		PrivateNetwork(config.DefaultSwarmKey),
		EnableDHT(),
		EnableMetric(),
	)
}

func WithDefaultMobileOptions() config.Option {
	return ChainOptions(
		WithDefaultOptions(),
		// ...
	)
}

func WithDefaultRelayOptions() config.Option {
	return ChainOptions(
		WithDefaultOptions(),
		WithLibp2pOptions(
			libp2p.EnableRelay(circuit.OptActive, circuit.OptHop),
		),
		EnableDHT(),
		DisableMDNS(),
	)
}

// Custom options

func EnableMDNS() config.Option {
	return func(cfg *config.Config) error {
		cfg.MDNS = true
		return nil
	}
}

func DisableMDNS() config.Option {
	return func(cfg *config.Config) error {
		cfg.MDNS = false
		return nil
	}
}

func PrivateNetwork(swarmKey string) config.Option {
	return func(cfg *config.Config) error {
		if cfg.Config.Protector != nil {
			cfg.Config.Protector = nil
		}
		prot, err := pnet.NewProtector(strings.NewReader(swarmKey))
		if err != nil {
			return err
		}
		return WithLibp2pOptions(libp2p.PrivateNetwork(prot))(cfg)
	}
}

func EnableDefaultBootstrap() config.Option {
	return func(cfg *config.Config) error {
		cfg.DefaultBootstrap = true
		return nil
	}
}

func DisableDefaultBootstrap() config.Option {
	return func(cfg *config.Config) error {
		cfg.DefaultBootstrap = false
		return nil
	}
}

func Bootstrap(addr ...string) config.Option {
	return func(cfg *config.Config) error {
		cfg.Bootstrap = append(cfg.Bootstrap, addr...)
		return nil
	}
}

func EnableDHT() config.Option {
	return func(cfg *config.Config) error {
		cfg.DHT = true
		return nil
	}
}

func DisableDHT() config.Option {
	return func(cfg *config.Config) error {
		cfg.DHT = false
		return nil
	}
}

func EnablePing() config.Option {
	return func(cfg *config.Config) error {
		cfg.Ping = true
		return nil
	}
}

func DisablePing() config.Option {
	return func(cfg *config.Config) error {
		cfg.Ping = false
		return nil
	}
}

func EnableMetric() config.Option {
	return func(cfg *config.Config) error {
		cfg.Metric = true
		return nil
	}
}

func DisableMetric() config.Option {
	return func(cfg *config.Config) error {
		cfg.Metric = false
		return nil
	}
}
