package tinder

// localdiscovery isn't use for now since most of the job is done by pubsub,
// keep it here in case we need it

import (
	"context"
	"errors"
	"io"
	"math"
	mrand "math/rand"
	"sync"
	"time"

	ggio "github.com/gogo/protobuf/io"
	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	mafmt "github.com/multiformats/go-multiaddr-fmt"
	manet "github.com/multiformats/go-multiaddr/net"
	msmux "github.com/multiformats/go-multistream"
	"go.uber.org/zap"

	nearby "berty.tech/berty/v2/go/internal/androidnearby"
	ble "berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/logutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
)

const recProtocolID = protocol.ID("berty/p2p/localrecord")

type localDiscovery struct {
	logger       *zap.Logger
	host         host.Host
	peerCache    map[string]*pCache
	peerCacheMux sync.RWMutex
	rng          *mrand.Rand
	rngMux       sync.Mutex
}

type pCache struct {
	recs map[peer.ID]*pRecord
	mux  sync.RWMutex
}

type pRecord struct {
	peer   peer.AddrInfo
	expire int64
}

type StreamWrapper struct {
	network.Stream
	io.ReadWriter
}

// LocalDiscovery is a discovery.Discovery
// https://github.com/libp2p/go-libp2p-core/blob/master/discovery/discovery.go
var _ discovery.Discovery = (*localDiscovery)(nil)

// LocalDiscovery is a network.Notifiee
// https://github.com/libp2p/go-libp2p-core/blob/master/network/notifee.go
var _ network.Notifiee = (*localDiscovery)(nil)

// LocalDiscovery is a Driver
var _ UnregisterDiscovery = (*localDiscovery)(nil)

func NewLocalDiscovery(logger *zap.Logger, host host.Host, rng *mrand.Rand) UnregisterDiscovery {
	ld := &localDiscovery{
		logger:    logger.Named("localDiscovery"),
		host:      host,
		rng:       rng,
		peerCache: make(map[string]*pCache),
	}
	host.Network().Notify(ld)
	host.SetStreamHandler(recProtocolID, ld.handleStream)
	return ld
}

func (ld *localDiscovery) getCache(cid string) (c *pCache, ok bool) {
	ld.peerCacheMux.RLock()
	c, ok = ld.peerCache[cid]
	ld.peerCacheMux.RUnlock()
	return
}

// Delete expired entries of a CID in the peer cache
func (ld *localDiscovery) cleanPeerCache(cid string) {
	currentTime := time.Now().Unix()

	_, ok := ld.getCache(cid)
	if ok {
		ld.peerCacheMux.Lock()
		cache, ok := ld.peerCache[cid]
		if ok {
			cache.mux.Lock()
			for p := range cache.recs {
				expire := cache.recs[p].expire
				if expire < currentTime {
					delete(cache.recs, p)
				}
			}
			cache.mux.Unlock()
			if len(cache.recs) == 0 {
				delete(ld.peerCache, cid)
			}
		}
		ld.peerCacheMux.Unlock()
	}
}

// Update the peer cache
func (ld *localDiscovery) updatePeerCache(cid string, peerID peer.ID, addrInfo peer.AddrInfo, expire int64) {
	cache, ok := ld.getCache(cid)
	if !ok {
		ld.peerCacheMux.Lock()
		cache, ok = ld.peerCache[cid]
		if !ok {
			cache = &pCache{recs: make(map[peer.ID]*pRecord)}
			ld.peerCache[cid] = cache
		}
		ld.peerCacheMux.Unlock()
	}
	cache.mux.Lock()
	cache.recs[peerID] = &pRecord{peer: addrInfo, expire: expire}
	cache.mux.Unlock()
}

// Return the cache size of a cid
func (ld *localDiscovery) peerCacheLen(cid string) (size int) {
	cache, ok := ld.getCache(cid)
	if ok {
		cache.mux.RLock()
		size = len(cache.recs)
		cache.mux.RUnlock()
	}
	return
}

// Delete an entry of the peer cache
func (ld *localDiscovery) deletePeerCacheEntry(cid string, peerID peer.ID) error {
	cache, ok := ld.getCache(cid)
	if ok {
		cache.mux.Lock()
		_, ok := cache.recs[peerID]
		if ok {
			delete(cache.recs, peerID)
		}
		cache.mux.Unlock()
		if len(cache.recs) == 0 {
			ld.peerCacheMux.Lock()
			delete(ld.peerCache, cid)
			ld.peerCacheMux.Unlock()
		}
	} else {
		ld.logger.Error("CID not found from the local peer cache")
		return errors.New("delete failed: CID not found")
	}
	return nil
}

// Implementation of the discovery.Discovery interface
func (ld *localDiscovery) Advertise(ctx context.Context, cid string, opts ...discovery.Option) (time.Duration, error) {
	// Get options
	var options discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return 0, err
	}

	const maxLimit = 1000
	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	ttl := options.Ttl
	var ttlSeconds int

	if ttl == 0 {
		ttlSeconds = 7200
	} else {
		ttlSeconds = int(math.Round(ttl.Seconds()))
	}

	// delete expired entries before adding a new entry
	ld.cleanPeerCache(cid)
	peerCacheLen := ld.peerCacheLen(cid)
	// Discover new records if we don't have enough
	if peerCacheLen < limit {
		currentTime := time.Now().Unix()
		expire := int64(ttlSeconds) + currentTime
		ld.updatePeerCache(cid, ld.host.ID(), ld.host.Peerstore().PeerInfo(ld.host.ID()), expire)
	} else {
		ld.logger.Info("localDiscovery: Advertise limit reached")
	}

	return time.Duration(ttlSeconds) * time.Second, nil
}

// Implementation of the discovery.Discovery interface
// Looking for in the peer cache if there is any peer for that CID
func (ld *localDiscovery) FindPeers(ctx context.Context, cid string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
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

	// Get cached peers
	cache, ok := ld.getCache(cid)
	if !ok {
		// This CID is unknown, so return a empty chan
		chPeer := make(chan peer.AddrInfo)
		close(chPeer)
		return chPeer, nil
	}

	// Remove all expired entries from cache
	ld.cleanPeerCache(cid)

	cache.mux.Lock()
	defer cache.mux.Unlock()

	// Randomize and fill channel with available records
	count := len(cache.recs)
	if limit < count {
		count = limit
	}

	chPeer := make(chan peer.AddrInfo, count)

	ld.rngMux.Lock()
	perm := ld.rng.Perm(len(cache.recs))[0:count]
	ld.rngMux.Unlock()

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

// Implementation of the Driver interface
// Remove the entry from the local peer cache
func (ld *localDiscovery) Unregister(ctx context.Context, cid string) error {
	err := ld.deletePeerCacheEntry(cid, ld.host.ID())
	return err
}

// Implementation of the Driver interface
func (*localDiscovery) Name() string { return "localDiscovery" }

// Implementation of the network.Notifiee interface
// Called when network starts listening on an addr
func (ld *localDiscovery) Listen(network.Network, ma.Multiaddr) {}

// Implementation of the network.Notifiee interface
// Called when network stops listening on an addr
func (ld *localDiscovery) ListenClose(network.Network, ma.Multiaddr) {}

// Implementation of the network.Notifiee interface
// Called when a connection is opened by discovery.Discoverer's FindPeers()
func (ld *localDiscovery) Connected(net network.Network, c network.Conn) {
	ctx := context.Background() // FIXME: since go-libp2p-core@0.8.0 adds support for passed context on new call, we should think if we have a better context to pass here
	go func() {
		// addrfactory in tinder
		if manet.IsPrivateAddr(c.RemoteMultiaddr()) || mafmt.Base(ble.ProtocolCode).Matches(c.RemoteMultiaddr()) || mafmt.Base(mc.ProtocolCode).Matches(c.RemoteMultiaddr()) || mafmt.Base(nearby.ProtocolCode).Matches(c.RemoteMultiaddr()) {
			if err := ld.sendLocalRecord(ctx, c); err != nil {
				return
			}
		}
	}()
}

// Send records only owned by the local peer
func (ld *localDiscovery) sendLocalRecord(ctx context.Context, c network.Conn) error {
	// Open a multiplexed stream
	s, err := c.NewStream(ctx)
	if err != nil {
		ld.logger.Error("localDiscovery: sendLocalRecord", zap.Error(err))
		return err
	}
	lzcon := msmux.NewMSSelect(s, string(recProtocolID))
	sw := &StreamWrapper{
		Stream:     s,
		ReadWriter: lzcon,
	}

	// Fill the protobuf Records struct
	lr := &Records{Records: []*Record{}}
	ld.peerCacheMux.RLock()
	for c := range ld.peerCache {
		ld.peerCache[c].mux.RLock()
		if rec, ok := ld.peerCache[c].recs[ld.host.ID()]; ok {
			record := &Record{Cid: c, Expire: rec.expire}
			lr.Records = append(lr.Records, record)
		}
		ld.peerCache[c].mux.RUnlock()
	}
	ld.peerCacheMux.RUnlock()

	pbw := ggio.NewDelimitedWriter(sw)
	if err := pbw.WriteMsg(lr); err != nil {
		ld.logger.Error("localDiscovery: sendLocalRecord", zap.Error(err))
		return err
	}

	s.Close()

	return nil
}

// Called when is a stream is opened by a remote peer
// Receive remote peer cache and put it in our local cache
func (ld *localDiscovery) handleStream(s network.Stream) {
	pbr := ggio.NewDelimitedReader(s, network.MessageSizeMax)
	for {
		lr := &Records{}
		switch err := pbr.ReadMsg(lr); err {
		case io.EOF:
			s.Close()
			return
		case nil: // do noting, everything fine
		default:
			_ = s.Reset()
			ld.logger.Error("localDiscovery: handleStream: invalid local record", zap.Error(err))
			return
		}

		// fill the remote cache
		for _, rec := range lr.Records {
			ld.logger.Debug("saving remote record in cache",
				logutil.PrivateString("remoteID", s.Conn().RemotePeer().String()),
				logutil.PrivateString("CID", rec.Cid),
				zap.Int64("expire", rec.Expire))
			cache, ok := ld.getCache(rec.Cid)
			if !ok {
				ld.peerCacheMux.Lock()
				cache, ok = ld.peerCache[rec.Cid]
				if !ok {
					cache = &pCache{recs: make(map[peer.ID]*pRecord)}
					ld.peerCache[rec.Cid] = cache
				}
				ld.peerCacheMux.Unlock()
			}
			cache.mux.Lock()
			addrInfo := ld.host.Peerstore().PeerInfo(s.Conn().RemotePeer())
			cache.recs[s.Conn().RemotePeer()] = &pRecord{peer: addrInfo, expire: rec.Expire}
			cache.mux.Unlock()
		}
	}
}

// Implementation of the network.Notifiee interface
// Called when a connection closed
func (ld *localDiscovery) Disconnected(network.Network, network.Conn) {}

// Implementation of the network.Notifiee interface
// Called when a stream opened
func (ld *localDiscovery) OpenedStream(network.Network, network.Stream) {}

// Implementation of the network.Notifiee interface
// Called when a stream closed
func (ld *localDiscovery) ClosedStream(network.Network, network.Stream) {}

// Implementation of the io.ReadWriter interface
func (s *StreamWrapper) Read(b []byte) (int, error) {
	return s.ReadWriter.Read(b)
}

// Implementation of the io.ReadWriter interface
func (s *StreamWrapper) Write(b []byte) (int, error) {
	return s.ReadWriter.Write(b)
}
