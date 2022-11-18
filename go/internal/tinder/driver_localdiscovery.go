package tinder

import (
	"container/list"
	"context"
	"encoding/hex"
	"fmt"
	"math/rand"
	"sync"
	"time"

	ggio "github.com/gogo/protobuf/io"
	"github.com/libp2p/go-libp2p/core/discovery"
	"github.com/libp2p/go-libp2p/core/event"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	protocol "github.com/libp2p/go-libp2p/core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"go.uber.org/zap"

	nearby "berty.tech/berty/v2/go/internal/androidnearby"
	ble "berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/logutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
)

const (
	// LocalDiscoveryName is the name of the localdiscovery driver
	LocalDiscoveryName = "localdisc"

	recProtocolID = protocol.ID("berty/p2p/localrecord")

	minTTL   = 7200 * time.Second
	maxLimit = 1000
)

type LocalDiscovery struct {
	rootctx    context.Context
	rootcancel context.CancelFunc

	h      host.Host
	logger *zap.Logger

	recs   map[string] /* topic */ time.Time
	muRecs sync.RWMutex

	caches   map[string] /* topic */ *linkedCache
	muCaches sync.RWMutex
}

type linkedCache struct {
	sync.Locker
	recs  map[peer.ID]*recCache
	queue *list.List
	cond  *sync.Cond
}

type recCache struct {
	topic  string
	peer   *peer.AddrInfo
	expire time.Time
}

func newLinkedCache() *linkedCache {
	locker := sync.Mutex{}
	return &linkedCache{
		queue:  list.New(),
		recs:   make(map[peer.ID]*recCache),
		Locker: &locker,
		cond:   sync.NewCond(&locker),
	}
}

func NewLocalDiscovery(logger *zap.Logger, host host.Host, rng *rand.Rand) (*LocalDiscovery, error) {
	ctx, cancel := context.WithCancel(context.Background())
	ld := &LocalDiscovery{
		rootctx:    ctx,
		rootcancel: cancel,

		logger: logger.Named("localdisc"),
		h:      host,
		recs:   make(map[string]time.Time),
		caches: make(map[string]*linkedCache),
	}

	host.SetStreamHandler(recProtocolID, ld.handleStream)
	if err := ld.monitorConnection(ctx); err != nil {
		return nil, fmt.Errorf("unable to monitor connection: %w", err)
	}

	return ld, nil
}

func (ld *LocalDiscovery) Close() error {
	ld.rootcancel()
	return nil
}

func (ld *LocalDiscovery) Advertise(ctx context.Context, cid string, opts ...discovery.Option) (time.Duration, error) {
	ld.logger.Debug("advertise record", logutil.PrivateString("ns", cid))

	// Get options
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return minTTL, err
	}

	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	ttl := options.Ttl
	if ttl <= minTTL {
		ttl = minTTL
	}

	expire := time.Now().Add(ttl)

	ld.muRecs.Lock()
	_, exist := ld.recs[cid]
	if !exist && len(ld.recs) > limit {
		ld.muRecs.Unlock()
		return minTTL, fmt.Errorf("unable to add record, reached limit of %d", limit)
	}

	ld.recs[cid] = expire
	ld.muRecs.Unlock()

	ld.logger.Debug("advertise", zap.String("ns", hex.EncodeToString([]byte(cid))))

	// send it to already connected proximity peers
	records := []*Record{{Cid: cid, Expire: expire.Unix()}}
	ld.sendRecordsToProximityPeers(ctx, &Records{Records: records})

	return ttl, nil
}

func (ld *LocalDiscovery) FindPeers(ctx context.Context, cid string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	// Get options
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}

	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	ld.muCaches.RLock()
	defer ld.muCaches.RUnlock()

	var out chan peer.AddrInfo

	if cache, ok := ld.caches[cid]; ok {
		cache.Lock()
		size := len(cache.recs)
		if size > limit {
			size = limit
		}

		out = make(chan peer.AddrInfo, size) // make the channel

		for _, rec := range cache.recs {
			out <- *rec.peer
			size--
			if size == 0 {
				break
			}
		}
		cache.Unlock()
	} else {
		out = make(chan peer.AddrInfo) // make the channel
	}

	close(out)
	return out, nil
}

func (ld *LocalDiscovery) Subscribe(ctx context.Context, cid string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	ld.logger.Debug("starting subscribe", logutil.PrivateString("ns", cid))
	cpeer := make(chan peer.AddrInfo)

	// Get options
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		close(cpeer)
		return cpeer, err
	}

	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	ld.muCaches.Lock()
	cache, ok := ld.caches[cid]
	if !ok {
		cache = newLinkedCache()
		ld.caches[cid] = cache
	}
	ld.muCaches.Unlock()

	ctx, cancel := context.WithCancel(ctx)
	go func() {
		<-ctx.Done()
		cancel()
		cache.cond.Broadcast()
	}()

	current := cache.queue.Front()
	counter := 0

	go func() {
		cache.Lock()
		for ctx.Err() == nil && counter <= limit {
			if current == nil {
				// unlock the mutex
				// wait for new elements in the list
				cache.cond.Wait()
				current = cache.queue.Back()
				continue
			}

			next := current.Next()
			rec := current.Value.(*recCache)

			if time.Now().After(rec.expire) {
				ld.logger.Debug("receiving expired record",
					logutil.PrivateString("ns", cid),
					zap.Duration("since", time.Since(rec.expire)))

				delete(cache.recs, rec.peer.ID)
				cache.queue.Remove(current)
			} else {
				ld.logger.Debug("receiving record", logutil.PrivateString("ns", cid))

				select {
				case cpeer <- *rec.peer:
					counter++
				case <-ctx.Done():
				}
			}

			// move our pointer forward
			current = next
		}
		close(cpeer)
		cache.Unlock()

		ld.logger.Debug("find peers ended", logutil.PrivateString("ns", cid), zap.Error(ctx.Err()))
	}()

	return cpeer, nil
}

func (ld *LocalDiscovery) getLocalReccord() *Records {
	records := []*Record{}
	now := time.Now()

	ld.muRecs.Lock()
	for cid, expire := range ld.recs {
		// if expired remove from cache
		if now.After(expire) {
			delete(ld.recs, cid)
			continue
		}

		records = append(records, &Record{
			Cid:    cid,
			Expire: expire.Unix(),
		})
	}
	ld.muRecs.Unlock()

	return &Records{Records: records}
}

func (ld *LocalDiscovery) Unregister(ctx context.Context, cid string, _ ...discovery.Option) error {
	ld.muRecs.Lock()
	delete(ld.recs, cid)
	ld.muRecs.Unlock()
	return nil
}

func (ld *LocalDiscovery) sendRecordsToProximityPeers(ctx context.Context, records *Records) {
	conns := ld.h.Network().Conns()
	wg := sync.WaitGroup{}

	for _, c := range conns {
		if manet.IsPrivateAddr(c.RemoteMultiaddr()) || isProximityProtocol(c.RemoteMultiaddr()) {
			wg.Add(1)
			go func(c network.Conn) {
				ld.logger.Debug("sending records to peer", zap.Stringer("peer", c.RemotePeer()))

				if err := ld.sendRecordsTo(ctx, c.RemotePeer(), records); err != nil {
					ld.logger.Warn("unable to send records to newly connected peer",
						zap.Error(err), zap.Stringer("peer", c.RemotePeer()))
				}

				wg.Done()
			}(c)
		}
	}

	wg.Wait()
}

// Called when is a stream is opened by a remote peer
// Receive remote peer cache and put it in our local cache
func (ld *LocalDiscovery) handleStream(s network.Stream) {
	defer s.Reset() // nolint:errcheck

	reader := ggio.NewDelimitedReader(s, network.MessageSizeMax)
	records := Records{}
	if err := reader.ReadMsg(&records); err != nil {
		ld.logger.Error("handleStream receive an invalid local record", zap.Error(err))
		return
	}

	info := peer.AddrInfo{
		ID:    s.Conn().RemotePeer(),
		Addrs: []ma.Multiaddr{s.Conn().RemoteMultiaddr()},
	}

	// fill the remote cache
	for _, record := range records.Records {
		expire := time.Unix(record.Expire, 0)

		ld.logger.Debug("saving remote record in cache",
			logutil.PrivateString("remoteID", s.Conn().RemotePeer().String()),
			logutil.PrivateString("CID", record.Cid),
			zap.Time("expire", expire))

		ld.muCaches.Lock()
		cache, ok := ld.caches[record.Cid]
		if !ok {
			cache = newLinkedCache()
			ld.caches[record.Cid] = cache
		}
		ld.muCaches.Unlock()

		rec := &recCache{
			peer:   &info,
			topic:  record.Cid,
			expire: expire,
		}

		// update the given cache record and signal to other routine that we got an update
		cache.Lock()
		if cacheRec, ok := cache.recs[info.ID]; ok {
			cacheRec.peer = &info
			cacheRec.expire = expire
		} else {
			cache.recs[info.ID] = rec
			cache.queue.PushBack(rec)
		}

		cache.cond.Broadcast()
		cache.Unlock()
	}
}

func (ld *LocalDiscovery) sendRecordsTo(ctx context.Context, p peer.ID, records *Records) error {
	s, err := ld.h.NewStream(ctx, p, recProtocolID)
	if err != nil {
		return fmt.Errorf("unable to create stream: %w", err)
	}
	defer s.Close()

	pbw := ggio.NewDelimitedWriter(s)
	if err := pbw.WriteMsg(records); err != nil {
		return fmt.Errorf("write error: %w", err)
	}

	return nil
}

func isProximityProtocol(addr ma.Multiaddr) bool {
	for _, p := range addr.Protocols() {
		switch p.Code {
		case ble.ProtocolCode, mc.ProtocolCode, nearby.ProtocolCode:
			return true
		default:
		}
	}
	return false
}

func (ld *LocalDiscovery) handleConnection(ctx context.Context, p peer.ID) {
	if p == ld.h.ID() {
		return
	}

	// check if we use a proximity addrs with this peer
	conns := ld.h.Network().ConnsToPeer(p)
	for _, conn := range conns {
		if manet.IsPrivateAddr(conn.RemoteMultiaddr()) || isProximityProtocol(conn.RemoteMultiaddr()) {
			ld.logger.Info("found local peer", logutil.PrivateString("peer", conn.RemotePeer().String()))
			go func() {
				records := ld.getLocalReccord()
				if err := ld.sendRecordsTo(ctx, p, records); err != nil {
					ld.logger.Warn("unable to send local record",
						logutil.PrivateString("peer", p.String()),
						zap.Int("records", len(records.Records)),
						zap.Error(err))
				}
			}()

			return
		}
	}
}

func (ld *LocalDiscovery) monitorConnection(ctx context.Context) error {
	sub, err := ld.h.EventBus().Subscribe(new(event.EvtPeerConnectednessChanged))
	if err != nil {
		return fmt.Errorf("unable to subscribe to `EvtPeerConnectednessChanged`: %w", err)
	}

	// check already connected peers
	for _, p := range ld.h.Peerstore().Peers() {
		if ld.h.Network().Connectedness(p) == network.Connected {
			ld.handleConnection(ctx, p)
		}
	}

	go func() {
		defer sub.Close()
		for {
			var e interface{}
			select {
			case e = <-sub.Out():
			case <-ctx.Done():
				return
			}

			evt := e.(event.EvtPeerConnectednessChanged)

			// send record to connected peer only
			if evt.Connectedness != network.Connected {
				continue
			}

			ld.handleConnection(ctx, evt.Peer)
		}
	}()

	return nil
}

func (ld *LocalDiscovery) Name() string {
	return LocalDiscoveryName
}
