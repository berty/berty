package ipfsutil

import (
	"fmt"
	"sync"

	"github.com/libp2p/go-libp2p-core/connmgr"
	"github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
)

type TypeTagAction int

const (
	TypeTagActionTag TypeTagAction = iota
	TypeTagActionUntag
	TypeTagActionUpsert
)

type EvtPeerTag struct {
	Kind TypeTagAction

	Peer  peer.ID
	Tag   string
	Diff  int
	Total int
}

var _ connmgr.ConnManager = (*BertyConnManager)(nil)

// keep track of peer of interest
type BertyConnManager struct {
	connmgr.ConnManager

	logger     *zap.Logger
	tagEmitter event.Emitter
	muMarked   sync.RWMutex
	marked     map[peer.ID]int
}

func NewBertyConnManager(logger *zap.Logger, cm connmgr.ConnManager) *BertyConnManager {
	return &BertyConnManager{
		ConnManager: cm,
		logger:      logger,
		marked:      make(map[peer.ID]int),
	}
}

func (c *BertyConnManager) RegisterEventBus(bus event.Bus) (err error) {
	if c.tagEmitter == nil {
		c.tagEmitter, err = bus.Emitter(new(EvtPeerTag))
	} else {
		err = fmt.Errorf("event emitter already registered")
	}
	return err
}

func (c *BertyConnManager) GetPeerScore(p peer.ID) (score int, exist bool) {
	c.muMarked.RLock()
	score, exist = c.marked[p]
	c.muMarked.RUnlock()
	return
}

// TagPeer tags a peer with a string, associating a weight with the tag.
func (c *BertyConnManager) TagPeer(p peer.ID, tag string, score int) {
	c.ConnManager.TagPeer(p, tag, score)

	old, total := c.computePeerScore(p)

	if old != total && c.tagEmitter != nil {
		evt := EvtPeerTag{
			Kind:  TypeTagActionTag,
			Peer:  p,
			Tag:   tag,
			Diff:  total - old,
			Total: total,
		}

		if err := c.tagEmitter.Emit(evt); err != nil {
			c.logger.Error("unable to emit tag event", zap.Error(err))
		}
	}
}

// Untag removes the tagged value from the peer.
func (c *BertyConnManager) UntagPeer(p peer.ID, tag string) {
	c.ConnManager.UntagPeer(p, tag)

	old, total := c.computePeerScore(p)

	if old != total && c.tagEmitter != nil {
		evt := EvtPeerTag{
			Kind:  TypeTagActionUntag,
			Peer:  p,
			Tag:   tag,
			Diff:  total - old,
			Total: total,
		}

		if err := c.tagEmitter.Emit(evt); err != nil {
			c.logger.Error("unable to emit tag event", zap.Error(err))
		}
	}
}

// UpsertTag updates an existing tag or inserts a new one.

// The connection manager calls the upsert function supplying the current
// value of the tag (or zero if inexistent). The return value is used as
// the new value of the tag.
func (c *BertyConnManager) UpsertTag(p peer.ID, tag string, upsert func(int) int) {
	c.ConnManager.UpsertTag(p, tag, upsert)

	old, total := c.computePeerScore(p)

	if old != total && c.tagEmitter != nil {
		evt := EvtPeerTag{
			Kind:  TypeTagActionUpsert,
			Peer:  p,
			Tag:   tag,
			Diff:  total - old,
			Total: total,
		}

		if err := c.tagEmitter.Emit(evt); err != nil {
			c.logger.Error("unable to emit tag event", zap.Error(err))
		}
	}
}

func (c *BertyConnManager) computePeerScore(p peer.ID) (old, new int) {
	c.muMarked.Lock()

	old = c.marked[p]
	if info := c.ConnManager.GetTagInfo(p); info != nil {
		if new = info.Value; new > 0 {
			c.marked[p] = new
		} else {
			delete(c.marked, p)
		}
	}

	c.muMarked.Unlock()
	return
}
