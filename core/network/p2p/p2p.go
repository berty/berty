package p2p

import (
	"context"
	"fmt"

	ipfsaddr "github.com/ipfs/go-ipfs-addr"
	libp2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
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

	bootstrap []string

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
		for _, addr := range cfg.bootstrap {
			_addr := addr
			go func() {
				if err = driver.BootstrapPeer(context.Background(), _addr); err != nil {
					zap.L().Warn("Bootstrap error", zap.String("addr", _addr), zap.Error(err))
				}
			}()
		}
	}

	driver.dht, err = dht.New(context.Background(), host, cfg.dhtOpts...)
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

func NewDriver(ctx context.Context, opts ...Option) (network.Driver, error) {
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

func (d *Driver) SendEvent(ctx context.Context, e *p2p.Event) error {
	receiverID := e.GetReceiverID()
	peerID, err := peer.IDB58Decode(receiverID)
	if err != nil {
		return err
	}

	if err := d.Connect(ctx, pstore.PeerInfo{ID: peerID}); err != nil {
		return err
	}

	c, err := d.ccmanager.GetConn(ctx, peerID.Pretty())
	if err != nil {
		return err
	}

	sc := p2p.NewServiceClient(c)

	if _, err := sc.Handle(ctx, e); err != nil {
		return err
	}

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
