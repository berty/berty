package host

import (
	"context"
	"fmt"
	"time"

	"berty.tech/network/dht"
	"berty.tech/network/helper"
	"berty.tech/network/mdns"
	"berty.tech/network/metric"
	"berty.tech/network/state"
	"go.uber.org/zap"

	libp2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-host"
	routing "github.com/libp2p/go-libp2p-routing"
	filter "github.com/libp2p/go-maddr-filter"

	protocol "github.com/libp2p/go-libp2p-core/protocol"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	swarm "github.com/libp2p/go-libp2p-swarm"

	// protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	msmux "github.com/multiformats/go-multistream"
)

const ServiceTag = "_berty_service"

var _ (host.Host) = (*BertyHost)(nil)

var libp2p_opts libp2p.Option

// BertyHost is an host.Host but with capabilsity to choose a specific conn when
// calling NewStream
type BertyHost struct {
	host           host.Host
	mobile         bool
	mdns           mdns.Service
	routing        dht.Routing
	Metric         metric.Metric
	ContextFilters *ContextFilters
	bestaddr       BestAddr
}

func New(ctx context.Context, opts ...Option) (*BertyHost, error) {
	cfg := NewConfig()
	if err := cfg.Apply(ctx, opts...); err != nil {
		return nil, err
	}

	basichost, err := libp2p.NewWithoutDefaults(ctx, cfg.libp2p_opts...)
	if err != nil {
		return nil, err
	}

	filters := filter.NewFilters()
	if s, ok := basichost.Network().(*swarm.Swarm); ok {
		if s.Filters != nil {
			s.Filters = filters
		} else {
			filters = s.Filters
		}
	}

	// metrics
	bertyhost := &BertyHost{
		host:           basichost,
		mobile:         cfg.mobile,
		bestaddr:       NewBestAddrHandler(cfg.mobile),
		ContextFilters: NewContextFilters(filters),
		mdns:           mdns.NewNoopService(),
	}

	// Routing
	d, err := dht.New(ctx, bertyhost, !cfg.mobile, false)
	if err != nil {
		return nil, err
	}

	// Configure routing
	if bertyhost.routing, err = NewBertyRouting(ctx, bertyhost, d); err != nil {
		_ = bertyhost.Close()
		return nil, err
	}

	// metrics
	if cfg.reporter != nil {
		bertyhost.Metric = metric.NewBertyMetric(ctx, bertyhost, cfg.reporter)
		bertyhost.Network().Notify(bertyhost.Metric)
	}

	// mdns
	if cfg.mdns {
		bertyhost.mdns = mdns.NewService(bertyhost, time.Second*10, ServiceTag)
		bertyhost.mdns.RegisterNotifee(bertyhost)
	}

	bertyhost.RegisterNetworkUpdater(state.Global())
	return bertyhost, nil
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID. See (host.Host).Connect for more information.
//
// BertyHost's Connect differs in that if the host has no addresses for a
// given peer, it will use its routing system to try to find some.
func (bh *BertyHost) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	if bh.Network().Connectedness(pi.ID) == inet.Connected {
		return nil
	}

	// if we were given some addresses, keep + use them.
	if len(pi.Addrs) > 0 {
		bh.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.TempAddrTTL)
	}

	addrs := bh.Peerstore().Addrs(pi.ID)
	if len(addrs) < 1 {
		// no addrs? find some with the routing system.
		var err error
		addrs, err = bh.findPeerAddrs(ctx, pi.ID)
		if err != nil {
			logger().Error(fmt.Sprintf("failed to find peer addrs: peer: %+v, error: %+v", pi, err.Error()))
			return err
		}
	}

	// // Issue 448: if our address set includes routed specific relay addrs,
	// // we need to make sure the relay's addr itself is in the peerstore or else
	// // we wont be able to dial it.
	// for _, addr := range addrs {
	// 	_, err := addr.ValueForProtocol(circuit.P_CIRCUIT)
	// 	if err != nil {
	// 		// not a relay address
	// 		continue
	// 	}

	// 	if addr.Protocols()[0].Code != ma.P_P2P {
	// 		// not a routed relay specific address
	// 		continue
	// 	}

	// 	relay, _ := addr.ValueForProtocol(ma.P_P2P)

	// 	relayID, err := peer.IDFromString(relay)
	// 	if err != nil {
	// 		logger().Debug(fmt.Sprintf("failed to parse relay ID in address %s: %s", relay, err))
	// 		continue
	// 	}

	// 	if len(bh.Peerstore().Addrs(relayID)) > 0 {
	// 		// we already have addrs for this relay
	// 		continue
	// 	}

	// 	relayAddrs, err := bh.findPeerAddrs(ctx, relayID)
	// 	if err != nil {
	// 		logger().Debug(fmt.Sprintf("failed to find relay %s: %s", relay, err))
	// 		continue
	// 	}

	// 	bh.Peerstore().AddAddrs(relayID, relayAddrs, pstore.TempAddrTTL)
	// }

	// if we're here, we got some addrs. let's use our wrapped host to
	// connect.

	logger().Debug("BertyHost::Connect: try to connect with addrs :" + fmt.Sprintf("%+v", pi.Addrs))
	return bh.host.Connect(ctx, pi)
}

func (bh *BertyHost) findPeerAddrs(ctx context.Context, id peer.ID) ([]ma.Multiaddr, error) {
	pi, err := bh.routing.FindPeer(ctx, id)
	if err != nil {
		return nil, err // couldnt find any :(
	}
	if pi.ID != id {
		err = fmt.Errorf("routing failure: provided addrs for different peer")
		return nil, err
	}

	return pi.Addrs, nil
}

func (bh *BertyHost) Routing() routing.IpfsRouting {
	return bh.routing
}

func (bh *BertyHost) ID() peer.ID {
	return bh.host.ID()
}

func (bh *BertyHost) Peerstore() pstore.Peerstore {
	return bh.host.Peerstore()
}

func (bh *BertyHost) Addrs() []ma.Multiaddr {
	return bh.host.Addrs()
}

func (bh *BertyHost) Network() inet.Network {
	return bh.host.Network()
}

func (bh *BertyHost) Mux() protocol.Switch {
	return bh.host.Mux()
}

func (bh *BertyHost) SetStreamHandler(pid protocol.ID, handler inet.StreamHandler) {
	bh.host.SetStreamHandler(pid, handler)
}

func (bh *BertyHost) SetStreamHandlerMatch(pid protocol.ID, m func(string) bool, handler inet.StreamHandler) {
	bh.host.SetStreamHandlerMatch(pid, m, handler)
}

func (bh *BertyHost) RemoveStreamHandler(pid protocol.ID) {
	bh.host.RemoveStreamHandler(pid)
}

// @TODO: use me or remove me
func (bh *BertyHost) bestLatency(cs ...inet.Conn) (c inet.Conn) {
	if bh.Metric == nil {
		if len(cs) > 0 {
			c = cs[0]
		}

		return
	}

	for _, nc := range cs {
		if c == nil ||
			float64(bh.Metric.LatencyConnEWMA(c)) > float64(bh.Metric.LatencyConnEWMA(nc)) {
			c = nc
		}
	}

	return
}

func (bh *BertyHost) bestConnToUse(cs ...inet.Conn) (c inet.Conn) {
	for _, nc := range cs {
		if c == nil || bh.bestaddr(nc.RemoteMultiaddr(), c.RemoteMultiaddr()) {
			c = nc
		}
	}

	return
}

func (bh *BertyHost) BestConnToUse(ctx context.Context, p peer.ID) (inet.Conn, error) {
	conns := bh.Network().ConnsToPeer(p)

	if len(conns) == 0 {
		return bh.Network().DialPeer(ctx, p)
	}

	if c := bh.bestConnToUse(conns...); c != nil {
		return c, nil
	}

	return nil, fmt.Errorf("no conns found")
}

func (bh *BertyHost) newBestStream(ctx context.Context, p peer.ID) (inet.Stream, error) {
	c, err := bh.BestConnToUse(ctx, p)
	if err != nil {
		return nil, err
	}

	return c.NewStream()
}

func (bh *BertyHost) NewStream(ctx context.Context, p peer.ID, pids ...protocol.ID) (inet.Stream, error) {
	// Ensure we have a connection, with peer addresses resolved by the routing system (#207)
	// It is not sufficient to let the underlying host connect, it will most likely not have
	// any addresses for the peer without any prior connections.
	// err := bh.Connect(ctx, pstore.PeerInfo{ID: p})
	// if err != nil {
	// 	return nil, err
	// }

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
	return &helper.StreamWrapper{
		Stream:     s,
		ReadWriter: lzcon,
	}, nil
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

func (bh *BertyHost) Close() error {
	if err := bh.mdns.Close(); err != nil {
		logger().Warn("failed to close mdns service", zap.Error(err))
	}

	if err := bh.routing.Close(); err != nil {
		logger().Warn("failed to close routing", zap.Error(err))
	}

	return bh.host.Close()
}

func (bh *BertyHost) ConnManager() ifconnmgr.ConnManager {
	return bh.host.ConnManager()
}

func (bh *BertyHost) RegisterNetworkUpdater(nu *state.NetworkUpdater) {
	s := nu.GetState()

	// Handle current state
	bh.HandleConnectivityChange(s)
	bh.HandleInternetChange(s.Internet)
	bh.HandleVPNChange(s.VPN)
	bh.HandleMDNSChange(s.MDNS)
	bh.HandleMeteredChange(s.Metered)
	bh.HandleRoamingChange(s.Roaming)
	bh.HandleTrustedChange(s.Trusted)
	bh.HandleNetTypeChange(s.Network)
	bh.HandleCellTypeChange(s.Cellular)
	bh.HandleBluetoothChange(s.Bluetooth)

	// Register notifee
	nu.RegisterNotifee(bh)
}
