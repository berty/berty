package tinder

import (
	"context"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p/core/peer"
	ma "github.com/multiformats/go-multiaddr"

	"berty.tech/berty/v2/go/internal/notify"
)

type PeersUpdate map[peer.ID]time.Time

func (current PeersUpdate) HasUpdate(tu *topicUpdate) []peer.ID {
	peers := []peer.ID{}
	for p, update := range tu.peerUpdate {
		if lastUpdate, ok := current[p]; !ok || update.After(lastUpdate) {
			current[p] = update
			peers = append(peers, p)
		}
	}
	return peers
}

type topicUpdate struct {
	peerUpdate map[peer.ID]time.Time
	notify     *notify.Notify
}

type peersCache struct {
	topics  map[string]*topicUpdate
	muCache sync.RWMutex

	peers   map[peer.ID]peer.AddrInfo
	muPeers sync.RWMutex
}

func newPeerCache() *peersCache {
	return &peersCache{
		topics: make(map[string]*topicUpdate),
		peers:  make(map[peer.ID]peer.AddrInfo),
	}
}

func (c *peersCache) UpdatePeer(topic string, p peer.AddrInfo) (isNew bool) {
	c.muPeers.Lock()
	defer c.muPeers.Unlock()

	tu := c.getTopicUpdate(topic)

	// update peer update time
	tu.notify.L.Lock()
	defer tu.notify.L.Unlock()

	_, exist := tu.peerUpdate[p.ID]

	// do we already know this peer ?
	if prev, ok := c.peers[p.ID]; ok {
		if combined := mergeAddrInfos(prev, p); combined != nil {
			c.peers[p.ID] = *combined
		} else if exist {
			// we already know this peer, and no change have been provided
			return
		}
	} else {
		c.peers[p.ID] = p
	}

	t := time.Now()
	tu.peerUpdate[p.ID] = t

	// notify topic that peers has been updated
	tu.notify.Broadcast()

	return true
}

func (c *peersCache) GetPeers(ids ...peer.ID) (peers []peer.AddrInfo) {
	c.muPeers.RLock()
	peers = make([]peer.AddrInfo, len(ids))
	for i, id := range ids {
		peers[i] = c.peers[id]
	}
	c.muPeers.RUnlock()

	return
}

func (c *peersCache) GetPeersForTopics(topic string) (peers []peer.AddrInfo) {
	c.muPeers.RLock()
	defer c.muPeers.RUnlock()

	tu := c.getTopicUpdate(topic)

	tu.notify.L.Lock()
	defer tu.notify.L.Unlock()

	i := 0
	peers = make([]peer.AddrInfo, len(tu.peerUpdate))
	for peer := range tu.peerUpdate {
		peers[i] = c.peers[peer]
		i++
	}

	return
}

func (c *peersCache) WaitForPeerUpdate(ctx context.Context, topic string, current PeersUpdate) (updated []peer.ID, ok bool) {
	tu := c.getTopicUpdate(topic)

	tu.notify.L.Lock()
	for ok = true; ok; {
		// check if there are some diff between local state and the current state
		if updated = current.HasUpdate(tu); !ok || len(updated) > 0 {
			break // we got some update, leave the loop
		}

		// wait until there is an update on this group or context expire
		// unlock notify locker
		ok = tu.notify.Wait(ctx)
	}
	tu.notify.L.Unlock()

	return
}

func (c *peersCache) RemoveFromCache(ctx context.Context, topic string, p peer.ID) (ok bool) {
	c.muCache.Lock()
	var tu *topicUpdate
	if tu, ok = c.topics[topic]; ok {
		if _, ok = tu.peerUpdate[p]; ok {
			delete(tu.peerUpdate, p)
		}
	}
	c.muCache.Unlock()
	return
}

func (c *peersCache) getTopicUpdate(topic string) *topicUpdate {
	c.muCache.Lock()
	tu, ok := c.topics[topic]
	if !ok {
		tu = &topicUpdate{
			peerUpdate: make(map[peer.ID]time.Time),
			notify:     notify.New(&sync.Mutex{}),
		}
		c.topics[topic] = tu
	}
	c.muCache.Unlock()

	return tu
}

func mergeAddrInfos(prevAi, newAi peer.AddrInfo) *peer.AddrInfo {
	combinedAddrs := uniqueAddrs(prevAi.Addrs, newAi.Addrs)
	if len(combinedAddrs) > len(prevAi.Addrs) {
		combinedAi := &peer.AddrInfo{ID: prevAi.ID, Addrs: combinedAddrs}
		return combinedAi
	}
	return nil
}

// mergeAddrs merges input address lists, leave only unique addresses
func uniqueAddrs(addrss ...[]ma.Multiaddr) (uniqueAddrs []ma.Multiaddr) {
	exists := make(map[string]bool)
	for _, addrs := range addrss {
		for _, addr := range addrs {
			k := string(addr.Bytes())
			if exists[k] {
				continue
			}

			exists[k] = true
			uniqueAddrs = append(uniqueAddrs, addr)
		}
	}
	return uniqueAddrs
}
