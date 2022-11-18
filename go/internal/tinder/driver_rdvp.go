// from https://github.com/berty/go-libp2p-rendezvous/blob/implement-spec/discovery.go
// @NOTE(gfanton): we need to dedup this file to add unregister method

package tinder

import (
	"context"
	"fmt"
	"math"
	mrand "math/rand"
	"sync"
	"time"

	p2p_rp "github.com/berty/go-libp2p-rendezvous"
	"github.com/libp2p/go-libp2p/core/discovery"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"go.uber.org/zap"
)

type rendezvousDiscovery struct {
	logger       *zap.Logger
	rp           p2p_rp.RendezvousPoint
	synccls      []p2p_rp.RendezvousSyncClient
	peerCache    map[string]*rpCache
	peerCacheMux sync.RWMutex
	rng          *mrand.Rand
	rngMux       sync.Mutex
	selfID       peer.ID
}

type rpCache struct {
	recs   map[peer.ID]*rpRecord
	cookie []byte
	mux    sync.Mutex
}

type rpRecord struct {
	peer   peer.AddrInfo
	expire int64
}

func NewRendezvousDiscovery(logger *zap.Logger, host host.Host, rdvPeer peer.ID, rng *mrand.Rand, emitters ...p2p_rp.RendezvousSyncClient) IDriver {
	rp := p2p_rp.NewRendezvousPoint(host, rdvPeer)
	return &rendezvousDiscovery{
		logger:    logger.Named("tinder/rdvp"),
		rp:        rp,
		rng:       rng,
		synccls:   emitters,
		peerCache: make(map[string]*rpCache),
		selfID:    host.ID(),
	}
}

func (c *rendezvousDiscovery) Advertise(ctx context.Context, topic string, opts ...discovery.Option) (time.Duration, error) {
	// Get options
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return 0, err
	}

	ttl := options.Ttl
	var ttlSeconds int

	if ttl == 0 {
		ttlSeconds = 7200
	} else {
		ttlSeconds = int(math.Round(ttl.Seconds()))
	}

	rttl, err := c.rp.Register(ctx, topic, ttlSeconds)
	if err != nil {
		return 0, err
	}

	return rttl, nil
}

func (c *rendezvousDiscovery) FindPeers(ctx context.Context, topic string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	// Get options
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	const maxLimit = 1000
	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	return c.findPeers(ctx, topic, limit)
}

func (c *rendezvousDiscovery) findPeers(ctx context.Context, topic string, limit int) (<-chan peer.AddrInfo, error) {
	// Get cached peers
	var err error

	c.peerCacheMux.RLock()
	cache, ok := c.peerCache[topic]
	c.peerCacheMux.RUnlock()
	if !ok {
		c.peerCacheMux.Lock()
		cache, ok = c.peerCache[topic]
		if !ok {
			cache = &rpCache{recs: make(map[peer.ID]*rpRecord)}
			c.peerCache[topic] = cache
		}
		c.peerCacheMux.Unlock()
	}

	cache.mux.Lock()
	defer cache.mux.Unlock()

	// Remove all expired entries from cache
	currentTime := time.Now().Unix()
	newCacheSize := len(cache.recs)

	for p := range cache.recs {
		rec := cache.recs[p]
		if rec.expire < currentTime {
			newCacheSize--
			delete(cache.recs, p)
		}
	}

	cookie := cache.cookie

	// Discover new records if we don't have enough
	if newCacheSize < limit {
		// TODO: Should we return error even if we have valid cached results?
		var regs []p2p_rp.Registration
		var newCookie []byte

		if regs, newCookie, err = c.rp.Discover(ctx, topic, limit, cookie); err == nil {
			for _, reg := range regs {
				rec := &rpRecord{peer: reg.Peer, expire: int64(reg.Ttl) + currentTime}
				cache.recs[rec.peer.ID] = rec
			}
			cache.cookie = newCookie
		} else {
			err = fmt.Errorf("unable to run discover: %w", err)
		}
	}

	// Randomize and fill channel with available records
	count := len(cache.recs)
	if limit < count {
		count = limit
	}

	chPeer := make(chan peer.AddrInfo, count)

	c.rngMux.Lock()
	perm := c.rng.Perm(len(cache.recs))[0:count]
	c.rngMux.Unlock()

	permSet := make(map[int]int)
	for i, v := range perm {
		permSet[v] = i
	}

	sendLst := make([]*peer.AddrInfo, count)
	iter := 0
	for k := range cache.recs {
		if sendIndex, ok := permSet[iter]; ok {
			sendLst[sendIndex] = &cache.recs[k].peer
		}
		iter++
	}

	for _, send := range sendLst {
		chPeer <- *send
	}

	close(chPeer)
	return chPeer, err
}

func (c *rendezvousDiscovery) Subscribe(ctx context.Context, topic string, _ ...discovery.Option) (<-chan peer.AddrInfo, error) {
	ch, err := c.getSubscribtionForTopic(ctx, topic)
	return ch, err
}

func (c *rendezvousDiscovery) Unregister(ctx context.Context, topic string, opts ...discovery.Option) error {
	c.peerCacheMux.RLock()
	cache, ok := c.peerCache[topic]
	if ok {
		cache.mux.Lock()
		delete(cache.recs, c.selfID)
		cache.mux.Unlock()
	}
	c.peerCacheMux.RUnlock()
	return c.rp.Unregister(ctx, topic)
}

func (c *rendezvousDiscovery) Name() string {
	return "rdvp"
}

func (c *rendezvousDiscovery) getSubscribtionForTopic(ctx context.Context, topic string) (<-chan peer.AddrInfo, error) {
	if len(c.synccls) > 0 {
		return c.rp.DiscoverSubscribe(ctx, topic, c.synccls)
	}

	ch := make(chan peer.AddrInfo, 16)
	creg, err := c.rp.DiscoverAsync(ctx, topic)
	if err != nil {
		return nil, fmt.Errorf("unable to start discovery async: %w", err)
	}

	go func() {
		defer close(ch)
		for reg := range creg {
			ch <- reg.Peer
		}
	}()

	return ch, nil
}

// nolint:gochecknoinits
func init() {
	p2p_rp.DiscoverAsyncInterval = time.Second * 30
}
