package tinder

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

type Service struct {
	host          host.Host
	logger        *zap.Logger
	drivers       []IDriver
	networkNotify *NetworkUpdate

	topicCounter map[string]*Subscription
	muTopics     sync.Mutex

	// subscribe
	peersCache *peersCache
	process    uint32
}

func NewService(h host.Host, logger *zap.Logger, drivers ...IDriver) (*Service, error) {
	nn, err := NewNetworkUpdate(logger, h)
	if err != nil {
		return nil, fmt.Errorf("unable to init service: %w", err)
	}

	return &Service{
		host:          h,
		logger:        logger.Named("tinder"),
		drivers:       drivers,
		networkNotify: nn,
		topicCounter:  make(map[string]*Subscription),
		peersCache:    newPeerCache(),
	}, nil
}

func (s *Service) FindPeers(ctx context.Context, topic string) <-chan peer.AddrInfo {
	s.muTopics.Lock()
	defer s.muTopics.Unlock()

	ctx, cancel := context.WithCancel(ctx)
	go func() {
		if err := s.LookupPeers(ctx, topic); err != nil {
			s.logger.Error("lookup failed", logutil.PrivateString("topic", topic), zap.Error(err))
		}
		cancel()
	}()

	return s.fadeOut(ctx, topic, 16)
}

// Unregister try to unregister topic on each of his driver
func (s *Service) Unregister(ctx context.Context, topic string) error {
	var wg sync.WaitGroup
	var success int32

	for _, driver := range s.drivers {
		wg.Add(1)
		go func(driver IDriver) {
			if err := driver.Unregister(ctx, topic); err != nil {
				s.logger.Debug("unable to advertise", zap.Error(err))
			} else {
				atomic.AddInt32(&success, 1)
			}
			wg.Done()
		}(driver)
	}

	wg.Wait()

	if success == 0 {
		return fmt.Errorf("no driver(s) were available for unregister")
	}

	return nil
}

func (s *Service) WatchPeers(ctx context.Context, topic string) <-chan peer.AddrInfo {
	return s.fadeOut(ctx, topic, 16)
}

func (s *Service) fadeIn(ctx context.Context, topic string, in <-chan peer.AddrInfo) {
	s.incProcess()
	defer s.decProcess()

	for {
		select {
		case p, ok := <-in:
			if !ok {
				return
			}

			if updated := s.peersCache.UpdatePeer(topic, p); updated {
				s.logger.Debug("topic updated", zap.String("topic", topic), zap.String("peer", p.String()))
			}
		case <-ctx.Done():
			return
		}
	}
}

func (s *Service) fadeOut(ctx context.Context, topic string, bufsize int) <-chan peer.AddrInfo {
	out := make(chan peer.AddrInfo, bufsize)

	go func() {
		knownPeers := make(PeersUpdate)

		for {
			// Wait until `PeersCache` differ from `peerCache` peers status
			updated, ok := s.peersCache.WaitForPeerUpdate(ctx, topic, knownPeers)
			if !ok {
				break
			}

			s.logger.Debug("got update on peer", zap.String("topic", topic), zap.Int("peers", len(updated)))
			for _, peer := range s.peersCache.GetPeers(updated...) {
				out <- peer
			}
		}

		// we're done here, close the channel and decrement process
		close(out)
	}()

	return out
}

func (s *Service) Close() error {
	return s.networkNotify.Close()
}

func (s *Service) GetProcess() uint32 { return atomic.LoadUint32(&s.process) }
func (s *Service) incProcess()        { atomic.AddUint32(&s.process, 1) }
func (s *Service) decProcess()        { atomic.AddUint32(&s.process, ^(uint32)(0)) }
