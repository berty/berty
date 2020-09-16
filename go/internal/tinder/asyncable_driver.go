package tinder

import (
	"context"

	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
)

// AsyncableDriver allows MultiDriver to reuse the same chan for multiple drivers.
type AsyncableDriver interface {
	// AsyncableDriver implements Driver to simplify the creation pipeline.
	// Creator returns AsyncableDriver so that fit both cases.
	Driver

	// FindPeersAsync works differently than FindPeers.
	// FindPeersAsync is not expected to close the chan.
	// Also it's expected to start a goroutine to run the expensive part of the search.
	// And it's only when the caller have received enough valid peers he shutdown the search canceling the context.
	FindPeersAsync(context.Context, chan<- peer.AddrInfo, string, ...discovery.Option) error
}
