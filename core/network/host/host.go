package host

import (
	"context"
	"fmt"

	"berty.tech/core/network/metric"
	discovery "github.com/libp2p/go-libp2p-discovery"
	host "github.com/libp2p/go-libp2p-host"
	routing "github.com/libp2p/go-libp2p-routing"

	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	msmux "github.com/multiformats/go-multistream"
)

var _ (host.Host) = (*BertyHost)(nil)

// BertyHost is an host.Host but with capability to choose a specific conn when
// calling NewStream
type BertyHost struct {
	host.Host
	Discovery discovery.Discovery
	Routing   routing.IpfsRouting
	Metric    metric.Metric
	Ping      *PingService
}

type BertyHostOptions struct {
	Discovery discovery.Discovery
	Routing   routing.IpfsRouting
	Metric    metric.Metric
	Ping      *PingService
}

func NewBertyHost(ctx context.Context, host host.Host, opts *BertyHostOptions) (*BertyHost, error) {
	h := &BertyHost{
		Host:      host,
		Discovery: opts.Discovery,
		Routing:   opts.Routing,
		Metric:    opts.Metric,
		Ping:      opts.Ping,
	}

	return h, nil
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID. See (host.Host).Connect for more information.
//
// BertyHost's Connect differs in that if the host has no addresses for a
// given peer, it will use its routing system to try to find some.
func (bh *BertyHost) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	return bh.Host.Connect(ctx, pi)
}

func (bh *BertyHost) ID() peer.ID {
	return bh.Host.ID()
}

func (bh *BertyHost) Peerstore() pstore.Peerstore {
	return bh.Host.Peerstore()
}

func (bh *BertyHost) Addrs() []ma.Multiaddr {
	return bh.Host.Addrs()
}

func (bh *BertyHost) Network() inet.Network {
	return bh.Host.Network()
}

func (bh *BertyHost) Mux() *msmux.MultistreamMuxer {
	return bh.Host.Mux()
}

func (bh *BertyHost) SetStreamHandler(pid protocol.ID, handler inet.StreamHandler) {
	bh.Host.SetStreamHandler(pid, handler)
}

func (bh *BertyHost) SetStreamHandlerMatch(pid protocol.ID, m func(string) bool, handler inet.StreamHandler) {
	bh.Host.SetStreamHandlerMatch(pid, m, handler)
}

func (bh *BertyHost) RemoveStreamHandler(pid protocol.ID) {
	bh.Host.RemoveStreamHandler(pid)
}

func (bh *BertyHost) bestLatency(cs ...inet.Conn) inet.Conn {
	if len(cs) == 0 {
		return nil
	}

	c1 := cs[0]
	if len(cs) == 1 {
		return c1
	}

	c2 := bh.bestLatency(cs[1:]...)
	if float64(bh.Metric.LatencyConnEWMA(c1)) > float64(bh.Metric.LatencyConnEWMA(c2)) {
		return c2
	}

	return c1
}

func (bh *BertyHost) bestConnToUse(ctx context.Context, p peer.ID) (inet.Conn, error) {
	conns := bh.Network().ConnsToPeer(p)

	if len(conns) == 0 {
		return bh.Network().DialPeer(ctx, p)
	}

	if c := bh.bestLatency(conns...); c != nil {
		return c, nil
	}

	return nil, fmt.Errorf("no conns found")
}

func (bh *BertyHost) newBestStream(ctx context.Context, p peer.ID) (inet.Stream, error) {
	c, err := bh.bestConnToUse(ctx, p)
	if err != nil {
		return nil, err
	}

	return c.NewStream()
}

func (bh *BertyHost) NewStream(ctx context.Context, p peer.ID, pids ...protocol.ID) (inet.Stream, error) {
	logger().Debug("NEW_STREAM")
	pref, err := bh.preferredProtocol(p, pids)
	if err != nil {
		return nil, err
	}

	if pref != "" {
		return bh.newStream(ctx, p, pref)
	}

	var protoStrs []string
	for _, pid := range pids {
		protoStrs = append(protoStrs, string(pid))
	}

	s, err := bh.newBestStream(ctx, p)
	if err != nil {
		return nil, err
	}

	selected, err := msmux.SelectOneOf(protoStrs, s)
	if err != nil {
		s.Reset()
		return nil, err
	}

	selpid := protocol.ID(selected)
	s.SetProtocol(selpid)
	bh.Peerstore().AddProtocols(p, selected)

	return s, nil
}

func (bh *BertyHost) newStream(ctx context.Context, p peer.ID, pid protocol.ID) (inet.Stream, error) {
	s, err := bh.newBestStream(ctx, p)
	if err != nil {
		return nil, err
	}

	s.SetProtocol(pid)

	lzcon := msmux.NewMSSelect(s, string(pid))
	return &StreamWrapper{
		Stream: s,
		rw:     lzcon,
	}, nil
}

func pidsToStrings(pids []protocol.ID) []string {
	out := make([]string, len(pids))
	for i, p := range pids {
		out[i] = string(p)
	}
	return out
}

func (h *BertyHost) preferredProtocol(p peer.ID, pids []protocol.ID) (protocol.ID, error) {
	pidstrs := pidsToStrings(pids)
	supported, err := h.Peerstore().SupportsProtocols(p, pidstrs...)
	if err != nil {
		return "", err
	}

	var out protocol.ID
	if len(supported) > 0 {
		out = protocol.ID(supported[0])
	}
	return out, nil
}

func (bh *BertyHost) Close() error {
	return bh.Host.Close()
}

func (bh *BertyHost) ConnManager() ifconnmgr.ConnManager {
	return bh.Host.ConnManager()
}
