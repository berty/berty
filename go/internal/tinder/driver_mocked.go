package tinder

import (
	"context"
	"sync"
	"time"

	libp2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	libp2p_host "github.com/libp2p/go-libp2p-core/host"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
)

type MockedDriverFactory struct {
	mockStore     *mockStore
	mockedDrivers []Driver
}

func NewMockedDriverFactory() *MockedDriverFactory {
	return &MockedDriverFactory{
		mockStore:     newMockStore(),
		mockedDrivers: make([]Driver, 0),
	}
}

func (mf *MockedDriverFactory) NewMockedDriver(h libp2p_host.Host) (d Driver) {
	d = &mockedDriver{
		Host:      h,
		mockStore: mf.mockStore,
	}

	mf.mockedDrivers = append(mf.mockedDrivers, d)
	return d
}

type mockedDriver struct {
	Host      libp2p_host.Host
	mockStore *mockStore
}

func (md *mockedDriver) Advertise(ctx context.Context, ns string, opts ...libp2p_discovery.Option) (ttl time.Duration, err error) {
	// Get options
	var options libp2p_discovery.Options
	err = options.Apply(opts...)
	if err != nil {
		return
	}

	// get peer info
	pi := md.Host.Peerstore().PeerInfo(md.Host.ID())
	ttl = options.Ttl
	md.mockStore.Put(ns, ttl, pi)
	return
}

func (md *mockedDriver) FindPeers(ctx context.Context, ns string, opts ...libp2p_discovery.Option) (<-chan libp2p_peer.AddrInfo, error) {
	// Get options
	var options libp2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	cpeers := make(chan libp2p_peer.AddrInfo)
	go func() {
		defer close(cpeers)

		pis := md.mockStore.Get(ns)
		for _, pi := range pis {
			cpeers <- pi
		}
	}()

	return cpeers, nil
}

func (md *mockedDriver) Unregister(ctx context.Context, ns string) (err error) {
	md.mockStore.Remove(ns, md.Host.ID())
	return nil
}

type mockStore struct {
	mockRecords map[string]mockRecords
	// dbRecords map[libp2p_peer.ID]*mockRecord
	muStore sync.RWMutex
}

func newMockStore() *mockStore {
	return &mockStore{
		mockRecords: make(map[string]mockRecords),
	}
}

type mockRecords []*mockRecord

func (rs mockRecords) AddrList() []libp2p_peer.AddrInfo {
	pis := make([]libp2p_peer.AddrInfo, len(rs))
	for i, r := range rs {
		pis[i] = r.pi
	}
	return pis
}

type mockRecord struct {
	pi      libp2p_peer.AddrInfo
	ttl     time.Duration
	timer   *time.Timer
	deleted bool
}

func newRecord(pi libp2p_peer.AddrInfo) *mockRecord {
	return &mockRecord{pi, 0, time.NewTimer(0), false}
}

func (r *mockRecord) SetTimer(ttl time.Duration, f func()) {
	if !r.timer.Stop() {
		<-r.timer.C
	}

	r.timer = time.AfterFunc(ttl, f)
	r.ttl = ttl
}

func (s *mockStore) Get(key string) []libp2p_peer.AddrInfo {
	s.muStore.RLock()
	defer s.muStore.RUnlock()

	recs, ok := s.mockRecords[key]
	if !ok {
		return []libp2p_peer.AddrInfo{}
	}

	return recs.AddrList()

}

func (s *mockStore) Remove(key string, pid libp2p_peer.ID) {
	s.muStore.Lock()
	defer s.muStore.Unlock()

	if recs, ok := s.mockRecords[key]; ok {
		for i, rec := range recs {
			if rec.pi.ID == pid {
				rec.timer.Stop()
				recs[len(recs)-1], recs[i] = recs[i], recs[len(recs)-1]
				s.mockRecords[key] = recs[:len(recs)-1]
				return
			}
		}

		if len(s.mockRecords[key]) == 0 {
			delete(s.mockRecords, key)
		}
	}

	return
}

func (s *mockStore) Put(key string, ttl time.Duration, pi libp2p_peer.AddrInfo) {
	s.muStore.Lock()
	defer s.muStore.Unlock()

	recs, ok := s.mockRecords[key]
	if !ok {
		s.mockRecords[key] = make(mockRecords, 0)
	}

	var rec *mockRecord
	for _, r := range recs {
		if r.pi.ID == pi.ID {
			rec = r
		}
	}

	if rec == nil {
		rec = newRecord(pi)
		s.mockRecords[key] = append(s.mockRecords[key], rec)
	}

	if ttl > 0 {
		rec.SetTimer(ttl, func() { s.Remove(key, pi.ID) })
	}

	return
}
