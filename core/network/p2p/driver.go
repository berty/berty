package p2p

import (
	"context"
	"fmt"
	"net"
	"sync"
	"time"

	"berty.tech/core/pkg/errorcodes"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
	"berty.tech/core/network/p2p/p2putil"
	"berty.tech/core/network/p2p/protocol/service/p2pgrpc"
	"berty.tech/core/pkg/tracing"
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
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/libp2p/go-libp2p-protocol"
	mdns "github.com/libp2p/go-libp2p/p2p/discovery"
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	opentracing "github.com/opentracing/opentracing-go"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

const ID = "api/p2p/methods"

var ProtocolID = protocol.ID(p2pgrpc.GetGrpcID(ID))

// driverConfig configure the driver
type driverConfig struct {
	libp2pOpt []libp2p.Option

	jaeger []grpc_ot.Option

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

type Driver struct {
	host      host.Host
	ccmanager *p2putil.Manager
	handler   func(context.Context, *p2p.Envelope) (*p2p.Void, error)

	subsStack []cid.Cid
	muSubs    sync.Mutex

	// services
	dht *dht.IpfsDHT

	listener net.Listener
	gs       *grpc.Server

	rootContext context.Context
}

// Driver is a network.Driver
var _ network.Driver = (*Driver)(nil)

func NewDriver(ctx context.Context, opts ...Option) (*Driver, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx)
	defer span.Finish()

	var cfg driverConfig
	if err := cfg.Apply(opts...); err != nil {
		return nil, err
	}

	return newDriver(ctx, cfg)
}

// New create a new driver
func newDriver(ctx context.Context, cfg driverConfig) (*Driver, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, cfg)
	defer span.Finish()

	host, err := libp2p.New(ctx, cfg.libp2pOpt...)
	if err != nil {
		return nil, err
	}

	driver := &Driver{
		host:        host,
		rootContext: ctx,
	}

	ds := syncdatastore.MutexWrap(datastore.NewMapDatastore())

	if len(cfg.dhtOpts) == 0 {
		cfg.dhtOpts = []dhtopt.Option{dhtopt.Datastore(ds)}
	}

	driver.dht = dht.NewDHT(ctx, host, ds)
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
			sa.RegisterNotifee(DiscoveryNotify(ctx, driver))
		}
	}

	host.Network().Notify(Notify(ctx, driver))

	if len(cfg.bootstrap) > 0 {
		if err := driver.Bootstrap(ctx, cfg.bootstrapSync, cfg.bootstrap...); err != nil {
			return nil, err
		}
	}

	var (
		serverStreamOpts = []grpc.StreamServerInterceptor{
			grpc_ctxtags.StreamServerInterceptor(),
			grpc_zap.StreamServerInterceptor(logger()),
		}
		serverUnaryOpts = []grpc.UnaryServerInterceptor{
			grpc_ctxtags.UnaryServerInterceptor(),
			grpc_zap.UnaryServerInterceptor(logger()),
		}
		clientStreamOpts = []grpc.StreamClientInterceptor{
			grpc_zap.StreamClientInterceptor(logger()),
		}
		clientUnaryOpts = []grpc.UnaryClientInterceptor{
			grpc_zap.UnaryClientInterceptor(logger()),
		}
	)

	if cfg.jaeger != nil {
		serverStreamOpts = append(serverStreamOpts, grpc_ot.StreamServerInterceptor(cfg.jaeger...))
		serverUnaryOpts = append(serverUnaryOpts, grpc_ot.UnaryServerInterceptor(cfg.jaeger...))
		clientStreamOpts = append(clientStreamOpts, grpc_ot.StreamClientInterceptor(cfg.jaeger...))
		clientUnaryOpts = append(clientUnaryOpts, grpc_ot.UnaryClientInterceptor(cfg.jaeger...))
	}

	p2pInterceptorsServer := []grpc.ServerOption{
		grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(serverStreamOpts...)),
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(serverUnaryOpts...)),
	}

	p2pInterceptorsClient := []grpc.DialOption{
		grpc.WithStreamInterceptor(grpc_middleware.ChainStreamClient(clientStreamOpts...)),
		grpc.WithUnaryInterceptor(grpc_middleware.ChainUnaryClient(clientUnaryOpts...)),
	}

	driver.gs = grpc.NewServer(p2pInterceptorsServer...)
	sgrpc := p2pgrpc.NewP2PGrpcService(host)

	dialOpts := append([]grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithDialer(sgrpc.NewDialer(ctx, ID)),
	}, p2pInterceptorsClient...)
	driver.ccmanager = p2putil.NewNetManager(dialOpts...)

	p2p.RegisterServiceServer(driver.gs, ServiceServer(driver))

	driver.listener = sgrpc.NewListener(ctx, ID)

	driver.logHostInfos()
	return driver, nil
}

func (d *Driver) Start(ctx context.Context) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	if err := d.gs.Serve(d.listener); err != nil {
		logger().Error("Listen error", zap.Error(err))
		return err
	}
	return nil
}

func (d *Driver) logHostInfos() {
	var addrs []string

	for _, addr := range d.host.Addrs() {
		addrs = append(addrs, addr.String())
	}

	logger().Debug("Host", zap.String("ID", d.host.ID().Pretty()), zap.Strings("Addrs", addrs))
}

func (d *Driver) getPeerInfo(ctx context.Context, addr string) (*pstore.PeerInfo, error) {
	span, _ := tracing.EnterFunc(ctx, addr)
	defer span.Finish()

	iaddr, err := ipfsaddr.ParseString(addr)
	if err != nil {
		return nil, err
	}

	return pstore.InfoFromP2pAddr(iaddr.Multiaddr())
}

func (d *Driver) Protocols(ctx context.Context, p *network.Peer) ([]string, error) {
	span, _ := tracing.EnterFunc(ctx, p)
	defer span.Finish()

	peerid, err := peer.IDB58Decode(p.ID)
	if err != nil {
		return nil, fmt.Errorf("get protocols error: `%s`", err)
	}

	return d.host.Peerstore().GetProtocols(peerid)
}

func (d *Driver) Addrs() []ma.Multiaddr {
	return d.host.Addrs()
}

func (d *Driver) ID(ctx context.Context) *network.Peer {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	addrs := make([]string, len(d.host.Addrs()))
	for i, addr := range d.host.Addrs() {
		addrs[i] = addr.String()
	}

	return &network.Peer{
		ID:         d.host.ID().Pretty(),
		Addrs:      addrs,
		Connection: network.ConnectionType_CONNECTED,
	}
}

func (d *Driver) Close(ctx context.Context) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	// FIXME: save cache to speedup next connections
	var err error
	// close dht
	if d.dht != nil {
		err = d.dht.Close()
		if err != nil {
			logger().Error("p2p close error", zap.Error(err))
		}
	}

	// close host
	if d.host != nil {
		err = d.host.Close()
		if err != nil {
			logger().Error("p2p close error", zap.Error(err))
		}
	}

	if d.listener != nil {
		d.listener.Close()
	}

	return nil
}

func (d *Driver) Peerstore(ctx context.Context) pstore.Peerstore {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	return d.host.Peerstore()
}

func (d *Driver) Bootstrap(ctx context.Context, sync bool, addrs ...string) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, sync, addrs)
	defer span.Finish()

	bf := d.BootstrapPeerAsync
	if sync {
		bf = d.BootstrapPeer
	}

	for _, addr := range addrs {
		if err := bf(ctx, addr); err != nil {
			return err
		}
	}

	return nil
}

func (d *Driver) BootstrapPeerAsync(ctx context.Context, addr string) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, addr)
	defer span.Finish()

	go func() {
		if err := d.BootstrapPeer(ctx, addr); err != nil {
			logger().Warn("Bootstrap error", zap.String("addr", addr), zap.Error(err))
		}
	}()

	return nil
}

func (d *Driver) BootstrapPeer(ctx context.Context, bootstrapAddr string) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, bootstrapAddr)
	defer span.Finish()

	if bootstrapAddr == "" {
		return nil
	}

	pinfo, err := d.getPeerInfo(ctx, bootstrapAddr)
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
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, peerID, pid)
	defer span.Finish()

	return p2putil.NewDialer(d.host, pid)(ctx, peerID)
}

func (d *Driver) createCid(id string) (cid.Cid, error) {
	h, err := mh.Sum([]byte(id), mh.SHA2_256, -1)
	if err != nil {
		return cid.Cid{}, err
	}

	return cid.NewCidV0(h), nil
}

func (d *Driver) Find(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	return d.dht.FindPeer(ctx, pid)
}

func (d *Driver) Emit(ctx context.Context, e *p2p.Envelope) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, e)
	defer span.Finish()

	return d.EmitTo(ctx, e.GetChannelID(), e)
}

func (d *Driver) EmitTo(ctx context.Context, channel string, e *p2p.Envelope) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, channel, e)

	defer span.Finish()

	ss, err := d.FindSubscribers(ctx, channel)
	if err != nil {
		return err
	}

	if len(ss) == 0 {
		return fmt.Errorf("no subscribers found")
	}

	success := make([]chan bool, len(ss))
	for i, s := range ss {
		success[i] = make(chan bool, 1)
		go func(pi pstore.PeerInfo, index int, done chan bool) {
			var gospan opentracing.Span
			var goctx context.Context
			gospan, goctx = tracing.EnterFunc(ctx, index)
			defer gospan.Finish()

			peerID := pi.ID.Pretty()
			if pi.ID == d.host.ID() {
				done <- false
				return
			}

			if err := d.Connect(goctx, pi); err != nil {
				logger().Warn("failed to connect", zap.String("id", peerID), zap.Error(err))
				done <- false
				return
			}

			c, err := d.ccmanager.GetConn(goctx, peerID)
			if err != nil {
				logger().Warn("failed to dial", zap.String("id", peerID), zap.Error(err))
				done <- false
				return
			}

			sc := p2p.NewServiceClient(c)

			_, err = sc.HandleEnvelope(goctx, e)
			if err != nil {
				logger().Error("failed to send envelope", zap.String("envelope", fmt.Sprintf("%+v", e)), zap.String("error", err.Error()))
				done <- false
				return
			}

			done <- true
		}(s, i, success[i])
	}

	var ok bool
	for _, cc := range success {
		ok = ok || <-cc
	}

	if !ok {
		return fmt.Errorf("failed to emit envelope")
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

func (d *Driver) stackSub(c cid.Cid) {
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
		d.stackSub(c)
		logger().Warn("provide err", zap.Error(err))
	} else {
		logger().Debug("discover: announcing", zap.String("id", id))
	}

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
		return errorcodes.ErrNetPing.Wrap(err)
	}

	if _, err = p2p.NewServiceClient(c).Ping(ctx, &p2p.Void{}); err != nil {
		return errorcodes.ErrNetPing.Wrap(err)
	}

	return nil
}
