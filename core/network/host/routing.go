package host

import (
	"context"
	"sync"
	"time"

	"berty.tech/core/pkg/tracing"
	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	syncdatastore "github.com/ipfs/go-datastore/sync"
	log "github.com/ipfs/go-log"
	host "github.com/libp2p/go-libp2p-host"
	kaddht "github.com/libp2p/go-libp2p-kad-dht"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	routing "github.com/libp2p/go-libp2p-routing"
	ropts "github.com/libp2p/go-libp2p-routing/options"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

var _ routing.IpfsRouting = (*BertyRouting)(nil)

type BertyRouting struct {
	dht     *kaddht.IpfsDHT
	muReady sync.RWMutex
	cready  chan struct{}
	ready   bool
	tstart  time.Time
}

func init() {
	log.SetDebugLogging()
}

func NewBertyRouting(ctx context.Context, h host.Host, dhtSvc bool) (*BertyRouting, error) {
	tracer := tracing.EnterFunc(ctx, h, dhtSvc)
	defer tracer.Finish()
	// TODO: use go-libp2p-routing-helpers
	ds := syncdatastore.MutexWrap(datastore.NewMapDatastore())
	var dht *kaddht.IpfsDHT

	if dhtSvc {
		dht = kaddht.NewDHT(ctx, h, ds)
	} else {
		dht = kaddht.NewDHTClient(ctx, h, ds)
	}

	br := &BertyRouting{
		dht:    dht,
		cready: make(chan struct{}, 1),
		tstart: time.Now(),
	}

	// Bootstrap DHT
	// Boostrap only return an error if a bad config is provided
	// since Bootstrap use default config, it should never happened
	if err := br.dht.Bootstrap(ctx); err != nil {
		logger().Warn("dht bootstrap error", zap.Error(err))
	}

	h.Network().Notify(br)
	return br, nil
}

func (br *BertyRouting) Bootstrap(ctx context.Context) error {
	return br.dht.Bootstrap(ctx)
}

// PutValue adds value corresponding to given Key.
func (br *BertyRouting) PutValue(ctx context.Context, k string, data []byte, opts ...ropts.Option) error {
	if err := br.isReady(ctx); err != nil {
		return err
	}

	return br.dht.PutValue(ctx, k, data, opts...)
}

// GetValue searches for the value corresponding to given Key.
func (br *BertyRouting) GetValue(ctx context.Context, ns string, opts ...ropts.Option) ([]byte, error) {
	if err := br.isReady(ctx); err != nil {
		return nil, err
	}

	return br.dht.GetValue(ctx, ns, opts...)
}

// SearchValue searches for better and better values from this value
// store corresponding to the given Key. By default implementations must
// stop the search after a good value is found. A 'good' value is a value
// that would be returned from GetValue.
//
// Useful when you want a result *now* but still want to hear about
// better/newer results.
//
// Implementations of this methods won't return ErrNotFound. When a value
// couldn't be found, the channel will get closed without passing any results
func (br *BertyRouting) SearchValue(ctx context.Context, ns string, opts ...ropts.Option) (<-chan []byte, error) {
	if err := br.isReady(ctx); err != nil {
		logger().Error("routing isn't ready", zap.Error(err))
	}

	return br.dht.SearchValue(ctx, ns, opts...)
}

func (br *BertyRouting) FindPeer(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	if err := br.isReady(ctx); err != nil {
		return pstore.PeerInfo{}, nil
	}

	return br.dht.FindPeer(ctx, pid)

}

// Provide adds the given cid to the content routing system. If 'true' is
// passed, it also announces it, otherwise it is just kept in the local
// accounting of which objects are being provided.
func (br *BertyRouting) Provide(ctx context.Context, id cid.Cid, brd bool) error {
	if err := br.isReady(ctx); err != nil {
		logger().Error("routing isn't ready", zap.Error(err))
		return nil
	}

	return br.dht.Provide(ctx, id, brd)
}

// Search for peers who are able to provide a given key
func (br *BertyRouting) FindProvidersAsync(ctx context.Context, id cid.Cid, n int) <-chan pstore.PeerInfo {
	if err := br.isReady(ctx); err != nil {
		logger().Error("routing isn't ready", zap.Error(err))
	}

	return br.dht.FindProvidersAsync(ctx, id, n)
}

func (br *BertyRouting) isReady(ctx context.Context) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-br.cready:
		return nil
	}
}

func (br *BertyRouting) Listen(net inet.Network, a ma.Multiaddr)      {}
func (br *BertyRouting) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (br *BertyRouting) OpenedStream(net inet.Network, s inet.Stream) {}
func (br *BertyRouting) ClosedStream(net inet.Network, s inet.Stream) {}

// Connected block connection until dht is ready
func (br *BertyRouting) Connected(net inet.Network, c inet.Conn) {
	br.muReady.Lock()
	defer br.muReady.Unlock()

	if br.ready {
		return
	}

	go func() {
		br.muReady.Lock()
		defer br.muReady.Unlock()

		if !br.ready {
			for len(br.dht.RoutingTable().ListPeers()) == 0 {
				if len(net.Conns()) == 0 {
					logger().Warn("no conns available, aborting")
					return
				}

				// try again until bucket is fill with at last
				// one peer
				<-time.After(500)
			}

			t := time.Since(br.tstart)
			br.ready = true
			close(br.cready)
			logger().Info("DHT is now ready", zap.Duration("total time", t))
		}
	}()
}

func (br *BertyRouting) Disconnected(s inet.Network, c inet.Conn) {}
