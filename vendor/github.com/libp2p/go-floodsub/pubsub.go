package floodsub

import (
	"context"
	"encoding/binary"
	"fmt"
	"math/rand"
	"sync/atomic"
	"time"

	pb "github.com/libp2p/go-floodsub/pb"

	logging "github.com/ipfs/go-log"
	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	protocol "github.com/libp2p/go-libp2p-protocol"
	timecache "github.com/whyrusleeping/timecache"
)

const (
	defaultValidateTimeout     = 150 * time.Millisecond
	defaultValidateConcurrency = 100
	defaultValidateThrottle    = 8192
)

var log = logging.Logger("pubsub")

type PubSub struct {
	// atomic counter for seqnos
	// NOTE: Must be declared at the top of the struct as we perform atomic
	// operations on this field.
	//
	// See: https://golang.org/pkg/sync/atomic/#pkg-note-BUG
	counter uint64

	host host.Host

	rt PubSubRouter

	// incoming messages from other peers
	incoming chan *RPC

	// messages we are publishing out to our peers
	publish chan *Message

	// addSub is a control channel for us to add and remove subscriptions
	addSub chan *addSubReq

	// get list of topics we are subscribed to
	getTopics chan *topicReq

	// get chan of peers we are connected to
	getPeers chan *listPeerReq

	// send subscription here to cancel it
	cancelCh chan *Subscription

	// a notification channel for incoming streams from other peers
	newPeers chan inet.Stream

	// a notification channel for when our peers die
	peerDead chan peer.ID

	// The set of topics we are subscribed to
	myTopics map[string]map[*Subscription]struct{}

	// topics tracks which topics each of our peers are subscribed to
	topics map[string]map[peer.ID]struct{}

	// sendMsg handles messages that have been validated
	sendMsg chan *sendReq

	// addVal handles validator registration requests
	addVal chan *addValReq

	// rmVal handles validator unregistration requests
	rmVal chan *rmValReq

	// topicVals tracks per topic validators
	topicVals map[string]*topicVal

	// validateThrottle limits the number of active validation goroutines
	validateThrottle chan struct{}

	// eval thunk in event loop
	eval chan func()

	peers        map[peer.ID]chan *RPC
	seenMessages *timecache.TimeCache

	ctx context.Context
}

// PubSubRouter is the message router component of PubSub
type PubSubRouter interface {
	// Protocols returns the list of protocols supported by the router.
	Protocols() []protocol.ID
	// Attach is invoked by the PubSub constructor to attach the router to a
	// freshly initialized PubSub instance.
	Attach(*PubSub)
	// AddPeer notifies the router that a new peer has been connected.
	AddPeer(peer.ID, protocol.ID)
	// RemovePeer notifies the router that a peer has been disconnected.
	RemovePeer(peer.ID)
	// HandleRPC is invoked to process control messages in the RPC envelope.
	// It is invoked after subscriptions and payload messages have been processed.
	HandleRPC(*RPC)
	// Publish is invoked to forward a new message that has been validated.
	Publish(peer.ID, *pb.Message)
	// Join notifies the router that we want to receive and forward messages in a topic.
	// It is invoked after the subscription announcement.
	Join(topic string)
	// Leave notifies the router that we are no longer interested in a topic.
	// It is invoked after the unsubscription announcement.
	Leave(topic string)
}

type Message struct {
	*pb.Message
}

func (m *Message) GetFrom() peer.ID {
	return peer.ID(m.Message.GetFrom())
}

type RPC struct {
	pb.RPC

	// unexported on purpose, not sending this over the wire
	from peer.ID
}

type Option func(*PubSub) error

// NewPubSub returns a new PubSub management object
func NewPubSub(ctx context.Context, h host.Host, rt PubSubRouter, opts ...Option) (*PubSub, error) {
	ps := &PubSub{
		host:             h,
		ctx:              ctx,
		rt:               rt,
		incoming:         make(chan *RPC, 32),
		publish:          make(chan *Message),
		newPeers:         make(chan inet.Stream),
		peerDead:         make(chan peer.ID),
		cancelCh:         make(chan *Subscription),
		getPeers:         make(chan *listPeerReq),
		addSub:           make(chan *addSubReq),
		getTopics:        make(chan *topicReq),
		sendMsg:          make(chan *sendReq, 32),
		addVal:           make(chan *addValReq),
		rmVal:            make(chan *rmValReq),
		validateThrottle: make(chan struct{}, defaultValidateThrottle),
		eval:             make(chan func()),
		myTopics:         make(map[string]map[*Subscription]struct{}),
		topics:           make(map[string]map[peer.ID]struct{}),
		peers:            make(map[peer.ID]chan *RPC),
		topicVals:        make(map[string]*topicVal),
		seenMessages:     timecache.NewTimeCache(time.Second * 120),
		counter:          uint64(time.Now().UnixNano()),
	}

	for _, opt := range opts {
		err := opt(ps)
		if err != nil {
			return nil, err
		}
	}

	rt.Attach(ps)

	for _, id := range rt.Protocols() {
		h.SetStreamHandler(id, ps.handleNewStream)
	}
	h.Network().Notify((*PubSubNotif)(ps))

	go ps.processLoop(ctx)

	return ps, nil
}

func WithValidateThrottle(n int) Option {
	return func(ps *PubSub) error {
		ps.validateThrottle = make(chan struct{}, n)
		return nil
	}
}

// processLoop handles all inputs arriving on the channels
func (p *PubSub) processLoop(ctx context.Context) {
	defer func() {
		// Clean up go routines.
		for _, ch := range p.peers {
			close(ch)
		}
		p.peers = nil
		p.topics = nil
	}()
	for {
		select {
		case s := <-p.newPeers:
			pid := s.Conn().RemotePeer()
			ch, ok := p.peers[pid]
			if ok {
				log.Error("already have connection to peer: ", pid)
				close(ch)
			}

			messages := make(chan *RPC, 32)
			go p.handleSendingMessages(ctx, s, messages)
			messages <- p.getHelloPacket()

			p.peers[pid] = messages

			p.rt.AddPeer(pid, s.Protocol())

		case pid := <-p.peerDead:
			ch, ok := p.peers[pid]
			if ok {
				close(ch)
			}

			delete(p.peers, pid)
			for _, t := range p.topics {
				delete(t, pid)
			}

			p.rt.RemovePeer(pid)

		case treq := <-p.getTopics:
			var out []string
			for t := range p.myTopics {
				out = append(out, t)
			}
			treq.resp <- out
		case sub := <-p.cancelCh:
			p.handleRemoveSubscription(sub)
		case sub := <-p.addSub:
			p.handleAddSubscription(sub)
		case preq := <-p.getPeers:
			tmap, ok := p.topics[preq.topic]
			if preq.topic != "" && !ok {
				preq.resp <- nil
				continue
			}
			var peers []peer.ID
			for p := range p.peers {
				if preq.topic != "" {
					_, ok := tmap[p]
					if !ok {
						continue
					}
				}
				peers = append(peers, p)
			}
			preq.resp <- peers
		case rpc := <-p.incoming:
			p.handleIncomingRPC(rpc)

		case msg := <-p.publish:
			vals := p.getValidators(msg)
			p.pushMsg(vals, p.host.ID(), msg)

		case req := <-p.sendMsg:
			p.publishMessage(req.from, req.msg.Message)

		case req := <-p.addVal:
			p.addValidator(req)

		case req := <-p.rmVal:
			p.rmValidator(req)

		case thunk := <-p.eval:
			thunk()

		case <-ctx.Done():
			log.Info("pubsub processloop shutting down")
			return
		}
	}
}

// handleRemoveSubscription removes Subscription sub from bookeeping.
// If this was the last Subscription for a given topic, it will also announce
// that this node is not subscribing to this topic anymore.
// Only called from processLoop.
func (p *PubSub) handleRemoveSubscription(sub *Subscription) {
	subs := p.myTopics[sub.topic]

	if subs == nil {
		return
	}

	sub.err = fmt.Errorf("subscription cancelled by calling sub.Cancel()")
	close(sub.ch)
	delete(subs, sub)

	if len(subs) == 0 {
		delete(p.myTopics, sub.topic)
		p.announce(sub.topic, false)
		p.rt.Leave(sub.topic)
	}
}

// handleAddSubscription adds a Subscription for a particular topic. If it is
// the first Subscription for the topic, it will announce that this node
// subscribes to the topic.
// Only called from processLoop.
func (p *PubSub) handleAddSubscription(req *addSubReq) {
	sub := req.sub
	subs := p.myTopics[sub.topic]

	// announce we want this topic
	if len(subs) == 0 {
		p.announce(sub.topic, true)
		p.rt.Join(sub.topic)
	}

	// make new if not there
	if subs == nil {
		p.myTopics[sub.topic] = make(map[*Subscription]struct{})
		subs = p.myTopics[sub.topic]
	}

	sub.ch = make(chan *Message, 32)
	sub.cancelCh = p.cancelCh

	p.myTopics[sub.topic][sub] = struct{}{}

	req.resp <- sub
}

// announce announces whether or not this node is interested in a given topic
// Only called from processLoop.
func (p *PubSub) announce(topic string, sub bool) {
	subopt := &pb.RPC_SubOpts{
		Topicid:   &topic,
		Subscribe: &sub,
	}

	out := rpcWithSubs(subopt)
	for pid, peer := range p.peers {
		select {
		case peer <- out:
		default:
			log.Infof("Can't send announce message to peer %s: queue full; scheduling retry", pid)
			go p.announceRetry(topic, sub)
		}
	}
}

func (p *PubSub) announceRetry(topic string, sub bool) {
	time.Sleep(time.Duration(1+rand.Intn(1000)) * time.Millisecond)

	retry := func() {
		_, ok := p.myTopics[topic]
		if (ok && sub) || (!ok && !sub) {
			p.announce(topic, sub)
		}
	}

	select {
	case p.eval <- retry:
	case <-p.ctx.Done():
	}
}

// notifySubs sends a given message to all corresponding subscribers.
// Only called from processLoop.
func (p *PubSub) notifySubs(msg *pb.Message) {
	for _, topic := range msg.GetTopicIDs() {
		subs := p.myTopics[topic]
		for f := range subs {
			select {
			case f.ch <- &Message{msg}:
			default:
				log.Infof("Can't deliver message to subscription for topic %s; subscriber too slow", topic)
			}
		}
	}
}

// seenMessage returns whether we already saw this message before
func (p *PubSub) seenMessage(id string) bool {
	return p.seenMessages.Has(id)
}

// markSeen marks a message as seen such that seenMessage returns `true' for the given id
func (p *PubSub) markSeen(id string) {
	p.seenMessages.Add(id)
}

// subscribedToMessage returns whether we are subscribed to one of the topics
// of a given message
func (p *PubSub) subscribedToMsg(msg *pb.Message) bool {
	if len(p.myTopics) == 0 {
		return false
	}

	for _, t := range msg.GetTopicIDs() {
		if _, ok := p.myTopics[t]; ok {
			return true
		}
	}
	return false
}

func (p *PubSub) handleIncomingRPC(rpc *RPC) {
	for _, subopt := range rpc.GetSubscriptions() {
		t := subopt.GetTopicid()
		if subopt.GetSubscribe() {
			tmap, ok := p.topics[t]
			if !ok {
				tmap = make(map[peer.ID]struct{})
				p.topics[t] = tmap
			}

			tmap[rpc.from] = struct{}{}
		} else {
			tmap, ok := p.topics[t]
			if !ok {
				continue
			}
			delete(tmap, rpc.from)
		}
	}

	for _, pmsg := range rpc.GetPublish() {
		if !p.subscribedToMsg(pmsg) {
			log.Warning("received message we didn't subscribe to. Dropping.")
			continue
		}

		msg := &Message{pmsg}
		vals := p.getValidators(msg)
		p.pushMsg(vals, rpc.from, msg)
	}

	p.rt.HandleRPC(rpc)
}

// msgID returns a unique ID of the passed Message
func msgID(pmsg *pb.Message) string {
	return string(pmsg.GetFrom()) + string(pmsg.GetSeqno())
}

// pushMsg pushes a message performing validation as necessary
func (p *PubSub) pushMsg(vals []*topicVal, src peer.ID, msg *Message) {
	id := msgID(msg.Message)
	if p.seenMessage(id) {
		return
	}
	p.markSeen(id)

	if len(vals) > 0 {
		// validation is asynchronous and globally throttled with the throttleValidate semaphore.
		// the purpose of the global throttle is to bound the goncurrency possible from incoming
		// network traffic; each validator also has an individual throttle to preclude
		// slow (or faulty) validators from starving other topics; see validate below.
		select {
		case p.validateThrottle <- struct{}{}:
			go func() {
				p.validate(vals, src, msg)
				<-p.validateThrottle
			}()
		default:
			log.Warningf("message validation throttled; dropping message from %s", src)
		}
		return
	}

	p.publishMessage(src, msg.Message)
}

// validate performs validation and only sends the message if all validators succeed
func (p *PubSub) validate(vals []*topicVal, src peer.ID, msg *Message) {
	ctx, cancel := context.WithCancel(p.ctx)
	defer cancel()

	rch := make(chan bool, len(vals))
	rcount := 0
	throttle := false

loop:
	for _, val := range vals {
		rcount++

		select {
		case val.validateThrottle <- struct{}{}:
			go func(val *topicVal) {
				rch <- val.validateMsg(ctx, msg)
				<-val.validateThrottle
			}(val)

		default:
			log.Debugf("validation throttled for topic %s", val.topic)
			throttle = true
			break loop
		}
	}

	if throttle {
		log.Warningf("message validation throttled; dropping message from %s", src)
		return
	}

	for i := 0; i < rcount; i++ {
		valid := <-rch
		if !valid {
			log.Warningf("message validation failed; dropping message from %s", src)
			return
		}
	}

	// all validators were successful, send the message
	p.sendMsg <- &sendReq{
		from: src,
		msg:  msg,
	}
}

func (p *PubSub) publishMessage(from peer.ID, pmsg *pb.Message) {
	p.notifySubs(pmsg)
	p.rt.Publish(from, pmsg)
}

// getValidators returns all validators that apply to a given message
func (p *PubSub) getValidators(msg *Message) []*topicVal {
	var vals []*topicVal

	for _, topic := range msg.GetTopicIDs() {
		val, ok := p.topicVals[topic]
		if !ok {
			continue
		}

		vals = append(vals, val)
	}

	return vals
}

type addSubReq struct {
	sub  *Subscription
	resp chan *Subscription
}

type SubOpt func(sub *Subscription) error

// Subscribe returns a new Subscription for the given topic
func (p *PubSub) Subscribe(topic string, opts ...SubOpt) (*Subscription, error) {
	td := pb.TopicDescriptor{Name: &topic}

	return p.SubscribeByTopicDescriptor(&td, opts...)
}

// SubscribeByTopicDescriptor lets you subscribe a topic using a pb.TopicDescriptor
func (p *PubSub) SubscribeByTopicDescriptor(td *pb.TopicDescriptor, opts ...SubOpt) (*Subscription, error) {
	if td.GetAuth().GetMode() != pb.TopicDescriptor_AuthOpts_NONE {
		return nil, fmt.Errorf("auth mode not yet supported")
	}

	if td.GetEnc().GetMode() != pb.TopicDescriptor_EncOpts_NONE {
		return nil, fmt.Errorf("encryption mode not yet supported")
	}

	sub := &Subscription{
		topic: td.GetName(),
	}

	for _, opt := range opts {
		err := opt(sub)
		if err != nil {
			return nil, err
		}
	}

	out := make(chan *Subscription, 1)
	p.addSub <- &addSubReq{
		sub:  sub,
		resp: out,
	}

	return <-out, nil
}

type topicReq struct {
	resp chan []string
}

// GetTopics returns the topics this node is subscribed to
func (p *PubSub) GetTopics() []string {
	out := make(chan []string, 1)
	p.getTopics <- &topicReq{resp: out}
	return <-out
}

// Publish publishes data under the given topic
func (p *PubSub) Publish(topic string, data []byte) error {
	seqno := p.nextSeqno()
	p.publish <- &Message{
		&pb.Message{
			Data:     data,
			TopicIDs: []string{topic},
			From:     []byte(p.host.ID()),
			Seqno:    seqno,
		},
	}
	return nil
}

func (p *PubSub) nextSeqno() []byte {
	seqno := make([]byte, 8)
	counter := atomic.AddUint64(&p.counter, 1)
	binary.BigEndian.PutUint64(seqno, counter)
	return seqno
}

type listPeerReq struct {
	resp  chan []peer.ID
	topic string
}

// sendReq is a request to call publishMessage.
// It is issued after message validation is done.
type sendReq struct {
	from peer.ID
	msg  *Message
}

// ListPeers returns a list of peers we are connected to.
func (p *PubSub) ListPeers(topic string) []peer.ID {
	out := make(chan []peer.ID)
	p.getPeers <- &listPeerReq{
		resp:  out,
		topic: topic,
	}
	return <-out
}

// per topic validators
type addValReq struct {
	topic    string
	validate Validator
	timeout  time.Duration
	throttle int
	resp     chan error
}

type rmValReq struct {
	topic string
	resp  chan error
}

type topicVal struct {
	topic            string
	validate         Validator
	validateTimeout  time.Duration
	validateThrottle chan struct{}
}

// Validator is a function that validates a message
type Validator func(context.Context, *Message) bool

// ValidatorOpt is an option for RegisterTopicValidator
type ValidatorOpt func(addVal *addValReq) error

// WithValidatorTimeout is an option that sets the topic validator timeout
func WithValidatorTimeout(timeout time.Duration) ValidatorOpt {
	return func(addVal *addValReq) error {
		addVal.timeout = timeout
		return nil
	}
}

// WithValidatorConcurrency is an option that sets topic validator throttle
func WithValidatorConcurrency(n int) ValidatorOpt {
	return func(addVal *addValReq) error {
		addVal.throttle = n
		return nil
	}
}

// RegisterTopicValidator registers a validator for topic
func (p *PubSub) RegisterTopicValidator(topic string, val Validator, opts ...ValidatorOpt) error {
	addVal := &addValReq{
		topic:    topic,
		validate: val,
		resp:     make(chan error, 1),
	}

	for _, opt := range opts {
		err := opt(addVal)
		if err != nil {
			return err
		}
	}

	p.addVal <- addVal
	return <-addVal.resp
}

func (ps *PubSub) addValidator(req *addValReq) {
	topic := req.topic

	_, ok := ps.topicVals[topic]
	if ok {
		req.resp <- fmt.Errorf("Duplicate validator for topic %s", topic)
		return
	}

	val := &topicVal{
		topic:            topic,
		validate:         req.validate,
		validateTimeout:  defaultValidateTimeout,
		validateThrottle: make(chan struct{}, defaultValidateConcurrency),
	}

	if req.timeout > 0 {
		val.validateTimeout = req.timeout
	}

	if req.throttle > 0 {
		val.validateThrottle = make(chan struct{}, req.throttle)
	}

	ps.topicVals[topic] = val
	req.resp <- nil
}

// UnregisterTopicValidator removes a validator from a topic
// returns an error if there was no validator registered with the topic
func (p *PubSub) UnregisterTopicValidator(topic string) error {
	rmVal := &rmValReq{
		topic: topic,
		resp:  make(chan error, 1),
	}

	p.rmVal <- rmVal
	return <-rmVal.resp
}

func (ps *PubSub) rmValidator(req *rmValReq) {
	topic := req.topic

	_, ok := ps.topicVals[topic]
	if ok {
		delete(ps.topicVals, topic)
		req.resp <- nil
	} else {
		req.resp <- fmt.Errorf("No validator for topic %s", topic)
	}
}

func (val *topicVal) validateMsg(ctx context.Context, msg *Message) bool {
	vctx, cancel := context.WithTimeout(ctx, val.validateTimeout)
	defer cancel()

	valid := val.validate(vctx, msg)
	if !valid {
		log.Debugf("validation failed for topic %s", val.topic)
	}

	return valid
}
