package ipfsutil

import (
	"context"
	"sync"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	ipfs_iopts "github.com/ipfs/interface-go-ipfs-core/options"
	p2p_disc "github.com/libp2p/go-libp2p-core/discovery"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	p2p_pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

type PubSubAPI struct {
	*p2p_pubsub.PubSub
	disc   p2p_disc.Discovery
	logger *zap.Logger

	muTopics sync.RWMutex
	topics   map[string]*p2p_pubsub.Topic
}

func NewPubSubAPI(ctx context.Context, logger *zap.Logger, disc p2p_disc.Discovery, ps *p2p_pubsub.PubSub) ipfs_interface.PubSubAPI {
	return &PubSubAPI{
		PubSub: ps,

		disc:   disc,
		logger: logger,
		topics: make(map[string]*p2p_pubsub.Topic),
	}
}

func (ps *PubSubAPI) topicJoin(topic string, opts ...p2p_pubsub.TopicOpt) (*p2p_pubsub.Topic, error) {
	ps.muTopics.Lock()
	defer ps.muTopics.Unlock()

	var err error

	t, ok := ps.topics[topic]
	if ok {
		return t, nil
	}

	if t, err = ps.PubSub.Join(topic, opts...); err != nil {
		return nil, err
	}

	if _, err = t.Relay(); err != nil {
		t.Close()
		return nil, err
	}

	ps.topics[topic] = t
	return t, nil
}

// func (ps *PubSubAPI) topicLeave(topic string) (err error) {
// 	ps.muTopics.Lock()
// 	if t, ok := ps.topics[topic]; ok {
// 		err = t.Close()
// 		delete(ps.topics, topic)
// 	}
// 	ps.muTopics.Unlock()
// 	return
// }

// Ls lists subscribed topics by name
func (ps *PubSubAPI) Ls(ctx context.Context) ([]string, error) {
	return ps.PubSub.GetTopics(), nil
}

// Peers list peers we are currently pubsubbing with
func (ps *PubSubAPI) Peers(ctx context.Context, opts ...ipfs_iopts.PubSubPeersOption) ([]p2p_peer.ID, error) {
	s, err := ipfs_iopts.PubSubPeersOptions(opts...)
	if err != nil {
		return nil, err
	}

	return ps.PubSub.ListPeers(s.Topic), nil
}

var minTopicSize = p2p_pubsub.WithReadiness(p2p_pubsub.MinTopicSize(1))

// Publish a message to a given pubsub topic
func (ps *PubSubAPI) Publish(ctx context.Context, topic string, msg []byte) error {
	t, err := ps.topicJoin(topic)
	if err != nil {
		return err
	}

	return t.Publish(ctx, msg, minTopicSize)
}

// Subscribe to messages on a given topic
func (ps *PubSubAPI) Subscribe(ctx context.Context, topic string, opts ...ipfs_iopts.PubSubSubscribeOption) (ipfs_interface.PubSubSubscription, error) {
	t, err := ps.topicJoin(topic)
	if err != nil {
		return nil, err
	}

	ps.logger.Debug("subscribing", logutil.PrivateString("topic", topic))
	sub, err := t.Subscribe()
	if err != nil {
		return nil, err
	}

	return &pubsubSubscriptionAPI{ps.logger, sub}, nil
}

// PubSubSubscription is an active PubSub subscription
type pubsubSubscriptionAPI struct {
	logger *zap.Logger
	*p2p_pubsub.Subscription
}

// io.Closer
func (pss *pubsubSubscriptionAPI) Close() (_ error) {
	pss.Subscription.Cancel()
	return
}

// Next return the next incoming message
func (pss *pubsubSubscriptionAPI) Next(ctx context.Context) (ipfs_interface.PubSubMessage, error) {
	m, err := pss.Subscription.Next(ctx)
	if err != nil {
		return nil, err
	}

	return &pubsubMessageAPI{m}, nil
}

// // PubSubMessage is a single PubSub message
type pubsubMessageAPI struct {
	*p2p_pubsub.Message
}

// // From returns id of a peer from which the message has arrived
func (psm *pubsubMessageAPI) From() p2p_peer.ID {
	return psm.Message.GetFrom()
}

// Data returns the message body
func (psm *pubsubMessageAPI) Data() []byte {
	return psm.Message.GetData()
}

// Seq returns message identifier
func (psm *pubsubMessageAPI) Seq() []byte {
	return psm.Message.GetSeqno()
}

// // Topics returns list of topics this message was set to
func (psm *pubsubMessageAPI) Topics() []string {
	if psm.Message.Topic == nil {
		return nil
	}
	return []string{*psm.Message.Topic}
}
