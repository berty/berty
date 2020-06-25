package ipfsutil

import (
	"context"
	"sync"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	ipfs_iopts "github.com/ipfs/interface-go-ipfs-core/options"
	p2p_disc "github.com/libp2p/go-libp2p-core/discovery"
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	p2p_pubsub "github.com/libp2p/go-libp2p-pubsub"

	"go.uber.org/zap"
)

type PubSubAPI struct {
	*p2p_pubsub.PubSub

	host   p2p_host.Host
	disc   p2p_disc.Discovery
	logger *zap.Logger

	muTopics sync.RWMutex
	topics   map[string]*p2p_pubsub.Topic
}

func NewPubSubAPI(ctx context.Context, logger *zap.Logger, disc p2p_disc.Discovery, h p2p_host.Host) (ipfs_interface.PubSubAPI, error) {
	ps, err := p2p_pubsub.NewGossipSub(ctx, h,
		p2p_pubsub.WithMessageSigning(true),
		p2p_pubsub.WithFloodPublish(true),
		p2p_pubsub.WithDiscovery(disc),
	)

	if err != nil {
		return nil, err
	}

	return &PubSubAPI{
		host:   h,
		disc:   disc,
		PubSub: ps,
		logger: logger,
		topics: make(map[string]*p2p_pubsub.Topic),
	}, nil
}

func (ps *PubSubAPI) getTopic(topic string) (*p2p_pubsub.Topic, error) {
	ps.muTopics.Lock()
	defer ps.muTopics.Unlock()

	t, ok := ps.topics[topic]
	if !ok {
		var err error
		t, err = ps.PubSub.Join(topic)
		if err != nil {
			return nil, err
		}

		ps.topics[topic] = t
	}

	return t, nil
}

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
	ps.logger.Debug("publishing", zap.String("topic", topic), zap.Int("msglen", len(msg)))

	t, err := ps.getTopic(topic)
	if err != nil {
		ps.logger.Warn("unable to get topic", zap.Error(err))
		return err
	}

	peers := t.ListPeers()
	if len(peers) == 0 {
		ps.logger.Warn("no peers connected to this topic...", zap.String("topic", topic))
	}

	return t.Publish(context.Background(), msg, minTopicSize)
}

// Subscribe to messages on a given topic
func (ps *PubSubAPI) Subscribe(ctx context.Context, topic string, opts ...ipfs_iopts.PubSubSubscribeOption) (ipfs_interface.PubSubSubscription, error) {
	t, err := ps.getTopic(topic)
	if err != nil {
		ps.logger.Warn("unable to join topic", zap.Error(err))
		return nil, err
	}

	ps.logger.Debug("subscribing:", zap.String("topic", topic))
	sub, err := t.Subscribe()
	if err != nil {
		ps.logger.Warn("unable to subscribe to topic", zap.String("topic", topic), zap.Error(err))
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
		pss.logger.Warn("unable to get next message", zap.Error(err))
		return nil, err
	}

	pss.logger.Debug("got a message from pubsub",
		zap.Int("size", len(m.Message.Data)),
		zap.String("from", m.ReceivedFrom.String()),
		zap.Strings("topic", m.TopicIDs),
	)

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
	return psm.Message.GetTopicIDs()
}
