package network

import (
	"runtime"

	"berty.tech/core/network/config"
)

// Default options

// WithConfig
func WithConfig(override *config.Config) config.Option {
	return func(cfg *config.Config) error {
		return cfg.Override(override)
	}
}

func WithClientOptions() config.Option {
	return ChainOptions(
		DisableDHTServer(),
		DisableHOP(),
		DisablePersistConfig(),
		EnableDefaultBind(),
		EnableMetric(),
		EnablePing(),
		EnableTCP(),
		EnablePeerCache(),
	)
}

func WithServerOptions() config.Option {
	return ChainOptions(
		DisablePersistConfig(),
		DisablePeerCache(),
		EnableDHTServer(),
		EnableDefaultBind(),
		EnableHOP(),
		EnableMetric(),
		EnablePing(),
		EnableTCP(),
	)
}

func WithDefaultOptions() config.Option {
	return ChainOptions(
		WithServerOptions(),

		EnablePrivateNetwork(config.DefaultSwarmKey),
		EnableBLE(),
		EnableMDNS(),
		EnableDefaultBootstrap(),
		EnableQUIC(),
		EnableTCP(),
	)
}

func WithServerTestOptions() config.Option {
	return ChainOptions(
		WithServerOptions(),

		DisableDefaultBind(),
		Bind("/ip4/127.0.0.1/tcp/0"),
		DisablePersistConfig(),
		DisableHOP(),
	)
}

func WithClientTestOptions() config.Option {
	return ChainOptions(
		WithClientOptions(),

		DisableDefaultBind(),
		Bind("/ip4/127.0.0.1/tcp/0"),
		DisablePersistConfig(),
		DisableHOP(),
	)
}

func WithDefaultMobileOptions() config.Option {
	return ChainOptions(
		WithClientOptions(),

		EnablePrivateNetwork(config.DefaultSwarmKey),
		EnableDefaultBootstrap(),
		EnableMDNS(),
		DisableBLE(),
		EnableQUIC(),
		EnablePersistConfig(),
	)
}

func WithDefaultRelayOptions() config.Option {
	return ChainOptions(
		WithServerOptions(),

		EnableHOP(),
		EnableDefaultBootstrap(),
		EnableQUIC(),
		DisableMDNS(),
	)
}

// Custom options

func EnablePersistConfig() config.Option {
	return func(cfg *config.Config) error {
		cfg.Persist = true
		return nil
	}
}

func OverridePersistConfig() config.Option {
	return func(cfg *config.Config) error {
		cfg.OverridePersist = true
		return nil
	}
}

func DisablePersistConfig() config.Option {
	return func(cfg *config.Config) error {
		cfg.Persist = false
		cfg.OverridePersist = false
		return nil
	}
}

func WithIdentity(identity string) config.Option {
	return func(cfg *config.Config) error {
		cfg.Identity = identity
		return nil
	}
}

func EnablePrivateNetwork(swarmKey string) config.Option {
	return func(cfg *config.Config) error {
		cfg.SwarmKey = swarmKey
		return nil
	}
}

func DisablePrivateNetwork(swarmKey string) config.Option {
	return func(cfg *config.Config) error {
		cfg.SwarmKey = ""
		return nil
	}
}

func EnableHOP() config.Option {
	return func(cfg *config.Config) error {
		cfg.HOP = true
		return nil
	}
}

func DisableHOP() config.Option {
	return func(cfg *config.Config) error {
		cfg.HOP = false
		return nil
	}
}

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

func EnableDefaultBind() config.Option {
	return func(cfg *config.Config) error {
		cfg.DefaultBind = true
		return nil
	}
}

func DisableDefaultBind() config.Option {
	return func(cfg *config.Config) error {
		cfg.DefaultBind = false
		return nil
	}
}

func Bind(maddr ...string) config.Option {
	return func(cfg *config.Config) error {
		cfg.Bind = append(cfg.Bind, maddr...)
		return nil
	}
}

func EnableDHTServer() config.Option {
	return func(cfg *config.Config) error {
		cfg.DHTServer = true
		return nil
	}
}

func DisableDHTServer() config.Option {
	return func(cfg *config.Config) error {
		cfg.DHTServer = false
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

func EnableWS() config.Option {
	return func(cfg *config.Config) error {
		cfg.WS = true
		return nil
	}
}

func DisableWS() config.Option {
	return func(cfg *config.Config) error {
		cfg.WS = false
		return nil
	}
}

func EnableTCP() config.Option {
	return func(cfg *config.Config) error {
		cfg.TCP = true
		return nil
	}
}

func DisableTCP() config.Option {
	return func(cfg *config.Config) error {
		cfg.TCP = false
		return nil
	}
}

func EnableBLE() config.Option {
	return func(cfg *config.Config) error {
		if runtime.GOOS != "android" && runtime.GOOS != "darwin" {
			logger().Warn("ble not available on your platform: disabled")
			cfg.BLE = false
			return nil
		}
		cfg.BLE = true
		return nil
	}
}

func DisableBLE() config.Option {
	return func(cfg *config.Config) error {
		cfg.BLE = false
		return nil
	}
}

func EnableQUIC() config.Option {
	return func(cfg *config.Config) error {
		cfg.QUIC = true
		return nil
	}
}

func DisableQUIC() config.Option {
	return func(cfg *config.Config) error {
		cfg.QUIC = false
		return nil
	}
}

func EnablePeerCache() config.Option {
	return func(cfg *config.Config) error {
		cfg.PeerCache = true
		return nil
	}
}

func DisablePeerCache() config.Option {
	return func(cfg *config.Config) error {
		cfg.PeerCache = false
		return nil
	}
}

func DisableRelay() config.Option {
	return func(cfg *config.Config) error {
		cfg.Config.Relay = false
		return nil
	}
}
