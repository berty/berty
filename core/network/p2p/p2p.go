package p2p

import (
	"context"
	"fmt"

	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	ipfsaddr "github.com/ipfs/go-ipfs-addr"

	libp2p "github.com/libp2p/go-libp2p"
	crypto "github.com/libp2p/go-libp2p-crypto"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/network"
	"github.com/berty/berty/core/network/p2p/p2putil"
	"github.com/berty/berty/core/network/p2p/protocol/service/p2pgrpc"
	"github.com/berty/berty/core/network/p2p/protocol/service/provider"
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
}

// Driver is a network.Driver
var _ network.Driver = (*Driver)(nil)

// Driver ...
type Driver struct {
	host host.Host

	ccmanager *p2putil.Manager
	handler   func(context.Context, *p2p.Event) (*p2p.Void, error)
	provider  *provider.Provider

	pub crypto.PubKey

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

	if len(cfg.bootstrap) > 0 {
		if err := driver.Bootstrap(ctx, cfg.bootstrapSync, cfg.bootstrap...); err != nil {
			return nil, err
		}
	}

	if driver.provider, err = provider.New(ctx, host); err != nil {
		return nil, err
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

	return driver, nil
}

func NewDriver(ctx context.Context, opts ...Option) (*Driver, error) {
	var cfg driverConfig
	if err := cfg.Apply(opts...); err != nil {
		return nil, err
	}

	return newDriver(ctx, cfg)
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

func (d *Driver) Addrs() []ma.Multiaddr {
	return d.host.Addrs()
}

func (d *Driver) ID() peer.ID {
	return d.host.ID()
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

	for _, s := range ss {
		_s := s
		peerID := _s.ID.Pretty()

		if err := d.Connect(ctx, _s); err != nil {
			zap.L().Warn("Failed to connect", zap.String("id", peerID), zap.Error(err))
		}

		c, err := d.ccmanager.GetConn(ctx, peerID)
		if err != nil {
			zap.L().Warn("Failed to dial", zap.String("id", peerID), zap.Error(err))
		}

		sc := p2p.NewServiceClient(c)

		_, err = sc.Handle(ctx, e)
		if err != nil {
			zap.L().Warn("Failed to send event", zap.String("event", fmt.Sprintf("%+v", e)))
		}
	}

	return nil
}

// Announce yourself on the ring, for the moment just an alias of SubscribeTo
func (d *Driver) Announce(id string) error {
	return d.provider.Subscribe(id)
}

// FindSubscribers with the given ID
func (d *Driver) FindSubscribers(ctx context.Context, id string) (pis []pstore.PeerInfo, err error) {
	pis, err = d.provider.GetPeersForKey(id)
	if err != nil {
		if pis, err = d.provider.AnnounceAndWait(ctx, id); err != nil {
			return nil, err
		}
	}

	return pis, nil
}

// SubscribeTo to the given ID
func (d *Driver) SubscribeTo(id string) error {
	// Announce that you are subscribed to this conversation, but don't
	// broadcast it! in this way, if you die, your announcement will die with you!
	return d.provider.Subscribe(id)
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
