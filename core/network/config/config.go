package config

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	pnet "github.com/libp2p/go-libp2p-pnet"
	routing "github.com/libp2p/go-libp2p-routing"

	"berty.tech/core/network/host"
	"berty.tech/core/network/metric"
	"berty.tech/core/network/protocol/ble"
	"berty.tech/core/network/protocol/mdns"
	"berty.tech/core/pkg/errorcodes"
	libp2p "github.com/libp2p/go-libp2p"
	circuit "github.com/libp2p/go-libp2p-circuit"
	libp2p_crypto "github.com/libp2p/go-libp2p-crypto"
	discovery "github.com/libp2p/go-libp2p-discovery"
	libp2p_host "github.com/libp2p/go-libp2p-host"
	quic "github.com/libp2p/go-libp2p-quic-transport"
	libp2p_config "github.com/libp2p/go-libp2p/config"
)

const DefaultSwarmKey = `/key/swarm/psk/1.0.0/
/base16/
7beb018da4c79cb018e05305335d265046909f060c1b65e8eef94a107b9387cc`

var DefaultBootstrap = []string{
	"/ip4/51.158.71.240/udp/4004/quic/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.71.240/tcp/4004/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.71.240/tcp/443/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.71.240/tcp/80/ipfs/QmeYFvq4VV5RU1k1wBw3J5ZZLYxTE6H3AAKMzCAavuBjTp",
	"/ip4/51.158.67.118/udp/4004/quic/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.158.67.118/tcp/4004/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.158.67.118/tcp/443/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.158.67.118/tcp/80/ipfs/QmS88MDaMZUQeEvVdRAFmMfMz96b19Y79VJ6wQJnf4dwoo",
	"/ip4/51.15.221.60/udp/4004/quic/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
	"/ip4/51.15.221.60/tcp/4004/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
	"/ip4/51.15.221.60/tcp/443/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
	"/ip4/51.15.221.60/tcp/80/ipfs/QmZP7oAGikmrMLAmf7ooNtnarYdDWki4Wru2sJ5H5kgCw3",
}

var BootstrapIpfs = []string{
	"/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	"/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
	"/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
	"/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
	"/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
}

type Config struct {
	libp2p_config.Config

	Bind []string

	MDNS bool
	DHT  bool

	BLE  bool
	QUIC bool

	DefaultBootstrap bool
	Bootstrap        []string

	Ping bool

	Metric bool

	HOP bool

	SwarmKey string

	Identity string

	routing *host.BertyRouting // needed to get it from berty host
}

type Option func(cfg *Config) error

// Apply applies the given options to the config, returning the first error
// encountered (if any).
func (cfg *Config) Apply(ctx context.Context, opts ...Option) error {
	for _, opt := range opts {
		if err := opt(cfg); err != nil {
			return err
		}
	}

	libp2pOpts := []libp2p_config.Option{
		libp2p.DefaultMuxers,
		libp2p.DefaultPeerstore,
		libp2p.DefaultSecurity,
		libp2p.NATPortMap(),
		libp2p.DefaultTransports,
	}

	if cfg.DefaultBootstrap {
		cfg.Bootstrap = append(cfg.Bootstrap, DefaultBootstrap...)
	}
	logger().Debug(fmt.Sprintf("bootstrap: %+v", cfg.Bootstrap))

	if len(cfg.Bind) > 0 {
		libp2pOpts = append(libp2pOpts, libp2p.ListenAddrStrings(cfg.Bind...))
	} else {
		libp2pOpts = append(libp2pOpts, libp2p.DefaultListenAddrs)
	}

	// add ble transport
	if cfg.BLE {
		libp2pOpts = append(libp2pOpts, libp2p.Transport(ble.NewTransport))
	}

	// add quic transport
	if cfg.QUIC {
		libp2pOpts = append(libp2pOpts, libp2p.Transport(quic.NewTransport))
	}

	// relay
	libp2pOpts = append(libp2pOpts, libp2p.EnableAutoRelay())
	if cfg.HOP {
		libp2pOpts = append(libp2pOpts, libp2p.EnableRelay(circuit.OptActive, circuit.OptHop))
	} else {
		libp2pOpts = append(libp2pOpts, libp2p.EnableRelay(circuit.OptActive))
	}

	// private network
	if cfg.SwarmKey != "" {
		prot, err := pnet.NewProtector(strings.NewReader(cfg.SwarmKey))
		if err != nil {
			return err
		}
		libp2pOpts = append(libp2pOpts, libp2p.PrivateNetwork(prot))
	}

	// identity
	if cfg.Identity != "" {
		bytes, err := base64.StdEncoding.DecodeString(cfg.Identity)
		if err != nil {
			return errorcodes.ErrNetP2PIdentity.Wrap(err)
		}

		identity, err := libp2p_crypto.UnmarshalPrivateKey(bytes)
		if err != nil {
			return errorcodes.ErrNetP2PPublicKey.Wrap(err)
		}
		libp2pOpts = append(libp2pOpts, libp2p.Identity(identity))
	} else {
		libp2pOpts = append(libp2pOpts, libp2p.RandomIdentity)
	}

	// override libp2p configuration
	for _, opt := range libp2pOpts {
		if err := opt(&cfg.Config); err != nil {
			return err
		}
	}

	// override conn manager
	cfg.Config.ConnManager = host.NewBertyConnMgr(ctx, 10, 20, time.Duration(60*time.Minute))

	// override ping service
	cfg.Config.DisablePing = true

	// setup dht for libp2p routing host

	return nil
}

func (cfg *Config) NewNode(ctx context.Context) (*host.BertyHost, error) {
	var err error

	discoveries := []discovery.Discovery{}

	bertyHost := &host.BertyHost{}
	cfg.Config.Routing = func(h libp2p_host.Host) (routing.PeerRouting, error) {
		var err error
		bertyHost.Host = h
		if cfg.routing, err = host.NewBertyRouting(ctx, bertyHost, cfg.DHT); err != nil {
			return nil, err
		}
		return cfg.routing, nil
	}

	_, err = cfg.Config.NewNode(ctx)
	if err != nil {
		return nil, err
	}

	// configure mdns service
	if cfg.MDNS {
		if mdns, err := mdns.NewDiscovery(ctx, bertyHost); err != nil {
			return nil, err
		} else {
			discoveries = append(discoveries, mdns)
		}
	}

	// configure ping service
	var pingOpt *host.PingService
	if cfg.Ping {
		pingOpt = host.NewPingService(bertyHost)
	}

	// configure metric service
	var metricOpt metric.Metric
	if cfg.Metric {
		metricOpt = metric.NewBertyMetric(ctx, bertyHost, pingOpt)
		bertyHost.Network().Notify(metricOpt)
	}

	bertyHost.Discovery = host.NewBertyDiscovery(ctx, discoveries)
	bertyHost.Routing = cfg.routing
	bertyHost.Metric = metricOpt
	bertyHost.Ping = pingOpt

	bertyHost.Network().Notify(cfg.routing)
	return bertyHost, nil
}
