package initutil

import (
	"io"

	p2p_tpt "github.com/libp2p/go-libp2p-core/transport"
	p2p_tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	"go.uber.org/multierr"

	"berty.tech/berty/v2/go/internal/packingutil"
)

type closableP2PTransport interface {
	p2p_tpt.Transport
	io.Closer
}

// torWrapper is a wrapper around the tor transport to correctly close the torrc SHM when the transport is closing.
type torWrapper struct {
	// Tor Transport
	closableP2PTransport

	torrc *packingutil.PseudoFile
}

func wrapTorTransport(torBuilder func(*p2p_tptu.Upgrader) p2p_tpt.Transport, torrc *packingutil.PseudoFile) func(*p2p_tptu.Upgrader) p2p_tpt.Transport {
	return func(upgrader *p2p_tptu.Upgrader) p2p_tpt.Transport {
		return &torWrapper{
			// This cast must not fail because we know tor is castable to `closableP2PTransport`.
			closableP2PTransport: torBuilder(upgrader).(closableP2PTransport),
			torrc:                torrc,
		}
	}
}

func (t *torWrapper) Close() error {
	return multierr.Combine(
		t.closableP2PTransport.Close(),
		t.torrc.Close(),
	)
}
