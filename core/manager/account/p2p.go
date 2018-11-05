package account

import (
	"context"
	"encoding/base64"

	"berty.tech/core/network/p2p"
	p2pcrypto "github.com/libp2p/go-libp2p-crypto"
	"github.com/pkg/errors"
)

type P2PNetworkOptions struct {
	Bind             []string
	Transport        []string
	Bootstrap        []string
	DefaultBootstrap bool
	MDNS             bool
	Relay            bool
	Metrics          bool
	Identity         string
}

func WithP2PNetwork(opts *P2PNetworkOptions) NewOption {
	return func(a *Account) error {
		var err error

		if opts == nil {
			opts = &P2PNetworkOptions{}
		}

		p2pOptions := []p2p.Option{}

		// Bind
		if opts.Bind == nil {
			opts.Bind = []string{"/ip4/0.0.0.0/tcp/0"}
		}

		// Bootstrap
		if opts.Bootstrap == nil {
			opts.Bootstrap = []string{}
		}
		if opts.DefaultBootstrap {
			opts.Bootstrap = append(
				opts.Bootstrap,
				"/ip4/104.248.78.238/tcp/4004/ipfs/QmPCbsVWDtLTdCtwfp5ftZ96xccUNe4hegKStgbss8YACT",
			)
		}

		var identity p2p.Option
		if opts.Identity == "" {
			identity = p2p.WithRandomIdentity()
		} else {
			bytes, err := base64.StdEncoding.DecodeString(opts.Identity)
			if err != nil {
				return errors.Wrap(err, "failed to decode identity opt, should be base64 encoded")
			}

			prvKey, err := p2pcrypto.UnmarshalPrivateKey(bytes)
			if err != nil {
				return errors.Wrap(err, "failed to unmarshal private key")
			}

			identity = p2p.WithIdentity(prvKey)
		}

		for _, v := range opts.Transport {
			switch v {
			case "default":
				p2pOptions = append(p2pOptions, p2p.WithDefaultTransports())
			case "ble":
				p2pOptions = append(p2pOptions, p2p.WithTransportBle(opts.Bind, a.db))
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

		driver, err := p2p.NewDriver(context.Background(), p2pOptions...)
		if err != nil {
			return err
		}

		a.network = driver
		if opts.Metrics {
			a.metrics = p2p.NewMetrics(driver)
		}

		return nil
	}
}
