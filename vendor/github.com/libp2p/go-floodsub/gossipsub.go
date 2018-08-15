package floodsub

import (
	"context"
	"math/rand"
	"time"

	pb "github.com/libp2p/go-floodsub/pb"

	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	protocol "github.com/libp2p/go-libp2p-protocol"
)

const (
	GossipSubID = protocol.ID("/meshsub/1.0.0")
)

var (
	// overlay parameters
	GossipSubD   = 6
	GossipSubDlo = 4
	GossipSubDhi = 12

	// gossip parameters
	GossipSubHistoryLength = 5
	GossipSubHistoryGossip = 3

	// heartbeat interval
	GossipSubHeartbeatInterval = 1 * time.Second

	// fanout ttl
	GossipSubFanoutTTL = 60 * time.Second
)

// NewGossipSub returns a new PubSub object using GossipSubRouter as the router
func NewGossipSub(ctx context.Context, h host.Host, opts ...Option) (*PubSub, error) {
	rt := &GossipSubRouter{
		peers:   make(map[peer.ID]protocol.ID),
		mesh:    make(map[string]map[peer.ID]struct{}),
		fanout:  make(map[string]map[peer.ID]struct{}),
		lastpub: make(map[string]int64),
		gossip:  make(map[peer.ID][]*pb.ControlIHave),
		control: make(map[peer.ID]*pb.ControlMessage),
		mcache:  NewMessageCache(GossipSubHistoryGossip, GossipSubHistoryLength),
	}
	return NewPubSub(ctx, h, rt, opts...)
}

// GossipSubRouter is a router that implements the gossipsub protocol.
// For each topic we have joined, we maintain an overlay through which
// messages flow; this is the mesh map.
// For each topic we publish to without joining, we maintain a list of peers
// to use for injecting our messages in the overlay with stable routes; this
// is the fanout map. Fanout peer lists are expired if we don't publish any
// messages to their topic for GossipSubFanoutTTL.
type GossipSubRouter struct {
	p       *PubSub
	peers   map[peer.ID]protocol.ID         // peer protocols
	mesh    map[string]map[peer.ID]struct{} // topic meshes
	fanout  map[string]map[peer.ID]struct{} // topic fanout
	lastpub map[string]int64                // last pubish time for fanout topics
	gossip  map[peer.ID][]*pb.ControlIHave  // pending gossip
	control map[peer.ID]*pb.ControlMessage  // pending control messages
	mcache  *MessageCache
}

func (gs *GossipSubRouter) Protocols() []protocol.ID {
	return []protocol.ID{GossipSubID, FloodSubID}
}

func (gs *GossipSubRouter) Attach(p *PubSub) {
	gs.p = p
	go gs.heartbeatTimer()
}

func (gs *GossipSubRouter) AddPeer(p peer.ID, proto protocol.ID) {
	gs.peers[p] = proto
}

func (gs *GossipSubRouter) RemovePeer(p peer.ID) {
	delete(gs.peers, p)
	for _, peers := range gs.mesh {
		delete(peers, p)
	}
	for _, peers := range gs.fanout {
		delete(peers, p)
	}
	delete(gs.gossip, p)
	delete(gs.control, p)
}

func (gs *GossipSubRouter) HandleRPC(rpc *RPC) {
	ctl := rpc.GetControl()
	if ctl == nil {
		return
	}

	iwant := gs.handleIHave(ctl)
	ihave := gs.handleIWant(ctl)
	prune := gs.handleGraft(rpc.from, ctl)
	gs.handlePrune(rpc.from, ctl)

	if len(iwant) == 0 && len(ihave) == 0 && len(prune) == 0 {
		return
	}

	out := rpcWithControl(ihave, nil, iwant, nil, prune)
	gs.sendRPC(rpc.from, out)
}

func (gs *GossipSubRouter) handleIHave(ctl *pb.ControlMessage) []*pb.ControlIWant {
	iwant := make(map[string]struct{})

	for _, ihave := range ctl.GetIhave() {
		topic := ihave.GetTopicID()
		_, ok := gs.mesh[topic]
		if !ok {
			continue
		}

		for _, mid := range ihave.GetMessageIDs() {
			if gs.p.seenMessage(mid) {
				continue
			}
			iwant[mid] = struct{}{}
		}
	}

	if len(iwant) == 0 {
		return nil
	}

	iwantlst := make([]string, 0, len(iwant))
	for mid := range iwant {
		iwantlst = append(iwantlst, mid)
	}

	return []*pb.ControlIWant{&pb.ControlIWant{MessageIDs: iwantlst}}
}

func (gs *GossipSubRouter) handleIWant(ctl *pb.ControlMessage) []*pb.Message {
	ihave := make(map[string]*pb.Message)
	for _, iwant := range ctl.GetIwant() {
		for _, mid := range iwant.GetMessageIDs() {
			msg, ok := gs.mcache.Get(mid)
			if ok {
				ihave[mid] = msg
			}
		}
	}

	if len(ihave) == 0 {
		return nil
	}

	msgs := make([]*pb.Message, 0, len(ihave))
	for _, msg := range ihave {
		msgs = append(msgs, msg)
	}

	return msgs
}

func (gs *GossipSubRouter) handleGraft(p peer.ID, ctl *pb.ControlMessage) []*pb.ControlPrune {
	var prune []string
	for _, graft := range ctl.GetGraft() {
		topic := graft.GetTopicID()
		peers, ok := gs.mesh[topic]
		if !ok {
			prune = append(prune, topic)
		} else {
			peers[p] = struct{}{}
		}
	}

	if len(prune) == 0 {
		return nil
	}

	cprune := make([]*pb.ControlPrune, 0, len(prune))
	for _, topic := range prune {
		cprune = append(cprune, &pb.ControlPrune{TopicID: &topic})
	}

	return cprune
}

func (gs *GossipSubRouter) handlePrune(p peer.ID, ctl *pb.ControlMessage) {
	for _, prune := range ctl.GetPrune() {
		topic := prune.GetTopicID()
		peers, ok := gs.mesh[topic]
		if ok {
			delete(peers, p)
		}
	}
}

func (gs *GossipSubRouter) Publish(from peer.ID, msg *pb.Message) {
	gs.mcache.Put(msg)

	tosend := make(map[peer.ID]struct{})
	for _, topic := range msg.GetTopicIDs() {
		// any peers in the topic?
		tmap, ok := gs.p.topics[topic]
		if !ok {
			continue
		}

		// floodsub peers
		for p := range tmap {
			if gs.peers[p] == FloodSubID {
				tosend[p] = struct{}{}
			}
		}

		// gossipsub peers
		gmap, ok := gs.mesh[topic]
		if !ok {
			// we are not in the mesh for topic, use fanout peers
			gmap, ok = gs.fanout[topic]
			if !ok {
				// we don't have any, pick some
				peers := gs.getPeers(topic, GossipSubD, func(peer.ID) bool { return true })

				if len(peers) > 0 {
					gmap = peerListToMap(peers)
					gs.fanout[topic] = gmap
				}
			}
			gs.lastpub[topic] = time.Now().UnixNano()
		}

		for p := range gmap {
			tosend[p] = struct{}{}
		}
	}

	out := rpcWithMessages(msg)
	for pid := range tosend {
		if pid == from || pid == peer.ID(msg.GetFrom()) {
			continue
		}

		gs.sendRPC(pid, out)
	}
}

func (gs *GossipSubRouter) Join(topic string) {
	gmap, ok := gs.mesh[topic]
	if ok {
		return
	}

	gmap, ok = gs.fanout[topic]
	if ok {
		gs.mesh[topic] = gmap
		delete(gs.fanout, topic)
		delete(gs.lastpub, topic)
	} else {
		peers := gs.getPeers(topic, GossipSubD, func(peer.ID) bool { return true })
		gmap = peerListToMap(peers)
		gs.mesh[topic] = gmap
	}

	for p := range gmap {
		gs.sendGraft(p, topic)
	}
}

func (gs *GossipSubRouter) Leave(topic string) {
	gmap, ok := gs.mesh[topic]
	if !ok {
		return
	}

	delete(gs.mesh, topic)

	for p := range gmap {
		gs.sendPrune(p, topic)
	}
}

func (gs *GossipSubRouter) sendGraft(p peer.ID, topic string) {
	graft := []*pb.ControlGraft{&pb.ControlGraft{TopicID: &topic}}
	out := rpcWithControl(nil, nil, nil, graft, nil)
	gs.sendRPC(p, out)
}

func (gs *GossipSubRouter) sendPrune(p peer.ID, topic string) {
	prune := []*pb.ControlPrune{&pb.ControlPrune{TopicID: &topic}}
	out := rpcWithControl(nil, nil, nil, nil, prune)
	gs.sendRPC(p, out)
}

func (gs *GossipSubRouter) sendRPC(p peer.ID, out *RPC) {
	// piggyback cotrol message retries
	ctl, ok := gs.control[p]
	if ok {
		gs.piggybackControl(p, out, ctl)
		delete(gs.control, p)
	}

	// piggyback gossip
	ihave, ok := gs.gossip[p]
	if ok {
		gs.piggybackGossip(p, out, ihave)
		delete(gs.gossip, p)
	}

	mch, ok := gs.p.peers[p]
	if !ok {
		return
	}

	select {
	case mch <- out:
	default:
		log.Infof("dropping message to peer %s: queue full", p)
		// push control messages that need to be retried
		ctl := out.GetControl()
		if ctl != nil {
			gs.pushControl(p, ctl)
		}
	}
}

func (gs *GossipSubRouter) heartbeatTimer() {
	ticker := time.NewTicker(GossipSubHeartbeatInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			select {
			case gs.p.eval <- gs.heartbeat:
			case <-gs.p.ctx.Done():
				return
			}
		case <-gs.p.ctx.Done():
			return
		}
	}
}

func (gs *GossipSubRouter) heartbeat() {
	// flush pending control message from retries and gossip
	// that hasn't been piggybacked since the last heartbeat
	gs.flush()

	tograft := make(map[peer.ID][]string)
	toprune := make(map[peer.ID][]string)

	// maintain the mesh for topics we have joined
	for topic, peers := range gs.mesh {

		// do we have enough peers?
		if len(peers) < GossipSubDlo {
			ineed := GossipSubD - len(peers)
			plst := gs.getPeers(topic, ineed, func(p peer.ID) bool {
				// filter our current peers
				_, ok := peers[p]
				return !ok
			})

			for _, p := range plst {
				peers[p] = struct{}{}
				topics := tograft[p]
				tograft[p] = append(topics, topic)
			}
		}

		// do we have too many peers?
		if len(peers) > GossipSubDhi {
			idontneed := len(peers) - GossipSubD
			plst := peerMapToList(peers)
			shufflePeers(plst)

			for _, p := range plst[:idontneed] {
				delete(peers, p)
				topics := toprune[p]
				toprune[p] = append(topics, topic)
			}
		}

		gs.emitGossip(topic, peers)
	}

	// expire fanout for topics we haven't published to in a while
	now := time.Now().UnixNano()
	for topic, lastpub := range gs.lastpub {
		if lastpub+int64(GossipSubFanoutTTL) < now {
			delete(gs.fanout, topic)
			delete(gs.lastpub, topic)
		}
	}

	// maintain our fanout for topics we are publishing but we have not joined
	for topic, peers := range gs.fanout {
		// check whether our peers are still in the topic
		for p := range peers {
			_, ok := gs.p.topics[topic][p]
			if !ok {
				delete(peers, p)
			}
		}

		// do we need more peers?
		if len(peers) < GossipSubD {
			ineed := GossipSubD - len(peers)
			plst := gs.getPeers(topic, ineed, func(p peer.ID) bool {
				// filter our current peers
				_, ok := peers[p]
				return !ok
			})

			for _, p := range plst {
				peers[p] = struct{}{}
			}
		}

		gs.emitGossip(topic, peers)
	}

	// send coalesced GRAFT/PRUNE messages (will piggyback gossip)
	gs.sendGraftPrune(tograft, toprune)

	// advance the message history window
	gs.mcache.Shift()
}

func (gs *GossipSubRouter) sendGraftPrune(tograft, toprune map[peer.ID][]string) {
	for p, topics := range tograft {
		graft := make([]*pb.ControlGraft, 0, len(topics))
		for _, topic := range topics {
			graft = append(graft, &pb.ControlGraft{TopicID: &topic})
		}

		var prune []*pb.ControlPrune
		pruning, ok := toprune[p]
		if ok {
			delete(toprune, p)
			prune = make([]*pb.ControlPrune, 0, len(pruning))
			for _, topic := range pruning {
				prune = append(prune, &pb.ControlPrune{TopicID: &topic})
			}
		}

		out := rpcWithControl(nil, nil, nil, graft, prune)
		gs.sendRPC(p, out)
	}

	for p, topics := range toprune {
		prune := make([]*pb.ControlPrune, 0, len(topics))
		for _, topic := range topics {
			prune = append(prune, &pb.ControlPrune{TopicID: &topic})
		}

		out := rpcWithControl(nil, nil, nil, nil, prune)
		gs.sendRPC(p, out)
	}

}

func (gs *GossipSubRouter) emitGossip(topic string, peers map[peer.ID]struct{}) {
	mids := gs.mcache.GetGossipIDs(topic)
	if len(mids) == 0 {
		return
	}

	gpeers := gs.getPeers(topic, GossipSubD, func(peer.ID) bool { return true })
	for _, p := range gpeers {
		// skip mesh peers
		_, ok := peers[p]
		if !ok {
			gs.pushGossip(p, &pb.ControlIHave{TopicID: &topic, MessageIDs: mids})
		}
	}
}

func (gs *GossipSubRouter) flush() {
	// send gossip first, which will also piggyback control
	for p, ihave := range gs.gossip {
		delete(gs.gossip, p)
		out := rpcWithControl(nil, ihave, nil, nil, nil)
		gs.sendRPC(p, out)
	}

	// send the remaining control messages
	for p, ctl := range gs.control {
		delete(gs.control, p)
		out := rpcWithControl(nil, nil, nil, ctl.Graft, ctl.Prune)
		gs.sendRPC(p, out)
	}
}

func (gs *GossipSubRouter) pushGossip(p peer.ID, ihave *pb.ControlIHave) {
	gossip := gs.gossip[p]
	gossip = append(gossip, ihave)
	gs.gossip[p] = gossip
}

func (gs *GossipSubRouter) piggybackGossip(p peer.ID, out *RPC, ihave []*pb.ControlIHave) {
	ctl := out.GetControl()
	if ctl == nil {
		ctl = &pb.ControlMessage{}
		out.Control = ctl
	}

	ctl.Ihave = ihave
}

func (gs *GossipSubRouter) pushControl(p peer.ID, ctl *pb.ControlMessage) {
	// remove IHAVE/IWANT from control message, gossip is not retried
	ctl.Ihave = nil
	ctl.Iwant = nil
	if ctl.Graft != nil || ctl.Prune != nil {
		gs.control[p] = ctl
	}
}

func (gs *GossipSubRouter) piggybackControl(p peer.ID, out *RPC, ctl *pb.ControlMessage) {
	// check control message for staleness first
	var tograft []*pb.ControlGraft
	var toprune []*pb.ControlPrune

	for _, graft := range ctl.GetGraft() {
		topic := graft.GetTopicID()
		peers, ok := gs.mesh[topic]
		if !ok {
			continue
		}
		_, ok = peers[p]
		if ok {
			tograft = append(tograft, graft)
		}
	}

	for _, prune := range ctl.GetPrune() {
		topic := prune.GetTopicID()
		peers, ok := gs.mesh[topic]
		if !ok {
			toprune = append(toprune, prune)
			continue
		}
		_, ok = peers[p]
		if !ok {
			toprune = append(toprune, prune)
		}
	}

	if len(tograft) == 0 && len(toprune) == 0 {
		return
	}

	xctl := out.Control
	if xctl == nil {
		xctl = &pb.ControlMessage{}
		out.Control = xctl
	}

	if len(tograft) > 0 {
		xctl.Graft = append(xctl.Graft, tograft...)
	}
	if len(toprune) > 0 {
		xctl.Prune = append(xctl.Prune, toprune...)
	}
}

func (gs *GossipSubRouter) getPeers(topic string, count int, filter func(peer.ID) bool) []peer.ID {
	tmap, ok := gs.p.topics[topic]
	if !ok {
		return nil
	}

	peers := make([]peer.ID, 0, len(tmap))
	for p := range tmap {
		if gs.peers[p] == GossipSubID && filter(p) {
			peers = append(peers, p)
		}
	}

	shufflePeers(peers)

	if count > 0 && len(peers) > count {
		peers = peers[:count]
	}

	return peers
}

func peerListToMap(peers []peer.ID) map[peer.ID]struct{} {
	pmap := make(map[peer.ID]struct{})
	for _, p := range peers {
		pmap[p] = struct{}{}
	}
	return pmap
}

func peerMapToList(peers map[peer.ID]struct{}) []peer.ID {
	plst := make([]peer.ID, 0, len(peers))
	for p := range peers {
		plst = append(plst, p)
	}
	return plst
}

func shufflePeers(peers []peer.ID) {
	for i := range peers {
		j := rand.Intn(i + 1)
		peers[i], peers[j] = peers[j], peers[i]
	}
}
