package host

import (
	"context"
	"io"

	"berty.tech/core/network/metric"
	discovery "github.com/libp2p/go-libp2p-discovery"
	host "github.com/libp2p/go-libp2p-host"
	routing "github.com/libp2p/go-libp2p-routing"
	"github.com/libp2p/go-libp2p/p2p/protocol/ping"

	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	ms "github.com/multiformats/go-multistream"
)

type BertyHost struct {
	host.Host
	Discovery discovery.Discovery
	Routing   routing.IpfsRouting
	Metric    metric.Metric
	Ping      *ping.PingService
}

type BertyHostOptions struct {
	Discovery discovery.Discovery
	Routing   routing.IpfsRouting
	Metric    metric.Metric
	Ping      *ping.PingService
}

var _ (host.Host) = (*BertyHost)(nil)

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

func (bh *BertyHost) SetStreamHandler(pid protocol.ID, handler inet.StreamHandler) {
	bh.Host.SetStreamHandler(pid, handler)
}

func (bh *BertyHost) SetStreamHandlerMatch(pid protocol.ID, m func(string) bool, handler inet.StreamHandler) {
	bh.Host.SetStreamHandlerMatch(pid, m, handler)
}

func (bh *BertyHost) RemoveStreamHandler(pid protocol.ID) {
	bh.Host.RemoveStreamHandler(pid)
}

func (bh *BertyHost) bestConnToUse(ctx context.Context, p peer.ID) (inet.Conn, error) {
	conns := bh.Network().ConnsToPeer(p)
	if len(conns) == 0 {
		return bh.Host.Network().DialPeer(ctx, p)
	}

	// @TODO: choose the best conn here

	// crate := make(map[inet.Conn]int)
	// for _, c := range conns {
	//      rate := rateConn(ctx, p, c)
	//      crate[c] = rate
	// }

	// dummy selection
	return conns[0], nil
}

func (bh *BertyHost) newBestStream(ctx context.Context, p peer.ID) (inet.Stream, error) {
	c, err := bh.bestConnToUse(ctx, p)
	if c == nil {
		return nil, err
	}

	s, err := c.NewStream()
	if err != nil {
		return nil, err
	}

	return s, nil
}

func (bh *BertyHost) NewStream(ctx context.Context, p peer.ID, pids ...protocol.ID) (inet.Stream, error) {
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

	selected, err := ms.SelectOneOf(protoStrs, s)
	if err != nil {
		s.Reset()
		return nil, err
	}

	selpid := protocol.ID(selected)
	s.SetProtocol(selpid)
	bh.Peerstore().AddProtocols(p, selected)

	return s, nil
}

func pidsToStrings(pids []protocol.ID) []string {
	out := make([]string, len(pids))
	for i, p := range pids {
		out[i] = string(p)
	}
	return out
}

func (bh *BertyHost) preferredProtocol(p peer.ID, pids []protocol.ID) (protocol.ID, error) {
	pidstrs := pidsToStrings(pids)
	supported, err := bh.Peerstore().SupportsProtocols(p, pidstrs...)
	if err != nil {
		return "", err
	}

	var out protocol.ID
	if len(supported) > 0 {
		out = protocol.ID(supported[0])
	}
	return out, nil
}

func (bh *BertyHost) newStream(ctx context.Context, p peer.ID, pid protocol.ID) (inet.Stream, error) {
	s, err := bh.newBestStream(ctx, p)
	if err != nil {
		return nil, err
	}

	s.SetProtocol(pid)

	lzcon := ms.NewMSSelect(s, string(pid))
	return &streamWrapper{
		Stream: s,
		rw:     lzcon,
	}, nil
}

func (bh *BertyHost) Close() error {
	if err := bh.Host.Close(); err != nil {
		return err
	}
	return nil
}
func (bh *BertyHost) ConnManager() ifconnmgr.ConnManager {
	return bh.Host.ConnManager()
}

func (bh *BertyHost) Mux() *ms.MultistreamMuxer {
	return bh.Host.Mux()
}

type streamWrapper struct {
	inet.Stream
	rw io.ReadWriter
}

func (s *streamWrapper) Read(b []byte) (int, error) {
	return s.rw.Read(b)
}

func (s *streamWrapper) Write(b []byte) (int, error) {
	return s.rw.Write(b)
}
