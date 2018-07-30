package p2p

import (
	"fmt"

	"github.com/berty/berty/core/network/host"
	pstore "github.com/libp2p/go-libp2p-peerstore"
)

// Option type to configure host
type Option func(*host.HostConfig) error

func WithPeerstore(ps pstore.Peerstore) Option {
	return func(*host.Host) error {
		if h.ps != nil {
			return fmt.Errorf("Peerstore already defined")
		}

		h.ps = ps
		return nil
	}
}
