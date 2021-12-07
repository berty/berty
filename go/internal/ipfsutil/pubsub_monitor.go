package ipfsutil

import (
	"sync"

	"github.com/libp2p/go-libp2p-core/event"
	host "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	ps "github.com/libp2p/go-libp2p-pubsub"
	ps_pb "github.com/libp2p/go-libp2p-pubsub/pb"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

// PubsubMonitor is an EventTracer
var _ ps.EventTracer = (*PubsubMonitor)(nil)

type EventMonitor int

const (
	TypeEventMonitorPeerUnknown EventMonitor = iota
	TypeEventMonitorPeerJoined
	TypeEventMonitorPeerLeft
)

type EventTracer interface {
	EventTracerOption() ps.Option
}

type EvtPubSubTopic struct {
	EventType EventMonitor
	Topic     string
	PeerID    peer.ID
}

type PubsubMonitor struct {
	logger  *zap.Logger
	h       host.Host
	ps      *ps.PubSub
	emitter event.Emitter

	muPeersTopics sync.Mutex
	peersTopics   map[peer.ID][]string
}

func NewPubsubMonitor(l *zap.Logger, h host.Host) (EventTracer, error) {
	emitter, err := h.EventBus().Emitter(new(EvtPubSubTopic))
	if err != nil {
		return nil, err
	}
	return &PubsubMonitor{
		h:           h,
		logger:      l,
		emitter:     emitter,
		peersTopics: make(map[peer.ID][]string),
	}, nil
}

func (pt *PubsubMonitor) EventTracerOption() ps.Option {
	return func(p *ps.PubSub) error {
		pt.ps = p
		return ps.WithEventTracer(pt)(p)
	}
}

func (pt *PubsubMonitor) Trace(e *ps_pb.TraceEvent) {
	switch e.GetType() {
	case ps_pb.TraceEvent_JOIN:
		topic := e.GetJoin().GetTopic()
		peer := pt.h.ID()
		pt.Emit(&EvtPubSubTopic{
			EventType: TypeEventMonitorPeerJoined,
			Topic:     topic,
			PeerID:    peer,
		})

	case ps_pb.TraceEvent_LEAVE:
		topic := e.GetLeave().GetTopic()
		peer := pt.h.ID()
		pt.Emit(&EvtPubSubTopic{
			EventType: TypeEventMonitorPeerLeft,
			Topic:     topic,
			PeerID:    peer,
		})

	case ps_pb.TraceEvent_REMOVE_PEER:
		peerid, err := peer.IDFromBytes(e.GetRemovePeer().GetPeerID())
		if err != nil {
			pt.logger.Warn("unable to parse peerid",
				zap.String("type", e.GetType().String()),
				logutil.PrivateString("topic", e.GetGraft().GetTopic()))
			return
		}

		topics := pt.popTopicFromPeer(peerid)
		for _, topic := range topics {
			pt.Emit(&EvtPubSubTopic{
				EventType: TypeEventMonitorPeerLeft,
				Topic:     topic,
				PeerID:    peerid,
			})
		}

	case ps_pb.TraceEvent_GRAFT:
		topic := e.GetGraft().GetTopic()
		peerid, err := peer.IDFromBytes(e.GetGraft().GetPeerID())
		if err != nil {
			pt.logger.Warn("unable to parse peerid",
				zap.String("type", e.GetType().String()),
				logutil.PrivateString("topic", e.GetGraft().GetTopic()))
			return
		}

		pt.addTopicToPeer(peerid, topic)
		pt.Emit(&EvtPubSubTopic{
			EventType: TypeEventMonitorPeerJoined,
			Topic:     topic,
			PeerID:    peerid,
		})

	case ps_pb.TraceEvent_PRUNE:
		// @FIXME(gfanton): send this info as well
	}
}

func (pt *PubsubMonitor) Emit(e *EvtPubSubTopic) {
	if err := pt.emitter.Emit(*e); err != nil {
		pt.logger.Warn("unable to emit pubsub event")
	}
}

func (pt *PubsubMonitor) popTopicFromPeer(p peer.ID) []string {
	pt.muPeersTopics.Lock()
	defer pt.muPeersTopics.Unlock()

	if topics, ok := pt.peersTopics[p]; ok {
		delete(pt.peersTopics, p)
		return topics
	}

	return []string{}
}

func (pt *PubsubMonitor) addTopicToPeer(p peer.ID, ns string) {
	pt.muPeersTopics.Lock()

	topics, ok := pt.peersTopics[p]
	if !ok {
		topics = make([]string, 0)
	}
	pt.peersTopics[p] = append(topics, ns)

	pt.muPeersTopics.Unlock()
}
