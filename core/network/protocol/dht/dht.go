package dht

import (
	"context"
	"time"

	"berty.tech/core/network/protocol/dht/validator"

	cid "github.com/ipfs/go-cid"
	ds "github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	opts "github.com/libp2p/go-libp2p-kad-dht/opts"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	routing "github.com/libp2p/go-libp2p-routing"
	ropts "github.com/libp2p/go-libp2p-routing/options"
	"github.com/pkg/errors"
)

var defaultClientConfig = dht.BootstrapConfig{
	Queries: 3,
	Period:  1 * time.Minute,
	Timeout: 10 * time.Second,
}

var defaultServerConfig = dht.BootstrapConfig{
	Queries: 10,
	Period:  1 * time.Minute,
	Timeout: 40 * time.Second,
}

// DHT is a IpfsRouting
var _ routing.IpfsRouting = (*DHT)(nil)

// Custom version of IpfsDHT
type DHT struct {
	dht             *dht.IpfsDHT
	server          bool
	bootstrapConfig dht.BootstrapConfig
}

func New(ctx context.Context, host host.Host, server bool, logDatastore bool) (*DHT, error) {
	var config dht.BootstrapConfig
	var datastore ds.Batching

	if server {
		config = defaultServerConfig
	} else {
		config = defaultClientConfig
	}

	datastore = dssync.MutexWrap(ds.NewMapDatastore())
	if logDatastore {
		datastore = ds.NewLogDatastore(datastore, "DHT_datastore")
	}

	d, err := dht.New(
		ctx,
		host,
		opts.Client(!server),
		opts.NamespacedValidator("bertyTranslate", validator.TranslateValidator{}),
		// Other namespaces
		opts.Datastore(datastore))

	if err != nil {
		return nil, errors.Wrap(err, "dht init failed")
	}

	return &DHT{d, server, config}, nil
}

func (d *DHT) PutValue(ctx context.Context, key string, data []byte, _ ...ropts.Option) error {
	return PutValue(ctx, d.dht, key, data)
}

func (d *DHT) GetValue(ctx context.Context, key string, _ ...ropts.Option) ([]byte, error) {
	return GetValue(ctx, d.dht, key)
}

func (d *DHT) SearchValue(ctx context.Context, key string, _ ...ropts.Option) (<-chan []byte, error) {
	return SearchValue(ctx, d.dht, key)
}

func (d *DHT) FindPeer(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	return FindPeer(ctx, d.dht, pid)
}

func (d *DHT) Provide(ctx context.Context, id cid.Cid, brcst bool) error {
	return Provide(ctx, d.dht, id, brcst)
}

func (d *DHT) FindProvidersAsync(ctx context.Context, id cid.Cid, n int) <-chan pstore.PeerInfo {
	return FindProvidersAsync(ctx, d.dht, id, n)
}

func (d *DHT) Bootstrap(ctx context.Context) error {
	return d.dht.BootstrapWithConfig(ctx, d.bootstrapConfig)
}

func (d *DHT) IsReady(ctx context.Context) bool {
	return len(d.dht.RoutingTable().ListPeers()) != 0
}
