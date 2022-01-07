package bertyprotocol

import (
	"context"
	"encoding/hex"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
)

var reOribitDBTopic = regexp.MustCompile(`/orbitdb/\w+/(\w+)_berty_group_(\w+)`)

type groupMonitor struct {
	ctx context.Context

	nhandlers int32

	cEvents   []chan *protocoltypes.MonitorGroup_EventMonitor
	muCEvents sync.RWMutex

	cTopicEvents   map[string][]chan *protocoltypes.MonitorGroup_EventMonitor
	muCTopicEvents sync.RWMutex

	logger *zap.Logger
	host   host.Host
}

func newGroupMonitor(ctx context.Context, logger *zap.Logger, h host.Host) *groupMonitor {
	gm := &groupMonitor{
		logger:       logger,
		cTopicEvents: make(map[string][]chan *protocoltypes.MonitorGroup_EventMonitor),
		cEvents:      []chan *protocoltypes.MonitorGroup_EventMonitor{},
		host:         h,
		ctx:          ctx,
	}

	go gm.monitorGroups(ctx)

	return gm
}

func (g *groupMonitor) Subscribe() (<-chan *protocoltypes.MonitorGroup_EventMonitor, context.CancelFunc) {
	ctx, cancel := context.WithCancel(g.ctx)

	cevent := make(chan *protocoltypes.MonitorGroup_EventMonitor)

	g.muCEvents.Lock()
	g.cEvents = append(g.cEvents, cevent)
	g.muCEvents.Unlock()

	go func() {
		defer cancel()
		<-ctx.Done()

		g.muCEvents.Lock()
		for i, c := range g.cEvents {
			if c == cevent {
				g.cEvents = append(g.cEvents[:i], g.cEvents[i+1:]...)
				break
			}
		}
		g.muCEvents.Unlock()
		close(cevent)
	}()

	return cevent, cancel
}

func (g *groupMonitor) SubscribeTopic(topic string) (<-chan *protocoltypes.MonitorGroup_EventMonitor, context.CancelFunc) {
	ctx, cancel := context.WithCancel(g.ctx)

	cevent := make(chan *protocoltypes.MonitorGroup_EventMonitor)

	g.muCTopicEvents.Lock()
	cc, ok := g.cTopicEvents[topic]

	if !ok {
		cc = []chan *protocoltypes.MonitorGroup_EventMonitor{cevent}
	} else {
		cc = append(cc, cevent)
	}

	g.cTopicEvents[topic] = cc
	g.muCTopicEvents.Unlock()

	go func() {
		defer cancel()
		<-ctx.Done()

		g.muCTopicEvents.Lock()
		cc, ok := g.cTopicEvents[topic]
		if ok {
			for i, c := range cc {
				if c == cevent {
					g.cTopicEvents[topic] = append(cc[:i], cc[i+1:]...)
					break
				}
			}
		}

		close(cevent)
		g.muCTopicEvents.Unlock()
	}()

	return cevent, cancel
}

func (g *groupMonitor) monitorGroups(ctx context.Context) {
	sub, err := g.host.EventBus().Subscribe([]interface{}{
		new(ipfsutil.EvtPubSubTopic),
		new(tinder.EvtDriverMonitor),
	})

	if err != nil {
		g.logger.Error("failed to init group monitor", zap.Error(err))
		return
	}

	// @FIXME(gfanton): cached found peers should be done inside driver monitor
	cachedFoundPeers := make(map[peer.ID]ipfsutil.Multiaddrs)
	for {

		var evt interface{}
		select {
		case <-ctx.Done():
			return
		case evt = <-sub.Out():
		}

		var monitorEvent *protocoltypes.MonitorGroup_EventMonitor
		var topic string

		switch e := evt.(type) {
		case ipfsutil.EvtPubSubTopic:
			// trim floodsub topic (if present)
			topic = strings.TrimPrefix(e.Topic, "floodsub:")

			// handle this event
			monitorEvent = g.monitorHandlePubsubEvent(topic, &e)
		case tinder.EvtDriverMonitor:
			// trim floodsub topic (if present)
			topic = strings.TrimPrefix(e.Topic, "floodsub:")

			// check if we already know this peer in case of found peer
			newMS := ipfsutil.NewMultiaddrs(e.AddrInfo.Addrs)
			if ms, ok := cachedFoundPeers[e.AddrInfo.ID]; ok {
				if ipfsutil.MultiaddrIsEqual(ms, newMS) {
					continue
				}
			}

			cachedFoundPeers[e.AddrInfo.ID] = newMS
			monitorEvent = g.monitorHandleDiscoveryEvent(topic, &e)
		default:
			// skip unknown event
			continue
		}

		go g.dispatch(topic, monitorEvent)
	}
}

func (g *groupMonitor) dispatch(topic string, evt *protocoltypes.MonitorGroup_EventMonitor) {
	if n := atomic.AddInt32(&g.nhandlers, 1); n > 10 {
		g.logger.Warn("potentially undrained channel", zap.Int32("handlers", n))
	}

	g.muCEvents.RLock()
	for _, c := range g.cEvents {
		c <- evt
	}
	g.muCEvents.RUnlock()

	g.muCTopicEvents.RLock()
	if cc, ok := g.cTopicEvents[topic]; ok {
		for _, c := range cc {
			c <- evt
		}
	}
	g.muCTopicEvents.RUnlock()

	atomic.AddInt32(&g.nhandlers, ^int32(0))
}

func (g *groupMonitor) monitorHandlePubsubEvent(topic string, e *ipfsutil.EvtPubSubTopic) *protocoltypes.MonitorGroup_EventMonitor {
	var m protocoltypes.MonitorGroup_EventMonitor

	switch e.EventType {
	case ipfsutil.TypeEventMonitorPeerJoined:
		m.Type = protocoltypes.TypeEventMonitorPeerJoin
		m.PeerJoin = &protocoltypes.MonitorGroup_EventMonitorPeerJoin{}

		activeConns := g.host.Network().ConnsToPeer(e.PeerID)
		m.PeerJoin.Topic = topic
		m.PeerJoin.PeerID = e.PeerID.String()
		m.PeerJoin.IsSelf = e.PeerID == g.host.ID()
		m.PeerJoin.Maddrs = make([]string, len(activeConns))
		for i, conn := range activeConns {
			m.PeerJoin.Maddrs[i] = conn.RemoteMultiaddr().String()
		}

		if !m.PeerJoin.IsSelf {
			if key, ok := MatchOrbitdbTopic(topic); ok {
				g.logger.Debug("group peer joined", zap.String("category", "pubsub"),
					zap.String("topic", key),
					zap.String("peer", m.PeerJoin.PeerID),
					zap.Strings("conns", m.PeerJoin.Maddrs))
			}
		}

	case ipfsutil.TypeEventMonitorPeerLeaved:
		m.Type = protocoltypes.TypeEventMonitorPeerLeave
		m.PeerLeave = &protocoltypes.MonitorGroup_EventMonitorPeerLeave{}

		m.PeerLeave.Topic = topic
		m.PeerLeave.PeerID = e.PeerID.String()
		m.PeerLeave.IsSelf = e.PeerID == g.host.ID()

		if !m.PeerLeave.IsSelf {
			if key, ok := MatchOrbitdbTopic(topic); ok {
				g.logger.Debug("group peer leaved", zap.String("category", "pubsub"),
					zap.String("topic", key),
					zap.String("peer", m.PeerLeave.PeerID))
			}
		}

	default:
		m.Type = protocoltypes.TypeEventMonitorUndefined
	}

	return &m
}

func (g *groupMonitor) monitorHandleDiscoveryEvent(topic string, e *tinder.EvtDriverMonitor) *protocoltypes.MonitorGroup_EventMonitor {
	var m protocoltypes.MonitorGroup_EventMonitor

	switch e.EventType {
	case tinder.TypeEventMonitorAdvertise, tinder.TypeEventMonitorDriverAdvertise:
		m.Type = protocoltypes.TypeEventMonitorAdvertiseGroup
		m.AdvertiseGroup = &protocoltypes.MonitorGroup_EventMonitorAdvertiseGroup{}

		m.AdvertiseGroup.Topic = topic
		m.AdvertiseGroup.PeerID = e.AddrInfo.ID.String()
		m.AdvertiseGroup.DriverName = e.DriverName // empty if e == tinder.TypeEventMonitorAdvertise
		m.AdvertiseGroup.Maddrs = make([]string, len(e.AddrInfo.Addrs))
		for i, addr := range e.AddrInfo.Addrs {
			m.AdvertiseGroup.Maddrs[i] = addr.String()
		}

		if key, ok := MatchOrbitdbTopic(topic); ok {
			g.logger.Debug("group advertise", zap.String("category", "tinder"),
				zap.String("topic", key),
				zap.String("peer", m.AdvertiseGroup.PeerID),
				zap.String("driver", m.AdvertiseGroup.DriverName),
				zap.Strings("addrs", m.AdvertiseGroup.Maddrs),
			)
		}

	case tinder.TypeEventMonitorFoundPeer, tinder.TypeEventMonitorDriverFoundPeer:
		m.Type = protocoltypes.TypeEventMonitorPeerFound
		m.PeerFound = &protocoltypes.MonitorGroup_EventMonitorPeerFound{}

		m.PeerFound.Topic = topic
		m.PeerFound.PeerID = e.AddrInfo.ID.String()
		m.PeerFound.DriverName = e.DriverName // empty if e == tinder.TypeEventMonitorFoundPeer
		m.PeerFound.Maddrs = make([]string, len(e.AddrInfo.Addrs))
		for i, addr := range e.AddrInfo.Addrs {
			m.PeerFound.Maddrs[i] = addr.String()
		}

		if isSelf := e.AddrInfo.ID == g.host.ID(); !isSelf {
			if key, ok := MatchOrbitdbTopic(topic); ok {
				g.logger.Debug("group peer found", zap.String("category", "tinder"),
					zap.String("topic", key),
					zap.String("peer", m.PeerFound.PeerID),
					zap.String("driver", m.PeerFound.DriverName),
					zap.Strings("maddrs", m.PeerFound.Maddrs),
				)
			}
		}
	default:
		m.Type = protocoltypes.TypeEventMonitorUndefined
	}

	return &m
}

func MatchOrbitdbTopic(topic string) (key string, ok bool) {
	matchs := reOribitDBTopic.FindStringSubmatch(topic)
	if ok = len(matchs) == 3 && matchs[1] != "" && matchs[2] != ""; !ok {
		return
	}

	switch matchs[2] {
	case "messages", "metadata":
		key = matchs[1] + ":" + matchs[2]
	default:
		key = matchs[1] + ":" + "undefined"
	}

	return
}

func formatTopic(topic string) string {
	// @NOTE(gfanton): maybe we should shortened topic
	// return fmt.Sprintf("g(%s*%s)", topic[:3], topic[len(topic)-3:])
	return hex.EncodeToString([]byte(topic))
}
