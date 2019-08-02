package host

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	libp2p "github.com/libp2p/go-libp2p"
	libp2p_quic "github.com/libp2p/go-libp2p-quic-transport"
	libp2p_tcp "github.com/libp2p/go-tcp-transport"
	libp2p_ws "github.com/libp2p/go-ws-transport"

	libp2p_circuit "github.com/libp2p/go-libp2p-circuit"
	libp2p_metrics "github.com/libp2p/go-libp2p-metrics"

	libp2p_crypto "github.com/libp2p/go-libp2p-crypto"
	libp2p_pnet "github.com/libp2p/go-libp2p-pnet"
)

const (
	HighWatermark = 600
	LowWatermark  = 500

	HighWatermarkMobile = 200
	LowWatermarkMobile  = 100
)

type Config struct {
	libp2p_opts []libp2p.Option

	listeners []ma.Multiaddr

	identity string
	swarmKey string

	contextFilters *ContextFilters

	reporter libp2p_metrics.Reporter

	mobile bool
	mdns   bool
}

func NewConfig() *Config {
	return &Config{
		libp2p_opts: DefaultLibp2pOpts(),
		listeners:   defaultListeners,

		identity: "",
		swarmKey: DefaultSwarmKey,
		reporter: nil,

		mobile: false,
		mdns:   false,
	}
}

type Option func(cfg *Config) error

// applyP2POptions configure all libp2p specific options
func (cfg *Config) applyP2POptions(ctx context.Context) error {
	// configure transports & listeners
	for _, l := range cfg.listeners {
		ma.ForEach(l, func(c ma.Component) bool {
			switch c.Protocol().Code {
			case ma.P_TCP:
				cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.Transport(libp2p_tcp.NewTCPTransport))
			case ma.P_QUIC:
				cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.Transport(libp2p_quic.NewTransport))
			case libp2p_ws.WsProtocol.Code:
				cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.Transport(libp2p_ws.New))
			// case mable.P_BLE:
			// 	cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.Transport(ble.NewTransport))
			default: // continue
				return true
			}

			logger().Debug("transport enable",
				zap.String("type", c.Protocol().Name),
				zap.String("listener", l.String()))

			// stop, we found our component
			return false
		})
	}

	if len(cfg.listeners) > 0 {
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.ListenAddrs(cfg.listeners...))
	}

	// swarm key
	if cfg.swarmKey != "" {
		prot, err := libp2p_pnet.NewProtector(strings.NewReader(cfg.swarmKey))
		if err != nil {
			return err
		}
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.PrivateNetwork(prot))
	}

	// identity
	if cfg.identity != "" {
		// parse base64 encoded identity
		bytes, err := base64.StdEncoding.DecodeString(cfg.identity)
		if err != nil {
			return errors.Wrap(err, "failed to decode identity")
		}

		identity, err := libp2p_crypto.UnmarshalPrivateKey(bytes)
		if err != nil {
			return errors.Wrap(err, "failed to unmarshal private key")
		}
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.Identity(identity))
	} else {
		// if no identity is set, generate one
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.RandomIdentity)
	}

	// mobile mode
	if cfg.mobile {
		// enable relay
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.EnableRelay(libp2p_circuit.OptActive, libp2p_circuit.OptDiscovery))

		// configure conn manager
		connmanager := NewBertyConnMgr(ctx, LowWatermarkMobile, HighWatermarkMobile, time.Minute)
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.ConnectionManager(connmanager))
	} else {
		// enable relay with hop mode
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.EnableRelay(libp2p_circuit.OptActive, libp2p_circuit.OptHop))

		// configure conn manager
		connmanager := NewBertyConnMgr(ctx, LowWatermark, HighWatermark, time.Minute)
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.ConnectionManager(connmanager))
	}

	// metric reporter
	if cfg.reporter != nil {
		cfg.libp2p_opts = append(cfg.libp2p_opts, libp2p.BandwidthReporter(cfg.reporter))
	}

	return nil
}

func (cfg *Config) Apply(ctx context.Context, opts ...Option) error {
	for i, opt := range opts {
		if err := opt(cfg); err != nil {
			return fmt.Errorf("option %d failed: %s", i, err)
		}
	}

	return cfg.applyP2POptions(ctx)
}

// Enable mobile mode
func WithMobileMode() Option {
	return func(cfg *Config) error {
		cfg.mobile = true
		return nil
	}
}

func WithMetricsReporter() Option {
	return func(cfg *Config) error {
		cfg.reporter = libp2p_metrics.NewBandwidthCounter()
		return nil
	}
}

// WithMDNSService configure MDNS service
func WithMDNSService() Option {
	return func(cfg *Config) error {
		cfg.mdns = true
		return nil
	}
}

func WithIdentity(identity string) Option {
	return func(cfg *Config) error {
		cfg.identity = identity
		return nil
	}
}

func WithSwarmKey(swarmKey string) Option {
	return func(cfg *Config) error {
		cfg.swarmKey = swarmKey
		return nil
	}
}

// Listeners configure listeners
func WithListeners(addrs ...string) Option {
	return func(cfg *Config) error {
		maddrs := make([]ma.Multiaddr, len(addrs))
		for i, addr := range addrs {
			maddr, err := ma.NewMultiaddr(addr)
			if err != nil {
				return fmt.Errorf("%s is not a correct multiaddr: %s", addr, err)
			}

			maddrs[i] = maddr
		}

		cfg.listeners = maddrs
		return nil
	}
}
