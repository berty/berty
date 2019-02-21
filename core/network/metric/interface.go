package metric

import (
	"context"
	"time"

	inet "github.com/libp2p/go-libp2p-net"
)

type Metric interface {
	inet.Notifiee
	// Same as MonitorBandwidthGlobal, but once
	//GetBandwidthGlobal(context.Context) (*BandwidthStats, error)

	// Same as MonitorBandwidthProtocol, but once
	//GetBandwidthProtocol(context.Context) (*BandwidthStats, error)

	// Same as MonitorBandwidthPeer, but once
	//GetBandwidthPeer(context.Context) (*BandwidthStats, error)

	// Return a list of peers
	Peers(context.Context) *Peers

	// Monitor connected/disconnected peers
	MonitorPeers(func(*Peer, error) error)

	// Monitor bandwidth globally with the given interval
	MonitorBandwidth(time.Duration, func(*BandwidthStats, error) error)

	// Monitor bandwidth of a specific protocol with the given protocol id
	// and interval
	MonitorBandwidthProtocol(string, time.Duration, func(*BandwidthStats, error) error)

	// Monitor bandwidth of a specific peer with the given peer id and interval
	MonitorBandwidthPeer(string, time.Duration, func(*BandwidthStats, error) error)

	GetListenAddrs(ctx context.Context) *ListAddrs

	GetListenInterfaceAddrs(ctx context.Context) (*ListAddrs, error)

	Libp2PPing(ctx context.Context, str string) (bool, error)
}
