package tinder

// import (
// 	"context"
// 	"sync"
// 	"time"

// 	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
// 	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
// 	"go.uber.org/zap"
// )

// type findPeersTimer struct {
// 	C <-chan p2p_peer.AddrInfo
// 	T *time.Timer
// }

// type WatchdogsAdvertiser struct {
// 	rootctx    context.Context
// 	rootcancel context.CancelFunc

// 	logger *zap.Logger
// 	disc   p2p_discovery.Discovery

// 	resetInterval time.Duration
// 	ttl           time.Duration

// 	advertise   map[string]*time.Timer
// 	muadvertise sync.Mutex

// 	findpeers   map[string]*findPeersTimer
// 	mufindpeers sync.Mutex
// }

// func NewWatchdogs(logger *zap.Logger, disc p2p_discovery.Discovery) (*watchdogs, error) {
// 	rootctx, cancel := context.WithCancel(context.Background())
// 	w := &Watchdogs{
// 		rootctx:    rootctx,
// 		rootcancel: cancel,
// 		advertise:  make(map[string]*time.Timer),
// 		findpeers:  make(map[string]*findPeersTimer),
// 		logger:     logger,
// 		disc:       disc,
// 	}

// 	return w, nil
// }

// func (w *Watchdogs) Advertise(_ context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
// 	// override context with our context
// 	ctx := w.rootctx

// 	w.muadvertise.Lock()

// 	timer := time.Now()
// 	if t, ok := w.advertise[ns]; ok {
// 		if !t.Stop() {
// 			<-t.C
// 		}

// 		t.Reset(w.resetInterval)
// 	} else {
// 		ctx, cancel := context.WithCancel(ctx)
// 		w.advertise[ns] = time.AfterFunc(w.resetInterval, func() {
// 			cancel()
// 			w.logger.Debug("advertise expired",
// 				zap.String("ns", ns),
// 				zap.Duration("duration", time.Since(timer)),
// 			)

// 			w.muadvertise.Lock()
// 			delete(w.advertise, ns)
// 			w.muadvertise.Unlock()
// 		})

// 		w.disc.Advertise(ctx, ns, opts...)
// 	}

// 	w.muadvertise.Unlock()

// 	w.logger.Debug("advertise started", zap.String("ns", ns))
// 	return w.ttl, nil
// }

// func (w *Watchdogs) FindPeers(_ context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
// 	// override context with our context
// 	ctx := w.rootctx

// 	w.mufindpeers.Lock()
// 	defer w.mufindpeers.Unlock()

// 	timer := time.Now()
// 	if ft, ok := w.findpeers[ns]; ok {
// 		if !ft.T.Stop() {
// 			<-ft.T.C
// 		}

// 		ft.T.Reset(w.resetInterval)
// 		return ft.C, nil
// 	}

// 	ctx, cancel := context.WithCancel(ctx)

// 	c, err := w.disc.FindPeers(ctx, ns, opts...)
// 	if err != nil {
// 		cancel()
// 		return nil, err
// 	}

// 	t := time.AfterFunc(w.resetInterval, func() {
// 		cancel()
// 		w.logger.Debug("findpeers expired",
// 			zap.String("ns", ns),
// 			zap.Duration("duration", time.Since(timer)),
// 		)

// 		w.mufindpeers.Lock()
// 		delete(w.findpeers, ns)
// 		w.mufindpeers.Unlock()
// 	})

// 	w.findpeers[ns] = &findPeersTimer{c, t}
// 	return c, nil
// }

// func (w *Watchdogs) Close() error {
// 	w.rootcancel()
// 	return nil
// }
