package tinder

import (
	"context"

	libp2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
)

// Driver is a libp2p_discovery.Discovery
var _ libp2p_discovery.Discovery = (Driver)(nil)

type Driver interface {
	libp2p_discovery.Discovery

	Unregister(ctx context.Context, ns string) error
}
