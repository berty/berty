package metric

import (
	"context"
	"time"

	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
)

type PingService interface {
	PingConn(context.Context, inet.Conn) (<-chan time.Duration, error)
	Ping(context.Context, peer.ID) (<-chan time.Duration, error)
}

type Metric interface {
	inet.Notifiee

	// Ping record latency between a peer/conn
	PingConn(context.Context, inet.Conn) (time.Duration, error)
	Ping(context.Context, peer.ID) (time.Duration, error)

	// LatencyEWMA returns an exponentially-weighted moving avg.
	// of all measurements of a peer's latency.
	LatencyEWMA(p peer.ID) time.Duration

	// LatencyConnEWMA returns an exponentially-weighted moving avg.
	// of all measurements of a conn latency.
	LatencyConnEWMA(inet.Conn) time.Duration

	// RecordConnLatency records a new latency measurement for a specif conn
	RecordConnLatency(inet.Conn, time.Duration)

	// RecordLatency records a new latency measurement
	RecordLatency(peer.ID, time.Duration)

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
}
