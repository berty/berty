// from https://github.com/libp2p/go-libp2p-discovery/blob/master/mocks_test.go

package tinder

import (
	"context"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
)

type MockDriverServer struct {
	mx sync.RWMutex
	db map[string]map[p2p_peer.ID]*discoveryRegistration
}

type discoveryRegistration struct {
	info       p2p_peer.AddrInfo
	expiration time.Time
}

func NewMockedDriverServer() *MockDriverServer {
	return &MockDriverServer{
		db: make(map[string]map[p2p_peer.ID]*discoveryRegistration),
	}
}

func (s *MockDriverServer) Advertise(ns string, info p2p_peer.AddrInfo, ttl time.Duration) (time.Duration, error) {
	s.mx.Lock()
	defer s.mx.Unlock()

	peers, ok := s.db[ns]
	if !ok {
		peers = make(map[p2p_peer.ID]*discoveryRegistration)
		s.db[ns] = peers
	}
	peers[info.ID] = &discoveryRegistration{info, time.Now().Add(ttl)}
	return ttl, nil
}

func (s *MockDriverServer) FindPeers(ns string, limit int) (<-chan p2p_peer.AddrInfo, error) {
	s.mx.Lock()
	defer s.mx.Unlock()

	peers, ok := s.db[ns]
	if !ok || len(peers) == 0 {
		emptyCh := make(chan p2p_peer.AddrInfo)
		close(emptyCh)
		return emptyCh, nil
	}

	count := len(peers)
	if limit != 0 && count > limit {
		count = limit
	}

	iterTime := time.Now()
	ch := make(chan p2p_peer.AddrInfo, count)
	numSent := 0
	for p, reg := range peers {
		if numSent == count {
			break
		}
		if iterTime.After(reg.expiration) {
			delete(peers, p)
			continue
		}

		numSent++
		ch <- reg.info
	}

	if len(peers) == 0 {
		delete(s.db, ns)
	}

	close(ch)

	return ch, nil
}

func (s *MockDriverServer) Unregister(ns string, pid p2p_peer.ID) {
	s.mx.Lock()
	if peers, ok := s.db[ns]; ok {
		delete(peers, pid)

		if len(peers) == 0 {
			delete(s.db, ns)
		}
	}
	s.mx.Unlock()
}

func (s *MockDriverServer) HasPeerRecord(ns string, pid p2p_peer.ID) bool {
	s.mx.RLock()
	defer s.mx.RUnlock()

	if peers, ok := s.db[ns]; ok {
		_, ok := peers[pid]
		return ok
	}
	return false
}

func (s *MockDriverServer) Reset() {
	s.mx.Lock()
	s.db = make(map[string]map[p2p_peer.ID]*discoveryRegistration)
	s.mx.Unlock()
}

type mockDriverClient struct {
	host   p2p_host.Host
	server *MockDriverServer
}

func NewMockedDriverClient(host p2p_host.Host, server *MockDriverServer) Driver {
	return &mockDriverClient{host, server}
}

func (d *mockDriverClient) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return 0, err
	}

	return d.server.Advertise(ns, *p2p_host.InfoFromHost(d.host), options.Ttl)
}

func (d *mockDriverClient) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	return d.server.FindPeers(ns, options.Limit)
}

func (d *mockDriverClient) Unregister(ctx context.Context, ns string) error {
	d.server.Unregister(ns, d.host.ID())
	return nil
}
