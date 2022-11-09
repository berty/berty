package tinder

import (
	"context"
	"fmt"
	"time"

	"github.com/libp2p/go-libp2p/core/discovery"
	"github.com/libp2p/go-libp2p/core/peer"
)

var ErrNotSupported = fmt.Errorf("not supported")

var _ discovery.Discovery = (IDriver)(nil)

type IDriver interface {
	Name() string
	Subscribe(ctx context.Context, topic string, opts ...discovery.Option) (<-chan peer.AddrInfo, error)
	Unregister(ctx context.Context, topic string, opts ...discovery.Option) error

	// discovery
	Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error)
	FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan peer.AddrInfo, error)
}
