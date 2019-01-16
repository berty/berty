package provider

import (
	"context"
	"fmt"
	"sync"

	cid "github.com/ipfs/go-cid"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"go.uber.org/zap"
)

type Handler func(cid.Cid, *pstore.PeerInfo)

func NoopHandler(id cid.Cid, pi *pstore.PeerInfo) {
	logger().Debug("noop handler", zap.String("id", id.String()), zap.String("peerID", pi.ID.Pretty()))
}

type Provider interface {
	RegisterHandler(Handler)
	FindProviders(context.Context, cid.Cid) error
	Provide(context.Context, cid.Cid) error
}

type Manager struct {
	providers []Provider

	pubs   map[cid.Cid][]chan Peers
	muPubs sync.Mutex

	subs   map[cid.Cid]Peers // map SubID -> PeerID
	muSubs sync.Mutex
}

func NewManager() *Manager {
	return &Manager{
		providers: make([]Provider, 0),
		pubs:      make(map[cid.Cid][]chan Peers),
		subs:      make(map[cid.Cid]Peers),
	}
}

func (m *Manager) addPeerToSub(id cid.Cid, pi *pstore.PeerInfo) error {
	m.muSubs.Lock()
	defer m.muSubs.Unlock()

	logger().Debug("registering", zap.String("id", id.String()))
	for k, v := range m.subs {
		logger().Debug("key, value", zap.String("k", k.String()), zap.Int("v", len(v)))
	}

	ps, ok := m.subs[id]
	if !ok {
		return fmt.Errorf("not subscribed to %s", id)
	}

	m.subs[id] = ps.add(pi)
	return nil
}

func (m *Manager) removeSub(id cid.Cid) error {
	m.muSubs.Lock()
	defer m.muSubs.Unlock()

	if _, ok := m.subs[id]; ok {
		return fmt.Errorf("not subscribed to %s", id)
	}

	delete(m.subs, id)
	return nil
}

func (m *Manager) createSub(id cid.Cid) error {
	m.muSubs.Lock()
	defer m.muSubs.Unlock()

	if _, ok := m.subs[id]; ok {
		return fmt.Errorf("already subscribed to %s", id)
	}

	m.subs[id] = make(Peers, 0)
	return nil
}

func (m *Manager) removePeerFromSub(id cid.Cid, pi *pstore.PeerInfo) error {
	m.muSubs.Lock()
	defer m.muSubs.Unlock()

	ps, ok := m.subs[id]
	if !ok {
		return fmt.Errorf("not subscribed to %s", id)
	}

	m.subs[id] = ps.remove(pi)
	return nil
}

func (m *Manager) getPeersForSub(id cid.Cid) (Peers, error) {
	m.muSubs.Lock()
	defer m.muSubs.Unlock()

	ps, ok := m.subs[id]
	if !ok {
		return nil, fmt.Errorf("not subscribed to %s", id)
	}

	return ps, nil
}

func (m *Manager) consumePubs(id cid.Cid) error {
	m.muPubs.Lock()
	defer m.muPubs.Unlock()

	ps, err := m.getPeersForSub(id)
	if err != nil {
		return fmt.Errorf("consume pub error: `%s`", err)
	}

	if pubs, ok := m.pubs[id]; ok {
		for _, pub := range pubs {
			pub <- ps
		}

		delete(m.pubs, id)
	}

	return nil
}

func (m *Manager) createPub(id cid.Cid) <-chan Peers {
	m.muPubs.Lock()
	defer m.muPubs.Unlock()

	pub := make(chan Peers, 1)
	if pubs, ok := m.pubs[id]; ok {
		m.pubs[id] = append(pubs, pub)
	} else {
		m.pubs[id] = make([]chan Peers, 1)
		m.pubs[id][0] = pub
	}

	return pub
}

func (m *Manager) GetLocalPeers(id cid.Cid) (Peers, error) {
	return m.getPeersForSub(id)
}

func (m *Manager) Provide(ctx context.Context, id cid.Cid) error {
	logger().Debug("providing", zap.String("id", id.String()))

	ok := false
	for _, p := range m.providers {
		if err := p.Provide(ctx, id); err != nil {
			logger().Warn("failed to provide", zap.String("id", id.String()), zap.Error(err))
		} else {
			ok = true
		}
	}

	if !ok {
		return fmt.Errorf("Failed to provide with at last on provider")
	}

	return nil
}

func (m *Manager) FindProviders(ctx context.Context, id cid.Cid) error {
	logger().Debug("finding providers", zap.String("id", id.String()))

	// create subscription
	ps, err := m.getPeersForSub(id)
	if err == nil && len(ps) > 0 {
		return nil
	}

	if err := m.createSub(id); err != nil {
		logger().Warn("provider subscription", zap.Error(err))
	}

	ok := false
	for _, p := range m.providers {
		if err := p.FindProviders(ctx, id); err != nil {
			logger().Warn("finding providers", zap.String("id", id.String()), zap.Error(err))
		} else {
			ok = true
		}
	}

	if !ok {
		return fmt.Errorf("Failed to finding providers with at last one provider")
	}

	return nil
}

func (m *Manager) WaitForProviders(ctx context.Context, id cid.Cid) (Peers, error) {
	ps, err := m.getPeersForSub(id)
	if err != nil {
		return nil, err
	}

	if len(ps) > 0 {
		return ps, nil
	}

	pub := m.createPub(id)
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case ps = <-pub:
		return ps, nil
	}
}

func (m *Manager) PeerHandler(id cid.Cid, pi *pstore.PeerInfo) {
	if err := m.addPeerToSub(id, pi); err != nil {
		logger().Warn("peer handler",
			zap.String("id", id.String()),
			zap.String("peerID", pi.ID.Pretty()),
			zap.Error(err))

		return
	}

	if err := m.consumePubs(id); err != nil {
		logger().Warn("peer handler",
			zap.String("id", id.String()),
			zap.String("peerID", pi.ID.Pretty()),
			zap.Error(err))
	}
}

func (m *Manager) Register(p Provider) {
	p.RegisterHandler(m.PeerHandler)
	m.providers = append(m.providers, p)
}
