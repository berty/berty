package p2p

import (
	"context"
	"fmt"
	"net"
	"sync"
	"time"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpc_ot "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"

	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	syncdatastore "github.com/ipfs/go-datastore/sync"
	ipfsaddr "github.com/ipfs/go-ipfs-addr"
	libp2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
	inet "github.com/libp2p/go-libp2p-net"
	"github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	mdns "github.com/libp2p/go-libp2p/p2p/discovery"
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
	"berty.tech/core/network/p2p/p2putil"
	"berty.tech/core/network/p2p/protocol/service/p2pgrpc"
	"berty.tech/core/pkg/jaeger"
	"github.com/libp2p/go-libp2p-protocol"
)

const ID = "api/p2p/methods"

var ProtocolID = protocol.ID(p2pgrpc.GetGrpcID(ID))

// driverConfig configure the driver
type driverConfig struct {
	libp2pOpt []libp2p.Option

	bootstrap     []string
	bootstrapSync bool

	// DHT Service
	dhtOpts           []dhtopt.Option
	dhtBoostrapConfig dht.BootstrapConfig

	// MDNS
	enableMDNS bool
}

// Driver is a network.Driver
var _ network.Driver = (*Driver)(nil)

// Driver ...
type Driver struct {
	host host.Host

	ccmanager *p2putil.Manager
	handler   func(context.Context, *p2p.Envelope) (*p2p.Void, error)

	subsStack []*cid.Cid
	muSubs    sync.Mutex

	// services
	dht *dht.IpfsDHT
}

// New create a new driver
func newDriver(ctx context.Context, cfg driverConfig) (*Driver, error) {
	host, err := libp2p.New(ctx, cfg.libp2pOpt...)
	if err != nil {
		return nil, err
	}

	driver := &Driver{
		host: host,
	}

	ds := syncdatastore.MutexWrap(datastore.NewMapDatastore())

	if len(cfg.dhtOpts) == 0 {
		cfg.dhtOpts = []dhtopt.Option{dhtopt.Datastore(ds)}
	}

	driver.dht = dht.NewDHT(context.Background(), host, ds)
	if err != nil {
		return nil, err
	}

	if cfg.dhtBoostrapConfig.Queries == 0 {
		cfg.dhtBoostrapConfig = dht.DefaultBootstrapConfig
	}

	_, err = driver.dht.BootstrapWithConfig(cfg.dhtBoostrapConfig)
	if err != nil {
		if closeErr := host.Close(); closeErr != nil {
			logger().Error("failed to close host", zap.Error(closeErr))
		}
		return nil, err
	}

	if cfg.enableMDNS {
		sa, err := mdns.NewMdnsService(ctx, host, time.Second, "berty")
		if err != nil {
			logger().Warn("Failed to enable MDNS", zap.Error(err))
		} else {
			sa.RegisterNotifee((*DriverDiscoveryNotifee)(driver))
		}
	}

	if len(cfg.bootstrap) > 0 {
		if err := driver.Bootstrap(ctx, cfg.bootstrapSync, cfg.bootstrap...); err != nil {
			return nil, err
		}
	}

	tracer, closer, err := jaeger.InitTracer("berty-p2p")
	if err != nil {
		return nil, err
	}

	tracerOpts := grpc_ot.WithTracer(tracer)
	p2pInterceptorsServer := []grpc.ServerOption{
		grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
			grpc_ctxtags.StreamServerInterceptor(),
			grpc_zap.StreamServerInterceptor(logger()),
			grpc_ot.StreamServerInterceptor(tracerOpts),
		)),
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
			grpc_ctxtags.UnaryServerInterceptor(),
			grpc_zap.UnaryServerInterceptor(logger()),
			grpc_ot.UnaryServerInterceptor(tracerOpts),
		)),
	}

	p2pInterceptorsClient := []grpc.DialOption{
		grpc.WithStreamInterceptor(grpc_middleware.ChainStreamClient(
			grpc_zap.StreamClientInterceptor(logger()),
			grpc_ot.StreamClientInterceptor(tracerOpts),
		)),
		grpc.WithUnaryInterceptor(grpc_middleware.ChainUnaryClient(
			grpc_zap.UnaryClientInterceptor(logger()),
			grpc_ot.UnaryClientInterceptor(tracerOpts),
		)),
	}

	gs := grpc.NewServer(p2pInterceptorsServer...)
	sgrpc := p2pgrpc.NewP2PGrpcService(host)

	dialOpts := append([]grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithDialer(sgrpc.NewDialer(ID)),
	}, p2pInterceptorsClient...)
	driver.ccmanager = p2putil.NewNetManager(dialOpts...)

	p2p.RegisterServiceServer(gs, (*DriverService)(driver))

	l := sgrpc.NewListener(ID)
	go func() {
		if err := gs.Serve(l); err != nil {
			logger().Error("Listen error", zap.Error(err))
		}
		closer.Close()
	}()

	logger().Debug("Host", zap.String("ID", driver.ID()), zap.Strings("Addrs", driver.Addrs()))

	return driver, nil
}

func NewDriver(ctx context.Context, opts ...Option) (*Driver, error) {
	var cfg driverConfig
	if err := cfg.Apply(opts...); err != nil {
		return nil, err
	}

	return newDriver(ctx, cfg)
}

func (d *Driver) ID() string {
	return d.host.ID().Pretty()
}

func (d *Driver) Addrs() []string {
	var addrs []string

	for _, addr := range d.host.Addrs() {
		addrs = append(addrs, addr.String())
	}

	return addrs
}

func (d *Driver) getPeerInfo(addr string) (*pstore.PeerInfo, error) {
	iaddr, err := ipfsaddr.ParseString(addr)
	if err != nil {
		return nil, err
	}

	return pstore.InfoFromP2pAddr(iaddr.Multiaddr())
}

func (d *Driver) Close() error {
	// FIXME: save cache to speedup next connections

	// close dht
	err := d.dht.Close()
	if err != nil {
		return err
	}

	// close host
	return d.host.Close()
}

func (d *Driver) Peerstore() pstore.Peerstore {
	return d.host.Peerstore()
}

func (d *Driver) Bootstrap(ctx context.Context, sync bool, addrs ...string) error {
	bf := d.BootstrapPeerAsync
	if sync {
		bf = d.BootstrapPeer
	}

	for _, addr := range addrs {
		if err := bf(context.Background(), addr); err != nil {
			return err
		}
	}

	return nil
}

func (d *Driver) BootstrapPeerAsync(ctx context.Context, addr string) error {
	go func() {
		if err := d.BootstrapPeer(ctx, addr); err != nil {
			logger().Warn("Bootstrap error", zap.String("addr", addr), zap.Error(err))
		}
	}()

	return nil
}

func (d *Driver) BootstrapPeer(ctx context.Context, bootstrapAddr string) error {
	if bootstrapAddr == "" {
		return nil
	}

	pinfo, err := d.getPeerInfo(bootstrapAddr)
	if err != nil {
		return err
	} else if err = d.host.Connect(ctx, *pinfo); err != nil {
		return err
	}

	// absorb addresses into peerstore
	d.host.Peerstore().AddAddrs(pinfo.ID, pinfo.Addrs, pstore.PermanentAddrTTL)
	return nil
}

// Connect ensures there is a connection between this host and the peer with
// given peer.ID.
func (d *Driver) Connect(ctx context.Context, pi pstore.PeerInfo) error {
	// first, check if we're already connected.
	if d.host.Network().Connectedness(pi.ID) == inet.Connected {
		return nil
	}

	// if we were given some addresses, keep + use them.
	if len(pi.Addrs) > 0 {
		d.host.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.TempAddrTTL)
	}

	// Check if we have some addresses in our recent memory.
	addrs := d.host.Peerstore().Addrs(pi.ID)
	if len(addrs) < 1 {
		// no addrs? find some with the routing system.
		var err error
		pi, err = d.dht.FindPeer(ctx, pi.ID)
		if err != nil {
			return err
		}

		return d.host.Connect(ctx, pi)
	}

	// if we're here, we got some addrs. let's use our wrapped host to connect.
	pi.Addrs = addrs
	return d.host.Connect(ctx, pi)
}

func (d *Driver) Dial(ctx context.Context, peerID string, pid protocol.ID) (net.Conn, error) {
	return p2putil.NewDialer(d.host, pid)(ctx, peerID)
}

func (d *Driver) createCid(id string) (*cid.Cid, error) {
	h, err := mh.Sum([]byte(id), mh.SHA2_256, -1)
	if err != nil {
		return nil, err
	}

	return cid.NewCidV0(h), nil
}

func (d *Driver) Find(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	return d.dht.FindPeer(ctx, pid)
}

func (d *Driver) Emit(ctx context.Context, e *p2p.Envelope) error {
	return d.EmitTo(ctx, e.GetChannelID(), e)
}

func (d *Driver) EmitTo(ctx context.Context, channel string, e *p2p.Envelope) error {
	ss, err := d.FindSubscribers(ctx, channel)
	if err != nil {
		return err
	}

	if len(ss) == 0 {
		return fmt.Errorf("no subscribers found")
	}

	for _, s := range ss {
		go func(pi pstore.PeerInfo) {
			peerID := pi.ID.Pretty()

			if pi.ID.Pretty() == d.ID() {
				return
			}

			if err := d.Connect(ctx, pi); err != nil {
				logger().Warn("failed to connect", zap.String("id", peerID), zap.Error(err))
			}

			c, err := d.ccmanager.GetConn(ctx, peerID)
			if err != nil {
				logger().Warn("failed to dial", zap.String("id", peerID), zap.Error(err))
			}

			sc := p2p.NewServiceClient(c)

			_, err = sc.HandleEnvelope(ctx, e)
			if err != nil {
				logger().Error("failed to send envelope", zap.String("envelope", fmt.Sprintf("%+v", e)), zap.String("error", err.Error()))
			}
		}(s)
	}
	return nil
}

// Announce yourself on the ring, for the moment just an alias of SubscribeTo
func (d *Driver) Announce(ctx context.Context, id string) error {
	return d.Join(ctx, id)
}

// FindSubscribers with the given ID
func (d *Driver) FindSubscribers(ctx context.Context, id string) ([]pstore.PeerInfo, error) {
	logger().Debug("looking for", zap.String("id", id))
	c, err := d.createCid(id)
	if err != nil {
		return nil, err
	}

	return d.dht.FindProviders(ctx, c)
}

func (d *Driver) stackSub(c *cid.Cid) {
	d.muSubs.Lock()
	d.subsStack = append(d.subsStack, c)
	d.muSubs.Unlock()
}

// Join to the given ID
func (d *Driver) Join(ctx context.Context, id string) error {
	c, err := d.createCid(id)
	if err != nil {
		return err
	}

	if err := d.dht.Provide(ctx, c, true); err != nil {
		// stack peer if no peer found
		d.stackSub(c)
		logger().Warn("provide err", zap.Error(err))
	}

	logger().Debug("announcing", zap.String("id", id))

	// Announce that you are subscribed to this conversation, but don't
	// broadcast it! in this way, if you die, your announcement will die with you!
	return nil
}

func (d *Driver) OnEnvelopeHandler(f func(context.Context, *p2p.Envelope) (*p2p.Void, error)) {
	d.handler = f
}

func (d *Driver) PingOtherNode(ctx context.Context, destination string) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	c, err := d.ccmanager.GetConn(ctx, destination)
	if err != nil {
		return errors.Wrap(err, "unable to ping")
	}

	if _, err = p2p.NewServiceClient(c).Ping(ctx, &p2p.Void{}); err != nil {
		return errors.Wrap(err, "unable to ping")
	}

	return nil
}

type DriverService Driver

func (ds *DriverService) HandleEnvelope(ctx context.Context, e *p2p.Envelope) (*p2p.Void, error) {
	if ds.handler != nil {
		return ds.handler(ctx, e)
	}

	return nil, fmt.Errorf("no handler set")
}

func (ds *DriverService) Ping(ctx context.Context, _ *p2p.Void) (*p2p.Void, error) {
	return &p2p.Void{}, nil
}

type DriverDiscoveryNotifee Driver

func (ddn *DriverDiscoveryNotifee) HandlePeerFound(pi pstore.PeerInfo) {
	if err := ddn.host.Connect(context.Background(), pi); err != nil {
		logger().Warn("mdns discovery failed", zap.String("remoteID", pi.ID.Pretty()), zap.Error(err))
	} else {
		// absorb addresses into peerstore
		ddn.host.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.PermanentAddrTTL)
	}
}

func (ddn *DriverDiscoveryNotifee) Driver() *Driver {
	return (*Driver)(ddn)
}

func (ddn *DriverDiscoveryNotifee) Listen(net inet.Network, a ma.Multiaddr)      {}
func (ddn *DriverDiscoveryNotifee) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (ddn *DriverDiscoveryNotifee) OpenedStream(net inet.Network, s inet.Stream) {}
func (ddn *DriverDiscoveryNotifee) ClosedStream(net inet.Network, s inet.Stream) {}

func (ddn *DriverDiscoveryNotifee) Connected(s inet.Network, c inet.Conn) {
	go func(id peer.ID) {
		if len(ddn.subsStack) > 0 {
			var newSubsStack []*cid.Cid
			for _, c := range ddn.subsStack {
				if err := ddn.dht.Provide(context.Background(), c, true); err != nil {
					// stack peer if no peer found
					logger().Warn("Provide err", zap.Error(err))
					newSubsStack = append(newSubsStack, c)
				}
			}

			ddn.muSubs.Lock()
			ddn.subsStack = newSubsStack
			ddn.muSubs.Unlock()
		}
	}(c.RemotePeer())
}

func (ddn *DriverDiscoveryNotifee) Disconnected(s inet.Network, c inet.Conn) {}
