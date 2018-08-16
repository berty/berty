package p2p

import (
	"context"
	"fmt"
	"sync"
	"time"

	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	ipfsaddr "github.com/ipfs/go-ipfs-addr"
	libp2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	mdns "github.com/libp2p/go-libp2p/p2p/discovery"
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/network"
	"github.com/berty/berty/core/network/p2p/p2putil"
	"github.com/berty/berty/core/network/p2p/protocol/service/p2pgrpc"
)

const ID = "api/p2p/event"

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
	handler   func(context.Context, *p2p.Event) (*p2p.Void, error)

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

	if len(cfg.bootstrap) > 0 {
		if err := driver.Bootstrap(ctx, cfg.bootstrapSync, cfg.bootstrap...); err != nil {
			return nil, err
		}
	}

	if len(cfg.dhtOpts) == 0 {
		ds := datastore.NewMapDatastore()
		cfg.dhtOpts = []dhtopt.Option{dhtopt.Datastore(ds)}
	}

	ds := datastore.NewMapDatastore()
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
			zap.L().Error("failed to close host", zap.Error(closeErr))
		}
		return nil, err
	}

	fmt.Println("test 3")
	if cfg.enableMDNS {
		sa, err := mdns.NewMdnsService(ctx, host, time.Second, "berty")
		if err != nil {
			zap.L().Warn("Failed to enable MDNS", zap.Error(err))
		} else {
			sa.RegisterNotifee((*DriverDiscoveryNotifee)(driver))
		}
	}

	sgrpc := p2pgrpc.NewP2PGrpcService(host)

	dialer := sgrpc.NewDialer(ID)
	driver.ccmanager = p2putil.NewNetManager(
		// We dont need security here since it is already handle by
		// the host
		grpc.WithInsecure(),
		grpc.WithDialer(dialer),
	)

	gs := grpc.NewServer()
	p2p.RegisterServiceServer(gs, (*DriverService)(driver))

	l := sgrpc.NewListener(ID)

	go func() {
		if err := gs.Serve(l); err != nil {
			zap.L().Error("Listen error", zap.Error(err))
		}
	}()

	zap.L().Debug("Host", zap.String("ID", driver.ID()), zap.Strings("Addrs", driver.Addrs()))

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
	err := d.dht.Close()
	if err != nil {
		return err
	}

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
			zap.L().Warn("Bootstrap error", zap.String("addr", addr), zap.Error(err))
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

func (d *Driver) SendEvent(ctx context.Context, e *p2p.Event) error {
	receiverID := e.GetReceiverID()
	return d.SendEventToSubscribers(ctx, receiverID, e)
}

func (d *Driver) SendEventToConversation(ctx context.Context, e *p2p.Event) error {
	conversationID := e.GetConversationID()
	return d.SendEventToSubscribers(ctx, conversationID, e)
}

func (d *Driver) SendEventToSubscribers(ctx context.Context, id string, e *p2p.Event) error {
	ss, err := d.FindSubscribers(ctx, id)
	if err != nil {
		return err
	}

	if len(ss) == 0 {
		return fmt.Errorf("No subscribers found")
	}

	sendEvent := func(_s pstore.PeerInfo) {
		peerID := _s.ID.Pretty()

		if _s.ID.Pretty() == d.ID() {
			return
		}

		if err := d.Connect(ctx, _s); err != nil {
			zap.L().Warn("Failed to dial", zap.String("id", peerID), zap.Error(err))
		}

		c, err := d.ccmanager.GetConn(ctx, peerID)
		if err != nil {
			zap.L().Warn("Failed to dial", zap.String("id", peerID), zap.Error(err))
		}

		sc := p2p.NewServiceClient(c)

		_, err = sc.Handle(ctx, e)
		if err != nil {
			zap.L().Warn("Failed to send event", zap.String("event", fmt.Sprintf("%+v", e)), zap.String("error", err.Error()))
		}
	}

	for _, s := range ss {
		_s := s
		go sendEvent(_s)
	}
	return nil
}

// Announce yourself on the ring, for the moment just an alias of SubscribeTo
func (d *Driver) Announce(ctx context.Context, id string) error {
	return d.SubscribeTo(ctx, id)
}

// FindSubscribers with the given ID
func (d *Driver) FindSubscribers(ctx context.Context, id string) ([]pstore.PeerInfo, error) {
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

// SubscribeTo to the given ID
func (d *Driver) SubscribeTo(ctx context.Context, id string) error {
	c, err := d.createCid(id)
	if err != nil {
		return err
	}

	if err := d.dht.Provide(ctx, c, true); err != nil {
		// stack peer if no peer found
		d.stackSub(c)
		zap.L().Warn("Provide err", zap.Error(err))
	}

	// Announce that you are subscribed to this conversation, but don't
	// broadcast it! in this way, if you die, your announcement will die with you!
	return nil
}

func (d *Driver) SetReceiveEventHandler(f func(context.Context, *p2p.Event) (*p2p.Void, error)) {
	d.handler = f
}

type DriverService Driver

func (ds *DriverService) Handle(ctx context.Context, e *p2p.Event) (*p2p.Void, error) {
	if ds.handler != nil {
		return ds.handler(ctx, e)
	}

	return nil, fmt.Errorf("No handler set")
}

type DriverDiscoveryNotifee Driver

func (ddn *DriverDiscoveryNotifee) HandlePeerFound(pi pstore.PeerInfo) {
	if err := ddn.host.Connect(context.Background(), pi); err != nil {
		zap.L().Warn("mdns discovery failed", zap.String("remoteID", pi.ID.Pretty()), zap.Error(err))
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
					zap.L().Warn("Provide err", zap.Error(err))
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
