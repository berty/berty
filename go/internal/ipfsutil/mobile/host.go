package node

import (
	"fmt"

	ipfs_p2p "github.com/ipfs/kubo/core/node/libp2p"
	p2p "github.com/libp2p/go-libp2p"
	p2p_host "github.com/libp2p/go-libp2p/core/host"
	p2p_peer "github.com/libp2p/go-libp2p/core/peer"
	p2p_pstore "github.com/libp2p/go-libp2p/core/peerstore"
)

// HostMobile is a p2p_host.Host
var _ p2p_host.Host = (*HostMobile)(nil)

type HostConfigFunc func(p2p_host.Host) error

// @TODO: add custom mobile option here
type HostConfig struct {
	// called after host init
	ConfigFunc HostConfigFunc

	// p2p options
	Options []p2p.Option
}

func ChainHostConfig(cfgs ...HostConfigFunc) HostConfigFunc {
	return func(host p2p_host.Host) (err error) {
		for _, cfg := range cfgs {
			if cfg == nil {
				continue // skip empty config
			}

			if err = cfg(host); err != nil {
				return
			}
		}
		return
	}
}

type HostMobile struct {
	p2p_host.Host
}

func NewHostConfigOption(hopt ipfs_p2p.HostOption, cfg *HostConfig) ipfs_p2p.HostOption {
	return func(id p2p_peer.ID, ps p2p_pstore.Peerstore, options ...p2p.Option) (p2p_host.Host, error) {
		// add p2p custom options
		if cfg.Options != nil {
			options = append(options, cfg.Options...)
		}

		host, err := hopt(id, ps, options...)
		if err != nil {
			return nil, err
		}

		if cfg.ConfigFunc != nil {
			// apply host custom config
			if err := cfg.ConfigFunc(host); err != nil {
				return nil, fmt.Errorf("unable to apply host config: %w", err)
			}
		}

		return host, nil
	}
}
