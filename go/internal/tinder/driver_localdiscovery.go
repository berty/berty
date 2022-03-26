package tinder

import (
	"container/list"
	"context"
	"encoding/hex"
	"fmt"
	"math/rand"
	mrand "math/rand"
	"sync"
	"time"

	ggio "github.com/gogo/protobuf/io"
	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	protocol "github.com/libp2p/go-libp2p-core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"go.uber.org/zap"

	nearby "berty.tech/berty/v2/go/internal/androidnearby"
	ble "berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/logutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
)

const recProtocolID = protocol.ID("berty/p2p/localrecord")

// LocalDiscoveryName is the name of the localdiscovery driver
const LocalDiscoveryName = "localdiscovery"

const (
	minTTL   = 7200 * time.Second
	maxLimit = 1000
)

type LocalDiscovery struct {
	h      host.Host
	logger *zap.Logger

	rootctx context.Context

	recs   map[string]time.Time
	muRecs sync.RWMutex

	cache    map[string]*linkedCache
	muCaches sync.Mutex
}

type linkedCache struct {
	sync.Locker
	watcher int
	peers   map[peer.ID]*peer.AddrInfo
	queue   *list.List
	cond    *sync.Cond
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
		Locker: &locker,
		cond:   sync.NewCond(&locker),
	}
}

func NewLocalDiscovery(logger *zap.Logger, host host.Host, rng *mrand.Rand) UnregisterDiscovery {
	ld := &LocalDiscovery{
		logger: logger.Named("localdisc"),
		h:      host,
		recs:   make(map[string]time.Time),
		cache:  make(map[string]*linkedCache),
	}

	host.SetStreamHandler(recProtocolID, ld.handleStream)
	host.Network().Notify(ld)
	return ld
}

func (ld *LocalDiscovery) Advertise(ctx context.Context, cid string, opts ...discovery.Option) (time.Duration, error) {
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
	rec, exist := ld.recs[cid]
	if !exist {
		rec = expire
		ld.recs[cid] = rec
	}
	ld.muRecs.Unlock()

	ld.logger.Debug("advertise", zap.String("ns", hex.EncodeToString([]byte(cid))))

	if !exist {
		// if this cid is new, send it to already connected proximity peers
		records := []*Record{{Cid: cid, Expire: expire.Unix()}}
		ld.sendRecordsToProximityPeers(ctx, &Records{Records: records})
	}

	return ttl, nil
}

func (ld *LocalDiscovery) FindPeers(ctx context.Context, cid string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	ld.logger.Debug("starting find peers")

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
	cachelist, ok := ld.cache[cid]
	if !ok {
		cachelist = newLinkedCache()
		ld.cache[cid] = cachelist
	}
	ld.muCaches.Unlock()

	ctx, cancel := context.WithCancel(ctx)
	go func() {
		<-ctx.Done()
		cancel()
		cachelist.cond.Broadcast()
	}()

	current := cachelist.queue.Front()
	counter := 0

	go func() {
		cachelist.Lock()
		cachelist.watcher++
		for ctx.Err() == nil && counter <= limit {
			if current == nil {
				cachelist.cond.Wait()
				current = cachelist.queue.Back()
				continue
			}

			next := current.Next()
			rec := current.Value.(*recCache)
			if time.Now().After(rec.expire) {
				delete(cachelist.peers, rec.peer.ID)
				cachelist.queue.Remove(current)
			} else {
				select {
				case cpeer <- *rec.peer:
					counter++
				case <-ctx.Done():
				}
			}

			current = next
		}
		cachelist.watcher--
		close(cpeer)
		cachelist.Unlock()
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

	// @TODO(gfanton): is that really necessary ?
	rand.Shuffle(len(records), func(i, j int) {
		records[i], records[j] = records[j], records[i]
	})

	return &Records{Records: records}
}

func (ld *LocalDiscovery) Unregister(ctx context.Context, cid string) error {
	ld.muRecs.Lock()
	delete(ld.recs, cid)
	ld.muRecs.Unlock()
	return nil
}

func (ld *LocalDiscovery) sendRecordsToProximityPeers(ctx context.Context, records *Records) error {
	conns := ld.h.Network().Conns()
	wg := sync.WaitGroup{}

	for _, c := range conns {
		if !manet.IsPrivateAddr(c.RemoteMultiaddr()) && !isProximityProtocol(c.RemoteMultiaddr()) {
			continue
		}

		wg.Add(1)
		go func(c network.Conn) {
			if err := ld.sendRecordsTo(ctx, c.RemotePeer(), records); err != nil {
				ld.logger.Error("unable to send records to newly connected peer",
					zap.Error(err), zap.Stringer("peer", c.RemotePeer()))
			}

			wg.Done()
		}(c)
	}

	wg.Wait()

	return nil
}

// Called when is a stream is opened by a remote peer
// Receive remote peer cache and put it in our local cache
func (ld *LocalDiscovery) handleStream(s network.Stream) {
	defer s.Reset()

	reader := ggio.NewDelimitedReader(s, network.MessageSizeMax)
	records := Records{}
	if err := reader.ReadMsg(&records); err != nil {
		ld.logger.Error("handleStream receive an invalid local record", zap.Error(err))
		return
	}

	pid := ld.h.Peerstore().PeerInfo(s.Conn().RemotePeer())

	// fill the remote cache
	for _, record := range records.Records {
		expire := time.Unix(record.Expire, 0)
		ld.logger.Debug("saving remote record in cache",
			logutil.PrivateString("remoteID", s.Conn().RemotePeer().String()),
			logutil.PrivateString("CID", record.Cid),
			zap.Time("expire", expire))

		ld.muCaches.Lock()
		cache, ok := ld.cache[record.Cid]
		if !ok {
			cache = newLinkedCache()
			ld.cache[record.Cid] = cache
		}
		ld.muCaches.Unlock()

		rec := &recCache{
			peer:   &pid,
			topic:  record.Cid,
			expire: expire,
		}

		// update the given cache addrs and signal to other routine that we got an update
		cache.Lock()
		if p, ok := cache.peers[pid.ID]; ok {
			p.Addrs = pid.Addrs
		} else {
			cache.queue.PushBack(rec)
		}

		if cache.watcher > 0 {
			cache.cond.Broadcast()
		}
		cache.Unlock()
	}
}

func (ld *LocalDiscovery) sendRecordsTo(ctx context.Context, p peer.ID, records *Records) error {
	s, err := ld.h.NewStream(ctx, p, recProtocolID)
	if err != nil {
		return fmt.Errorf("unable to create stream %w", err)
	}
	defer s.Close()

	pbw := ggio.NewDelimitedWriter(s)
	if err := pbw.WriteMsg(records); err != nil {
		return fmt.Errorf("write error: %w", err)
	}

	return nil
}

func (ld *LocalDiscovery) Connected(net network.Network, c network.Conn) {
	// addrfactory in tinder
	if manet.IsPrivateAddr(c.RemoteMultiaddr()) || isProximityProtocol(c.RemoteMultiaddr()) {
		go func() {
			ctx := context.Background()

			time.Sleep(time.Second)

			records := ld.getLocalReccord()
			if err := ld.sendRecordsTo(ctx, c.RemotePeer(), records); err != nil {
				ld.logger.Error("unable to send records to newly connected peer", zap.Error(err), zap.Stringer("peer", c.RemotePeer()))
			}
		}()
	}
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

// Implementation of the network.Notifiee interface
// Called when network starts listening on an addr
func (ld *LocalDiscovery) Listen(network.Network, ma.Multiaddr) {}

// Implementation of the network.Notifiee interface
// Called when network stops listening on an addr
func (ld *LocalDiscovery) ListenClose(network.Network, ma.Multiaddr) {}

// Implementation of the network.Notifiee interface
// Called when a connection closed
func (ld *LocalDiscovery) Disconnected(network.Network, network.Conn) {}

// Implementation of the network.Notifiee interface
// Called when a stream opened
func (ld *LocalDiscovery) OpenedStream(network.Network, network.Stream) {}

// Implementation of the network.Notifiee interface
// Called when a stream closed
func (ld *LocalDiscovery) ClosedStream(network.Network, network.Stream) {}
