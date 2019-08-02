package network

import (
	"context"
	"fmt"
	"io"
	"sync"
	"time"

	"berty.tech/network/metric"

	routing_validator "berty.tech/network/dht/validator"
	"berty.tech/network/protocol/berty"
	ggio "github.com/gogo/protobuf/io"
	ipfsaddr "github.com/ipfs/go-ipfs-addr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	manet "github.com/multiformats/go-multiaddr-net"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var _ Driver = (*Network)(nil)

var ProtocolID = protocol.ID("berty/p2p/message")

func (net *Network) logHostInfos() {
	var addrs []string

	net.muHost.RLock()

	for _, addr := range net.host.Addrs() {
		addrs = append(addrs, addr.String())
	}

	logger().Debug("Host", zap.String("ID", net.host.ID().Pretty()), zap.Strings("Addrs", addrs))

	net.muHost.RUnlock()
}

func (net *Network) ID() *metric.Peer {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	addrs := []string{}
	for _, addr := range net.host.Addrs() {
		addrs = append(addrs, addr.String())
	}

	return &metric.Peer{
		ID:         net.host.ID().Pretty(),
		Addrs:      addrs,
		Connection: metric.ConnectionType_CONNECTED,
	}
}

func (net *Network) Addrs() []string {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	host_addrs := net.host.Addrs()
	addrs := make([]string, len(host_addrs))
	for i, addr := range host_addrs {
		addrs[i] = addr.String()
	}

	return addrs
}

func (net *Network) Protocols(ctx context.Context, p *metric.Peer) ([]string, error) {
	peerid, err := peer.IDB58Decode(p.ID)
	if err != nil {
		return nil, fmt.Errorf("get protocols error: `%s`", err)
	}

	return net.host.Peerstore().GetProtocols(peerid)
}

func (net *Network) handleNewPovider(providerID string, pi pstore.PeerInfo) {
	logger().Debug("new providers", zap.String("providers ID", providerID), zap.String("peer ID", pi.ID.Pretty()))
}

// Bootstrap a set of peers
func (net *Network) Bootstrap(ctx context.Context, bsync bool) error {
	if len(net.bootstrapAddrs) == 0 {
		return nil
	}

	wg := sync.WaitGroup{}
	wg.Add(len(net.bootstrapAddrs))

	for _, addr := range net.bootstrapAddrs {
		go func(addr string) {
			if err := net.BootstrapPeer(ctx, addr); err != nil {
				logger().Error("bootstrap", zap.Error(err))
			}

			wg.Done()
		}(addr)
	}

	if bsync {
		wg.Wait()

		net.muHost.RLock()
		defer net.muHost.RUnlock()

		if len(net.host.Peerstore().Peers()) == 0 {
			return fmt.Errorf("bootstrap failed")
		}
	}

	return nil
}

// BootstrapPeer addr
func (net *Network) BootstrapPeer(ctx context.Context, bootstrapAddr string) error {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	if bootstrapAddr == "" {
		return nil
	}

	logger().Debug("Bootstraping peer", zap.String("addr", bootstrapAddr))
	iaddr, err := ipfsaddr.ParseString(bootstrapAddr)
	if err != nil {
		return err
	}

	pinfo, err := pstore.InfoFromP2pAddr(iaddr.Multiaddr())
	if err != nil {
		return err
	}

	// Even if we can't connect, bootstrap peers are trusted peers, add it to
	// the peerstore so we can connect later in case of failure
	net.host.Peerstore().AddAddrs(pinfo.ID, pinfo.Addrs, pstore.PermanentAddrTTL)
	net.host.ConnManager().TagPeer(pinfo.ID, "bootstrap", 2)

	if err := net.host.Connect(ctx, *pinfo); err != nil {
		return err
	}

	logger().Debug("Bootstrap success", zap.String("peer info", fmt.Sprintf("%+v", pinfo)))
	return nil
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID.
func (net *Network) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	return net.host.Connect(ctx, pi)
}

// func (net *Network) Dial(ctx context.Context, peerID string, pid protocol.ID) (net.Conn, error) {
// 	return net.host.NewStream(ctx, pi.ID, ProtocolID)
// }

func (net *Network) Find(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	return net.host.Routing().FindPeer(ctx, pid)
}

func (net *Network) EmitMessage(ctx context.Context, msg *berty.Message) error {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	var err error

	if msg.RemoteContactID == "" {
		return errors.Wrap(err, fmt.Sprintf("RemoteContactID is empty"))
	}

	logger().Debug("Emiting message", zap.String("remote contact ID", msg.RemoteContactID))
	pinfo, ok := net.cache.GetPeerForKey(msg.RemoteContactID)
	if !ok {
		pinfo, err = routing_validator.RemoteContactIDToPeerInfo(ctx, net.host.Routing(), msg.RemoteContactID)
		if err != nil {
			return errors.Wrap(err, fmt.Sprintf("EmitTo failed during remote contactID translation (%s)", msg.RemoteContactID))
		}

		if len(pinfo.Addrs) == 0 {
			pinfo, err = net.host.Routing().FindPeer(ctx, pinfo.ID)
			if err != nil {
				return err
			}
		}

		// ensure there is a connection whit the peer
		if err := net.host.Connect(ctx, pinfo); err != nil {
			return errors.Wrap(err, fmt.Sprintf("failed to connect with peer %s", pinfo.ID.Pretty()))
		}

		net.cache.UpdateCache(msg.RemoteContactID, pinfo)
	}

	if err = net.sendTo(ctx, pinfo.ID, msg); err != nil {
		return errors.Wrap(err, fmt.Sprintf("SendTo (%s) failed", msg.RemoteContactID))
	}

	return nil
}

func (net *Network) sendTo(ctx context.Context, pid peer.ID, msg *berty.Message) error {
	peerID := pid.Pretty()
	if pid == net.host.ID() {
		return fmt.Errorf("cannot dial to self")
	}

	s, err := net.host.NewStream(ctx, pid, ProtocolID)
	if err != nil {
		return fmt.Errorf("new stream failed: `%s`", err.Error())
	}

	cm := berty.NewConnMetadataFromConn(s.Conn())

	logger().Debug("sending message",
		zap.String("peerID", peerID),
		zap.String("conn", cm.ToString()),
	)

	pbw := ggio.NewDelimitedWriter(s)
	if err := pbw.WriteMsg(msg); err != nil {
		return fmt.Errorf("write stream: `%s`", err.Error())
	}

	go inet.FullClose(s)
	return nil
}

func (net *Network) handleMessage(s inet.Stream) {
	if net.handler == nil {
		logger().Error("handler is not set")
		return
	}

	cm := berty.NewConnMetadataFromConn(s.Conn())
	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)
	for {
		msg := &berty.Message{}
		switch err := pbr.ReadMsg(msg); err {
		case io.EOF:
			s.Close()
			return
		case nil: // do noting, everything fine
		default:
			s.Reset()
			logger().Error("invalid message", zap.Error(err))
			return
		}

		logger().Debug("receiving message",
			zap.String("contact", net.localContactID),
			zap.String("peerID", s.Conn().RemotePeer().Pretty()),
			zap.String("conn", cm.ToString()),
		)

		net.handler(msg, cm)
	}
}

// SetLocalContactID local contact id
func (net *Network) SetLocalContactID(lcontactID string) {
	net.joinTimer.Stop()
	net.localContactID = lcontactID
	net.lrm.UpdateLocalContactID(lcontactID)
}

// Join synchronously provide the local contact ID over the network
func (net *Network) Join() error {
	if net.localContactID == "" {
		return fmt.Errorf("no local contact id set")
	}

	// synchronously join
	net.join(net.localContactID)

	// join already in progress
	return nil
}

// join loop undefinitely until joinTimer.Stop() is called
func (net *Network) join(id string) {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	net.muTimer.Lock()
	defer net.muTimer.Unlock()

	// make sure timer is stop
	net.joinTimer.Stop()

	// @TODO: use a more reasonable delay, or do a smarter
	// move by triggering this on network update
	duration := time.Hour
	currPeerInfo := pstore.PeerInfo{
		ID: net.host.ID(),
	}

	maddrs, err := net.host.Network().InterfaceListenAddresses()
	if err != nil {
		logger().Error("join failed to get listerner, cannot provide over dht", zap.Error(err))
	}

	// Filter out private addrs
	for _, addr := range maddrs {
		if !manet.IsPrivateAddr(addr) {
			logger().Debug("addr to provide", zap.String("addr", addr.String()))
			currPeerInfo.Addrs = append(currPeerInfo.Addrs, addr)
		}
	}

	err = routing_validator.PutTranslateRecord(net.rootCtx, net.host.Routing(), net.localContactID, currPeerInfo)
	if err != nil {
		logger().Warn(errors.Wrap(err, "join failed").Error())
		duration = 5 * time.Second
	} else {
		logger().Debug("translate record updated successfully")
		// prevPeerInfo = currPeerInfo
	}

	select {
	case <-net.rootCtx.Done():
		return
	default:
	}

	// wait to provide again
	net.joinTimer = time.AfterFunc(duration, func() {
		net.join(id)
	})
}

func (net *Network) OnMessage(f func(*berty.Message, *berty.ConnMetadata)) {
	net.handler = f
}

func (net *Network) Metric() metric.Metric {
	net.muHost.RLock()
	defer net.muHost.RUnlock()

	return net.host.Metric
}

// 	if net.host.Metric == nil {
// 		return fmt.Errorf("cannot ping other node since metric is not enabled")
// 	}

// func (net *Network) PingOtherNode(ctx context.Context, destination string) (err error) {
// 	var peerid peer.ID

// 	if net.host.Metric == nil {
// 		return fmt.Errorf("cannot ping other node since metric is not enabled")
// 	}

// 	peerid, err = peer.IDB58Decode(destination)
// 	if err != nil {
// 		return err
// 	}

//      _, err = net.host.Metric.Ping(ctx, peerid)
//      return err
// }
