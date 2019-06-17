package network

import (
	"context"
	"fmt"
	"io"
	"net"
	"reflect"
	"sync"
	"time"

	"berty.tech/core/entity"
	"berty.tech/core/network/config"
	"berty.tech/core/network/helper"
	"berty.tech/core/network/metric"
	routing_validator "berty.tech/core/network/protocol/dht/validator"
	"berty.tech/core/pkg/tracing"
	ggio "github.com/gogo/protobuf/io"
	cid "github.com/ipfs/go-cid"
	ipfsaddr "github.com/ipfs/go-ipfs-addr"
	libp2p_discovery "github.com/libp2p/go-libp2p-discovery"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var _ Driver = (*Network)(nil)

var ProtocolID = protocol.ID("berty/p2p/envelope")

func (net *Network) logHostInfos() {
	var addrs []string

	for _, addr := range net.host.Addrs() {
		addrs = append(addrs, addr.String())
	}

	logger().Debug("Host", zap.String("ID", net.host.ID().Pretty()), zap.Strings("Addrs", addrs))
}

func (net *Network) getPeerInfo(ctx context.Context, addr string) (*pstore.PeerInfo, error) {
	tracer := tracing.EnterFunc(ctx, addr)
	defer tracer.Finish()
	// ctx = tracer.Context()

	iaddr, err := ipfsaddr.ParseString(addr)
	if err != nil {
		return nil, err
	}

	return pstore.InfoFromP2pAddr(iaddr.Multiaddr())
}

func (net *Network) Protocols(ctx context.Context, p *metric.Peer) ([]string, error) {
	tracer := tracing.EnterFunc(ctx, p)
	defer tracer.Finish()
	// ctx = tracer.Context()

	peerid, err := peer.IDB58Decode(p.ID)
	if err != nil {
		return nil, fmt.Errorf("get protocols error: `%s`", err)
	}

	return net.host.Peerstore().GetProtocols(peerid)
}

func (net *Network) Addrs() []ma.Multiaddr {
	return net.host.Addrs()
}

func (net *Network) ID(ctx context.Context) *metric.Peer {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()
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

func (net *Network) handleNewPovider(providerID string, pi pstore.PeerInfo) {
	logger().Debug("new providers", zap.String("providers ID", providerID), zap.String("peer ID", pi.ID.Pretty()))
}

func (net *Network) Peerstore(ctx context.Context) pstore.Peerstore {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return net.host.Peerstore()
}

func (net *Network) Bootstrap(ctx context.Context, bsync bool, addrs ...string) error {
	tracer := tracing.EnterFunc(ctx, bsync, addrs)
	defer tracer.Finish()
	ctx = tracer.Context()

	if net.config.DefaultBootstrap {
		addrs = append(addrs, config.DefaultBootstrap...)
	}

	wg := sync.WaitGroup{}
	wg.Add(len(addrs))
	for _, addr := range addrs {
		go func(addr string) {
			if err := net.BootstrapPeer(ctx, addr); err != nil {
				logger().Error("bootstrap", zap.Error(err))
			}

			wg.Done()
		}(addr)
	}

	if bsync {
		wg.Wait()
		if len(net.host.Peerstore().Peers()) == 0 {
			return fmt.Errorf("bootstrap failed")
		}
	}

	return nil
}

func (net *Network) BootstrapPeer(ctx context.Context, bootstrapAddr string) error {
	tracer := tracing.EnterFunc(ctx, bootstrapAddr)
	defer tracer.Finish()
	ctx = tracer.Context()

	if bootstrapAddr == "" {
		return nil
	}

	logger().Debug("Bootstraping peer", zap.String("addr", bootstrapAddr))
	pinfo, err := net.getPeerInfo(ctx, bootstrapAddr)
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

func (net *Network) Discover(ctx context.Context) {
	if net.host.Discovery != nil {
		libp2p_discovery.Advertise(ctx, net.host.Discovery, "berty")
		go func() {
			peers, err := net.host.Discovery.FindPeers(ctx, "berty")
			if err != nil {
				logger().Debug("network discover: cannot find peers: " + err.Error())
				return
			}
			for {
				select {
				case pi := <-peers:
					if err := net.Connect(ctx, pi); err != nil {
						logger().Error("network discover: failed to connect: " + err.Error())
					}
				case <-ctx.Done():
					logger().Debug("network discover shutdown")
					return
				}
			}
		}()
	}
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID.
func (net *Network) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	return net.host.Connect(ctx, pi)
}

func (net *Network) Dial(ctx context.Context, peerID string, pid protocol.ID) (net.Conn, error) {
	tracer := tracing.EnterFunc(ctx, peerID, pid)
	defer tracer.Finish()
	ctx = tracer.Context()

	return helper.NewDialer(net.host, pid)(ctx, peerID)
}

func (net *Network) createCid(id string) (cid.Cid, error) {
	h, err := mh.Sum([]byte(id), mh.SHA2_256, -1)
	if err != nil {
		return cid.Cid{}, err
	}

	return cid.NewCidV0(h), nil
}

func (net *Network) Find(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	return net.host.Routing.FindPeer(ctx, pid)
}

func (net *Network) Emit(ctx context.Context, e *entity.Envelope) error {
	// tracer := tracing.EnterFunc(ctx, e)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	return net.EmitTo(ctx, e.GetChannelID(), e)
}

func (net *Network) EmitTo(ctx context.Context, contactID string, e *entity.Envelope) (err error) {
	// tracer := tracing.EnterFunc(ctx, contactID, e)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	pinfo, ok := net.cache.GetPeerForKey(contactID)
	if !ok {
		pinfo, err = routing_validator.ContactIDToPeerInfo(ctx, net.host.Routing, contactID)
		if err != nil {
			err = errors.Wrap(err, fmt.Sprintf("EmitTo failed during contactID translation (%s)", contactID))
			return
		}

		net.cache.UpdateCache(contactID, pinfo)
		// @TODO: we need to split this, and let the node do the logic to try
		// back if the send fail with the given peer

	}

	if err = net.SendTo(ctx, pinfo, e); err != nil {
		logger().Warn("sendTo", zap.Error(err))
		return
	}

	return
}

func (net *Network) SendTo(ctx context.Context, pi pstore.PeerInfo, e *entity.Envelope) error {
	peerID := pi.ID.Pretty()
	if pi.ID == net.host.ID() {
		return fmt.Errorf("cannot dial to self")
	}

	s, err := net.host.NewStream(ctx, pi.ID, ProtocolID)
	if err != nil {
		return fmt.Errorf("new stream failed: `%s`", err.Error())
	}

	logger().Debug("sending envelope", zap.String("peerID", peerID))
	pbw := ggio.NewDelimitedWriter(s)
	if err := pbw.WriteMsg(e); err != nil {
		return fmt.Errorf("write stream: `%s`", err.Error())
	}

	go inet.FullClose(s)
	return nil
}

func (net *Network) handleEnvelope(s inet.Stream) {
	logger().Debug("receiving envelope")
	if net.handler == nil {
		logger().Error("handler is not set")
		return
	}

	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)
	for {
		e := &entity.Envelope{}
		switch err := pbr.ReadMsg(e); err {
		case io.EOF:
			s.Close()
			return
		case nil: // do noting, everything fine
		default:
			s.Reset()
			logger().Error("invalid envelope", zap.Error(err))
			return
		}

		logger().Debug("receiving envelope")
		// @TODO: get opentracing context
		net.handler(context.Background(), e)
	}

}

func (net *Network) SetContactID(contactID string) {
	net.contactID = contactID
}

func (net *Network) Join(ctx context.Context) error {
	go func() {
		prevPeerInfo := pstore.PeerInfo{}
		for {
			duration := 1 * time.Minute
			currPeerInfo := net.host.Peerstore().PeerInfo(net.host.ID())
			if !reflect.DeepEqual(prevPeerInfo, currPeerInfo) {
				err := routing_validator.PutTranslateRecord(ctx, net.host.Routing, net.contactID, currPeerInfo)
				if err != nil {
					logger().Warn(errors.Wrap(err, "join failed").Error())
					duration = 5 * time.Second
				} else {
					logger().Debug("translate record updated successfully")
					prevPeerInfo = currPeerInfo
				}
			}
			select {
			case <-time.After(duration):
				continue
			case <-ctx.Done():
				logger().Debug("driver shutdown: translation record updater ended", zap.Error(ctx.Err()))
				return
			}
		}
	}()

	return nil
}

func (net *Network) OnEnvelopeHandler(f func(context.Context, *entity.Envelope) (*entity.Void, error)) {
	net.handler = f
}

func (net *Network) PingOtherNode(ctx context.Context, destination string) (err error) {
	var peerid peer.ID

	if net.host.Metric == nil {
		return fmt.Errorf("cannot ping other node since metric is not enabled")
	}

	peerid, err = peer.IDB58Decode(destination)
	if err != nil {
		return err
	}

	_, err = net.host.Metric.Ping(ctx, peerid)
	return err
}

func (net *Network) Metric() metric.Metric {
	return net.host.Metric
}

func (net *Network) Config() *config.Config {
	return net.config
}
