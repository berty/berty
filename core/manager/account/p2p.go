package account

import (
	"context"
	"encoding/base64"
	"io"

	"berty.tech/core/network"
	"berty.tech/core/network/p2p"
	"github.com/jinzhu/gorm"
	p2pcrypto "github.com/libp2p/go-libp2p-crypto"
	"github.com/pkg/errors"
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

func createP2PNetwork(opts *P2PNetworkOptions, db *gorm.DB) (network.Driver, network.Metrics, error) {
	if opts == nil {
		opts = &P2PNetworkOptions{}
	}

	p2pOptions := []p2p.Option{}

	// Bind
	if opts.Bind == nil {
		opts.Bind = []string{"/ip4/0.0.0.0/tcp/0"}
	}

	var identity p2p.Option
	if opts.Identity == "" {
		identity = p2p.WithRandomIdentity()
	} else {
		bytes, err := base64.StdEncoding.DecodeString(opts.Identity)
		if err != nil {
			return nil, nil, errors.Wrap(err, "failed to decode identity opt, should be base64 encoded")
		}

		prvKey, err := p2pcrypto.UnmarshalPrivateKey(bytes)
		if err != nil {
			return nil, nil, errors.Wrap(err, "failed to unmarshal private key")
		}

		identity = p2p.WithIdentity(prvKey)
	}

	for _, v := range opts.Transport {
		switch v {
		case "default":
			p2pOptions = append(p2pOptions, p2p.WithDefaultTransports())
		case "ble":
			p2pOptions = append(p2pOptions, p2p.WithTransportBle(opts.Bind, db))
		}
	}

	p2pOptions = append(p2pOptions,
		p2p.WithDefaultMuxers(),
		p2p.WithDefaultPeerstore(),
		p2p.WithDefaultSecurity(),
		// @TODO: Allow static identity loaded from a file (useful for relay
		// server for creating static endpoint for bootstrap)
		// p2p.WithIdentity(<key>),
		p2p.WithNATPortMap(), // @TODO: Is this a pb on mobile?
		p2p.WithListenAddrStrings(opts.Bind...),
		p2p.WithBootstrap(opts.Bootstrap...),
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

	driver, err := p2p.NewDriver(context.Background(), p2pOptions...)
	if err != nil {
		return nil, nil, err
	}

	var metrics network.Metrics
	if opts.Metrics {
		metrics = p2p.NewMetrics(driver)
	}

	return driver, metrics, nil
}

func WithP2PNetwork(opts *P2PNetworkOptions) NewOption {
	return func(a *Account) error {
		var err error

		a.network, a.metrics, err = createP2PNetwork(opts, a.db)
		if err != nil {
			return err
		}

		return nil
	}
}

func (a *Account) UpdateP2PNetwork(opts *P2PNetworkOptions) error {
	var err error

	err = a.network.Close()
	if err != nil {
		return err
	}

	a.network, a.metrics, err = createP2PNetwork(opts, a.db)
	if err != nil {
		return err
	}

	a.node.UseNetworkDriver(a.network)

	return nil
}
