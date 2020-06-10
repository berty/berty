package tinder

import (
	"context"
	"io"
	"math"
	mrand "math/rand"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/protocol"
	"go.uber.org/zap"

	mcma "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/multiaddr"
	ggio "github.com/gogo/protobuf/io"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
	msmux "github.com/multiformats/go-multistream"
)

const recProtocolID = protocol.ID("berty/p2p/localrecord")

type localDiscovery struct {
	logger             *zap.Logger
	host               host.Host
	localPeerCache     map[string]int64
	remotePeerCache    map[string]*pCache
	localPeerCacheMux  sync.RWMutex
	remotePeerCacheMux sync.RWMutex
	rng                *mrand.Rand
	rngMux             sync.Mutex
}

type pCache struct {
	recs map[peer.ID]*pRecord
	mux  sync.Mutex
}

type pRecord struct {
	peer   peer.AddrInfo
	expire int64
}

type StreamWrapper struct {
	network.Stream
	io.ReadWriter
}

func NewLocalDiscovery(logger *zap.Logger, host host.Host, rng *mrand.Rand) Driver {
	ld := &localDiscovery{
		logger:          logger.Named("tinder/localDiscovery"),
		host:            host,
		rng:             rng,
		localPeerCache:  make(map[string]int64),
		remotePeerCache: make(map[string]*pCache),
	}
	host.Network().Notify(ld)
	host.SetStreamHandler(recProtocolID, ld.handleStream)
	return ld
}

func (ld *localDiscovery) Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error) {
	ld.logger.Debug("localDiscovery: Advertise", zap.String("CID", ns))
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

	ld.localPeerCacheMux.Lock()
	defer ld.localPeerCacheMux.Unlock()

	currentTime := time.Now().Unix()
	newCacheSize := len(ld.localPeerCache)

	// Remove all expired entries from cache
	for p := range ld.localPeerCache {
		expire := ld.localPeerCache[p]
		if expire < currentTime {
			newCacheSize--
			delete(ld.localPeerCache, p)
		}
	}

	// Discover new records if we don't have enough
	if newCacheSize < limit {
		ld.localPeerCache[ns] = int64(ttlSeconds) + currentTime
	} else {
		ld.logger.Info("localDiscovery: Advertise limit reached")
	}

	return time.Duration(ttlSeconds), nil
}

func (ld *localDiscovery) FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
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
	var cache *pCache

	ld.remotePeerCacheMux.RLock()
	cache, ok := ld.remotePeerCache[ns]
	ld.remotePeerCacheMux.RUnlock()
	if !ok {
		ld.remotePeerCacheMux.Lock()
		cache, ok = ld.remotePeerCache[ns]
		if !ok {
			cache = &pCache{recs: make(map[peer.ID]*pRecord)}
			ld.remotePeerCache[ns] = cache
		}
		ld.remotePeerCacheMux.Unlock()
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

	// Randomize and fill channel with available records
	count := len(cache.recs)
	if limit < count {
		count = limit
	}

	ld.logger.Debug("localDiscovery: FindPeers", zap.String("CID", ns), zap.Int("count", count))

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

// Remove the entry from the local peer cache
func (ld *localDiscovery) Unregister(ctx context.Context, ns string) error {
	ld.localPeerCacheMux.Lock()
	defer ld.localPeerCacheMux.Unlock()

	_, ok := ld.localPeerCache[ns]
	if !ok {
		ld.logger.Error("CID not found from the local peer cache")
		// TODO: should return an error?
	} else {
		delete(ld.localPeerCache, ns)
	}
	return nil
}

func (*localDiscovery) Name() string { return "localDiscovery" }

// called when network starts listening on an addr
func (ld *localDiscovery) Listen(network.Network, ma.Multiaddr) {}

// called when network stops listening on an addr
func (ld *localDiscovery) ListenClose(network.Network, ma.Multiaddr) {}

// called when a connection is opened by discovery.Discoverer's FindPeers()
func (ld *localDiscovery) Connected(net network.Network, c network.Conn) {
	go func() {
		if manet.IsPrivateAddr(c.RemoteMultiaddr()) || mcma.MC.Matches(c.RemoteMultiaddr()) {
			if err := ld.sendLocalRecord(c); err != nil {
				return
			}
		}
	}()
}

func (ld *localDiscovery) sendLocalRecord(c network.Conn) error {
	// Open a multiplexed stream
	s, err := c.NewStream()
	if err != nil {
		ld.logger.Error("localDiscovery: sendLocalRecord", zap.Error(err))
		return err
	}
	lzcon := msmux.NewMSSelect(s, string(recProtocolID))
	sw := &StreamWrapper{
		Stream:     s,
		ReadWriter: lzcon,
	}

	ld.localPeerCacheMux.RLock()
	defer ld.localPeerCacheMux.RUnlock()

	lr := &LocalRecord{Records: ld.localPeerCache}
	pbw := ggio.NewDelimitedWriter(sw)
	if err := pbw.WriteMsg(lr); err != nil {
		ld.logger.Error("localDiscovery: sendLocalRecord", zap.Error(err))
		return err
	}

	s.Close()

	return nil
}

// called when is a stream is opened by a remote peer
func (ld *localDiscovery) handleStream(s network.Stream) {
	pbr := ggio.NewDelimitedReader(s, network.MessageSizeMax)
	for {
		lr := &LocalRecord{}
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
		for rec := range lr.Records {
			ld.logger.Debug("saving remote record in cache",
				zap.String("remoteID", s.Conn().RemotePeer().String()),
				zap.String("CID", rec),
				zap.Int64("expire", lr.Records[rec]))
			ld.remotePeerCacheMux.RLock()
			cache, ok := ld.remotePeerCache[rec]
			ld.remotePeerCacheMux.RUnlock()
			if !ok {
				ld.remotePeerCacheMux.Lock()
				cache, ok = ld.remotePeerCache[rec]
				if !ok {
					cache = &pCache{recs: make(map[peer.ID]*pRecord)}
					ld.remotePeerCache[rec] = cache
				}
				ld.remotePeerCacheMux.Unlock()
			}
			cache.mux.Lock()
			addrInfo := ld.host.Peerstore().PeerInfo(s.Conn().RemotePeer())
			cache.recs[s.Conn().RemotePeer()] = &pRecord{peer: addrInfo, expire: lr.Records[rec]}
			cache.mux.Unlock()
		}
	}
}

// called when a connection closed
func (ld *localDiscovery) Disconnected(network.Network, network.Conn) {}

// called when a stream opened
func (ld *localDiscovery) OpenedStream(network.Network, network.Stream) {}

// called when a stream closed
func (ld *localDiscovery) ClosedStream(network.Network, network.Stream) {}

func (s *StreamWrapper) Read(b []byte) (int, error) {
	return s.ReadWriter.Read(b)
}

func (s *StreamWrapper) Write(b []byte) (int, error) {
	return s.ReadWriter.Write(b)
}
