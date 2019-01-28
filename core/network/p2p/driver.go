package p2p

import (
	"context"
	"fmt"
	"io"
	"net"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p/p2p/protocol/ping"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
	"berty.tech/core/network/p2p/p2putil"
	"berty.tech/core/network/p2p/protocol/provider"
	"berty.tech/core/pkg/tracing"

	provider_pubsub "berty.tech/core/network/p2p/protocol/provider/pubsub"

	ggio "github.com/gogo/protobuf/io"
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
	protocol "github.com/libp2p/go-libp2p-protocol"
	mdns "github.com/libp2p/go-libp2p/p2p/discovery"
	ma "github.com/multiformats/go-multiaddr"
	mh "github.com/multiformats/go-multihash"
	"go.uber.org/zap"
)

const ID = "api/p2p/methods"

var ProtocolID = protocol.ID("berty/p2p/envelope")

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
	host    host.Host
	handler func(context.Context, *p2p.Envelope) (*p2p.Void, error)

	providers *provider.Manager

	// services
	dht *dht.IpfsDHT

	rootContext context.Context
	PingSvc     *ping.PingService
}

// Driver is a network.Driver
var _ network.Driver = (*Driver)(nil)

func NewDriver(ctx context.Context, opts ...Option) (*Driver, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	var cfg driverConfig
	if err := cfg.Apply(opts...); err != nil {
		return nil, err
	}

	return newDriver(ctx, cfg)
}

// New create a new driver
func newDriver(ctx context.Context, cfg driverConfig) (*Driver, error) {
	tracer := tracing.EnterFunc(ctx, cfg)
	defer tracer.Finish()
	ctx = tracer.Context()

	host, err := libp2p.New(ctx, cfg.libp2pOpt...)
	if err != nil {
		return nil, err
	}

	driver := &Driver{
		host:        host,
		rootContext: ctx,
		providers:   provider.NewManager(),
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

	driver.PingSvc = ping.NewPingService(host)

	host.SetStreamHandler(ProtocolID, driver.handleEnvelope)

	// driver.providers.Register(provider_dht.New(driver.host, driver.dht))
	pubsubProvider, err := provider_pubsub.New(ctx, host)
	if err != nil {
		logger().Warn("pubsub provider", zap.Error(err))
	} else {
		driver.providers.Register(pubsubProvider)
	}

	driver.logHostInfos()
	if len(cfg.bootstrap) > 0 {
		if err := driver.Bootstrap(ctx, cfg.bootstrapSync, cfg.bootstrap...); err != nil {
			return nil, err
		}
	}
	return driver, nil
}

func (d *Driver) Start(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

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
	tracer := tracing.EnterFunc(ctx, addr)
	defer tracer.Finish()
	// ctx = tracer.Context()

	iaddr, err := ipfsaddr.ParseString(addr)
	if err != nil {
		return nil, err
	}

	return pstore.InfoFromP2pAddr(iaddr.Multiaddr())
}

func (d *Driver) Protocols(ctx context.Context, p *network.Peer) ([]string, error) {
	tracer := tracing.EnterFunc(ctx, p)
	defer tracer.Finish()
	// ctx = tracer.Context()

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
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

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

func (d *Driver) handleNewPovider(providerID string, pi pstore.PeerInfo) {
	logger().Debug("new providers", zap.String("providers ID", providerID), zap.String("peer ID", pi.ID.Pretty()))
}

func (d *Driver) Close(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

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

	return nil
}

func (d *Driver) Peerstore(ctx context.Context) pstore.Peerstore {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return d.host.Peerstore()
}

func (d *Driver) Bootstrap(ctx context.Context, sync bool, addrs ...string) error {
	tracer := tracing.EnterFunc(ctx, sync, addrs)
	defer tracer.Finish()
	ctx = tracer.Context()

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
	tracer := tracing.EnterFunc(ctx, addr)
	defer tracer.Finish()
	ctx = tracer.Context()

	go func() {
		if err := d.BootstrapPeer(ctx, addr); err != nil {
			logger().Warn("Bootstrap error", zap.String("addr", addr), zap.Error(err))
		}
	}()

	return nil
}

func (d *Driver) BootstrapPeer(ctx context.Context, bootstrapAddr string) error {
	tracer := tracing.EnterFunc(ctx, bootstrapAddr)
	defer tracer.Finish()
	ctx = tracer.Context()

	if bootstrapAddr == "" {
		return nil
	}

	logger().Debug("Bootstraping peer", zap.String("addr", bootstrapAddr))
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
	tracer := tracing.EnterFunc(ctx, peerID, pid)
	defer tracer.Finish()
	ctx = tracer.Context()

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
	tracer := tracing.EnterFunc(ctx, e)
	defer tracer.Finish()
	ctx = tracer.Context()

	return d.EmitTo(ctx, e.GetChannelID(), e)
}

func (d *Driver) EmitTo(ctx context.Context, channel string, e *p2p.Envelope) error {
	tracer := tracing.EnterFunc(ctx, channel, e)
	defer tracer.Finish()
	ctx = tracer.Context()

	logger().Debug("looking for peers", zap.String("channel", channel))
	ss, err := d.FindProvidersAndWait(ctx, channel, true)
	if err != nil {
		return err
	}

	// @TODO: we need to split this, and let the node do the logic to try
	// back if the send fail with the given peer

	logger().Debug("found peers", zap.String("channel", channel), zap.Int("number", len(ss)))

	mu := sync.Mutex{}
	wg := sync.WaitGroup{}
	wg.Add(len(ss))

	ok := false
	for i, s := range ss {
		go func(pi pstore.PeerInfo, index int) {
			gotracer := tracing.EnterFunc(ctx, index)
			goctx := tracer.Context()

			defer gotracer.Finish()
			defer wg.Done()

			if err := d.SendTo(goctx, pi, e); err != nil {
				logger().Warn("sendTo", zap.Error(err))
				return
			}

			mu.Lock()
			ok = true
			mu.Unlock()
			return
		}(s, i)
	}

	// wait until all goroutines are done
	wg.Wait()
	if !ok {
		return fmt.Errorf("unable to send evenlope to at last one peer")
	}

	return nil
}

func (d *Driver) SendTo(ctx context.Context, pi pstore.PeerInfo, e *p2p.Envelope) error {
	peerID := pi.ID.Pretty()
	if pi.ID == d.host.ID() {
		return fmt.Errorf("cannot dial to self")
	}

	logger().Debug("connecting", zap.String("peerID", peerID))
	if err := d.Connect(ctx, pi); err != nil {
		return fmt.Errorf("failed to connect: `%s`", err.Error())
	}

	s, err := d.host.NewStream(ctx, pi.ID, ProtocolID)
	if err != nil {
		return fmt.Errorf("new stream failed: `%s`", err.Error())
	}

	logger().Debug("sending envelope", zap.String("peerID", peerID))
	pbw := ggio.NewDelimitedWriter(s)
	if err := pbw.WriteMsg(e); err != nil {
		return fmt.Errorf("write stream: `%s`", err.Error())
	}

	return nil
}

func (d *Driver) handleEnvelope(s inet.Stream) {
	logger().Debug("receiving envelope")

	if d.handler == nil {
		logger().Error("handler is not set")
		return
	}

	e := &p2p.Envelope{}
	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)
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

	// @TODO: get opentracing context
	d.handler(context.Background(), e)
}

func (d *Driver) FindProvidersAndWait(ctx context.Context, id string, cache bool) ([]pstore.PeerInfo, error) {
	c, err := d.createCid(id)
	if err != nil {
		return nil, err
	}

	if err := d.providers.FindProviders(ctx, c, cache); err != nil {
		return nil, err
	}

	return d.providers.WaitForProviders(ctx, c)
}

func (d *Driver) Join(ctx context.Context, id string) error {
	c, err := d.createCid(id)
	if err != nil {
		return err
	}

	return d.providers.Provide(ctx, c)
}

func (d *Driver) OnEnvelopeHandler(f func(context.Context, *p2p.Envelope) (*p2p.Void, error)) {
	d.handler = f
}

func (d *Driver) PingOtherNode(ctx context.Context, destination string) (err error) {
	peerid, err := peer.IDB58Decode(destination)
	if err != nil {
		return err
	}

	ch, err := d.PingSvc.Ping(ctx, peerid)
	if err != nil {
		return err
	}

	<-ch
	return nil
}
