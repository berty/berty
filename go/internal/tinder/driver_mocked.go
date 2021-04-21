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
	exist      chan struct{}
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

	if p, ok := peers[info.ID]; ok && p.exist != nil {
		select {
		case <-p.exist:
		default:
			close(p.exist)
		}
	}

	peers[info.ID] = &discoveryRegistration{info, time.Now().Add(ttl), nil}
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
		if p, ok := peers[pid]; ok {
			now := time.Now()
			return p.expiration.After(now)
			// log.Printf("expired since: %dms\n", now.Sub(p.expiration).Milliseconds())
		}
	}
	return false
}

func (s *MockDriverServer) WaitForAdvertise(ns string, pid p2p_peer.ID) chan struct{} {
	s.mx.Lock()
	defer s.mx.Unlock()

	cc := make(chan struct{})

	peers, ok := s.db[ns]
	if !ok {
		peers = make(map[p2p_peer.ID]*discoveryRegistration)
		s.db[ns] = peers
	}

	if p, ok := peers[pid]; ok && p.expiration.After(time.Now()) {
		close(cc)
		return cc
	}

	peers[pid] = &discoveryRegistration{p2p_peer.AddrInfo{ID: pid}, time.Now(), cc}
	return cc
}

func (s *MockDriverServer) Reset() {
	s.mx.Lock()
	s.db = make(map[string]map[p2p_peer.ID]*discoveryRegistration)
	s.mx.Unlock()
}

type MockDriverClient struct {
	host   p2p_host.Host
	server *MockDriverServer
}

func NewMockedDriverClient(name string, host p2p_host.Host, server *MockDriverServer) *Driver {
	c := &MockDriverClient{host, server}
	return &Driver{
		Name:         name,
		Unregisterer: c,
		Discovery:    c,
	}
}

func (d *MockDriverClient) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return 0, err
	}

	return d.server.Advertise(ns, *p2p_host.InfoFromHost(d.host), options.Ttl)
}

func (d *MockDriverClient) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	return d.server.FindPeers(ns, options.Limit)
}

func (d *MockDriverClient) Unregister(ctx context.Context, ns string) error {
	d.server.Unregister(ns, d.host.ID())
	return nil
}

func (d *MockDriverClient) Name() string { return "mock" }
