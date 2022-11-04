package tinder

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
)

type MockDriverServer struct {
	pc     *peersCache
	topics map[string] /* topic */ map[peer.ID]time.Time
	mx     sync.RWMutex
}

func NewMockDriverServer() *MockDriverServer {
	return &MockDriverServer{
		topics: make(map[string]map[peer.ID]time.Time),
		pc:     newPeerCache(),
	}
}

func (s *MockDriverServer) Advertise(topic string, info peer.AddrInfo, ttl time.Duration) {
	s.mx.Lock()
	expires, ok := s.topics[topic]
	if !ok {
		expires = map[peer.ID]time.Time{}
		s.topics[topic] = expires
	}
	expires[info.ID] = time.Now().Add(ttl)
	s.mx.Unlock()

	s.pc.UpdatePeer(topic, info)
}

func (s *MockDriverServer) FindPeers(topic string, limit int) <-chan peer.AddrInfo {
	s.mx.Lock()
	defer s.mx.Unlock()

	peers := s.pc.GetPeersForTopics(topic)
	if len(peers) < limit {
		limit = len(peers)
	}

	expires, ok := s.topics[topic]
	if !ok {
		expires = map[peer.ID]time.Time{}
		s.topics[topic] = expires
	}

	out := make(chan peer.AddrInfo, limit)
	for i := 0; i < limit; i++ {
		peer := peers[i]
		if expire, ok := expires[peer.ID]; ok {
			if time.Now().Before(expire) {
				out <- peer
			} else {
				delete(expires, peer.ID)
			}
		}
	}

	close(out)
	return out
}

func (s *MockDriverServer) Unregister(ctx context.Context, topic string, p peer.ID) {
	s.mx.Lock()
	s.pc.RemoveFromCache(ctx, topic, p)
	if expires, ok := s.topics[topic]; ok {
		delete(expires, p)
	}
	s.mx.Unlock()
}

func (s *MockDriverServer) Exist(topic string, p peer.ID) (ok bool) {
	peers := s.pc.GetPeersForTopics(topic)
	return len(peers) == 1
}

func (s *MockDriverServer) Subscribe(ctx context.Context, topic string, buffsize int) <-chan peer.AddrInfo {
	// subtract 500ms to make sure to avoid data race and miss some event
	s.mx.Lock()
	defer s.mx.Unlock()

	start := time.Now()

	peers := s.pc.GetPeersForTopics(topic)
	knownPeers := make(PeersUpdate)
	for _, p := range peers {
		knownPeers[p.ID] = start
	}

	out := make(chan peer.AddrInfo, buffsize)
	go func() {
		for {
			// Wait until `PeersCache` differ from `peerCache` peers status
			updated, ok := s.pc.WaitForPeerUpdate(ctx, topic, knownPeers)
			if !ok {
				break // context has expired
			}

			// send peers
			for _, peer := range s.pc.GetPeers(updated...) {
				out <- peer
			}
		}

		// we're done here, close the channel and decrement
		close(out)
	}()

	return out
}

func (s *MockDriverServer) WaitForPeer(topic string, p peer.ID, timeout time.Duration) (err error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	knownPeers := make(PeersUpdate)

	for {
		// Wait until `PeersCache` differ from `peerCache` peers status
		updated, expired := s.pc.WaitForPeerUpdate(ctx, topic, knownPeers)
		if !expired {
			return fmt.Errorf("timeout while waiting for: %s", p.String())
		}

		// send peers
		for _, upeer := range updated {
			if upeer == p {
				return nil
			}
		}
	}
}

func (s *MockDriverServer) Client(h host.Host) IDriver {
	return &MockIDriverClient{h: h, serv: s}
}

var _ IDriver = (*MockIDriverClient)(nil)

type MockIDriverClient struct {
	h    host.Host
	serv *MockDriverServer
}

func (s *MockIDriverClient) Name() string {
	return "mock"
}

func (s *MockIDriverClient) FindPeers(ctx context.Context, topic string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	if options.Ttl == 0 {
		options.Limit = 1000
	}

	return s.serv.FindPeers(topic, options.Limit), nil
}

func (s *MockIDriverClient) Advertise(ctx context.Context, topic string, opts ...discovery.Option) (time.Duration, error) {
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return 0, err
	}

	if options.Ttl == 0 {
		options.Ttl = time.Second * 10
	}

	info := s.h.Peerstore().PeerInfo(s.h.ID())
	s.serv.Advertise(topic, info, options.Ttl)
	return options.Ttl, nil
}

func (s *MockIDriverClient) Subscribe(ctx context.Context, topic string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	v := options.Other[optionSubscribeBufferSize]
	var buffsize int
	var ok bool
	if buffsize, ok = v.(int); !ok || buffsize == 0 {
		buffsize = 16
	}

	out := s.serv.Subscribe(ctx, topic, buffsize)
	return out, nil
}

func (s *MockIDriverClient) Unregister(ctx context.Context, topic string, opts ...discovery.Option) error {
	s.serv.Unregister(ctx, topic, s.h.ID())
	return nil
}

type discOption string

const (
	optionSubscribeBufferSize discOption = "tinder_subsize"
)

func MockBufferSize(size int) discovery.Option {
	return func(opts *discovery.Options) error {
		if opts.Other == nil {
			opts.Other = make(map[interface{}]interface{})
		}

		opts.Other[optionSubscribeBufferSize] = size
		return nil
	}
}
