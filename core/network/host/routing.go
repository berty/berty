package host

import (
	"context"
	"sync"
	"time"

	"berty.tech/core/network/protocol"

	cid "github.com/ipfs/go-cid"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	routing "github.com/libp2p/go-libp2p-routing"
	ropts "github.com/libp2p/go-libp2p-routing/options"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

const (
	maxDelay  = 5.0 * time.Second
	baseDelay = 500.0 * time.Millisecond
	factor    = 1.2
)

var _ routing.IpfsRouting = (*BertyRouting)(nil)
var _ inet.Notifiee = (*BertyRouting)(nil)

type BertyRouting struct {
	routing protocol.Routing
	muReady sync.RWMutex
	cready  chan struct{}
	ready   bool
	tstart  time.Time
}

func NewBertyRouting(ctx context.Context, h host.Host, r protocol.Routing) (*BertyRouting, error) {
	br := &BertyRouting{
		routing: r,
		cready:  make(chan struct{}, 1),
		tstart:  time.Now(),
	}

	// Bootstrap DHT
	// Boostrap only return an error if a bad config is provided
	// since Bootstrap use default config, it should never happened
	if err := br.routing.Bootstrap(ctx); err != nil {
		logger().Warn("routing bootstrap error", zap.Error(err))
	}

	h.Network().Notify(br)
	return br, nil
}

func (br *BertyRouting) Bootstrap(ctx context.Context) error {
	return br.routing.Bootstrap(ctx)
}

// PutValue adds value corresponding to given Key.
func (br *BertyRouting) PutValue(ctx context.Context, k string, data []byte, opts ...ropts.Option) error {
	if err := br.isReady(ctx); err != nil {
		return err
	}

	return br.routing.PutValue(ctx, k, data, opts...)
}

// GetValue searches for the value corresponding to given Key.
func (br *BertyRouting) GetValue(ctx context.Context, ns string, opts ...ropts.Option) ([]byte, error) {
	if err := br.isReady(ctx); err != nil {
		return nil, err
	}

	return br.routing.GetValue(ctx, ns, opts...)
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
		return nil, err
	}

	return br.routing.SearchValue(ctx, ns, opts...)
}

func (br *BertyRouting) FindPeer(ctx context.Context, pid peer.ID) (pstore.PeerInfo, error) {
	if err := br.isReady(ctx); err != nil {
		logger().Error("routing isn't ready", zap.Error(err))
		return pstore.PeerInfo{}, err
	}
	return br.routing.FindPeer(ctx, pid)

}

// Provide adds the given cid to the content routing system. If 'true' is
// passed, it also announces it, otherwise it is just kept in the local
// accounting of which objects are being provided.
func (br *BertyRouting) Provide(ctx context.Context, id cid.Cid, brd bool) error {
	if err := br.isReady(ctx); err != nil {
		logger().Error("routing isn't ready", zap.Error(err))
		return err
	}

	return br.routing.Provide(ctx, id, brd)
}

// Search for peers who are able to provide a given key
func (br *BertyRouting) FindProvidersAsync(ctx context.Context, id cid.Cid, n int) <-chan pstore.PeerInfo {
	if err := br.isReady(ctx); err != nil {
		logger().Error("routing isn't ready", zap.Error(err))
	}
	return br.routing.FindProvidersAsync(ctx, id, n)
}

func (br *BertyRouting) isReady(ctx context.Context) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-br.cready:
		return nil
	}
}

func (br *BertyRouting) getBackoffDelay(currentDelay time.Duration) time.Duration {
	delay := float64(currentDelay) * factor
	if delay > float64(maxDelay) {
		return maxDelay
	}

	return time.Duration(delay)
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

		ctx := context.Background()
		if !br.ready {
			delay := baseDelay
			for !br.routing.IsReady(ctx) {
				delay = br.getBackoffDelay(delay)

				// try again until bucket is fill with at last
				// one peer
				<-time.After(delay)
			}

			t := time.Since(br.tstart)
			br.ready = true
			close(br.cready)
			logger().Info("Routing is now ready", zap.Duration("total time", t))
		}
	}()
}

func (br *BertyRouting) Disconnected(s inet.Network, c inet.Conn) {}
