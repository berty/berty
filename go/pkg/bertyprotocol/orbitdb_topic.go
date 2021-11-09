package bertyprotocol

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"

	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
)

const DefaultRotationInterval = time.Hour * 24

type PubSubWithRotation struct {
	impl     iface.PubSubInterface
	keys     map[string][]byte
	mu       sync.RWMutex
	interval time.Duration
}

func (p *PubSubWithRotation) TopicSubscribe(ctx context.Context, topic string) (iface.PubSubTopic, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	key, ok := p.keys[topic]
	if !ok {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("key for topic not found"))
	}

	return p.NewPubSubTopic(ctx, p.interval, topic, key)
}

func (p *PubSubWithRotation) RegisterGroupLinkKey(dbAddress string, linkKey []byte) {
	p.mu.Lock()
	defer p.mu.Unlock()

	p.keys[dbAddress] = linkKey
}

type PubSubTopicWithRotate struct {
	mu     sync.Mutex
	impl   iface.PubSubTopic
	subCtx context.Context
	topic  string
}

func (p *PubSubTopicWithRotate) Publish(ctx context.Context, message []byte) error {
	p.mu.Lock()
	impl := p.impl
	p.mu.Unlock()

	return impl.Publish(ctx, message)
}

func (p *PubSubTopicWithRotate) Peers(ctx context.Context) ([]peer.ID, error) {
	p.mu.Lock()
	impl := p.impl
	p.mu.Unlock()

	return impl.Peers(ctx)
}

func (p *PubSubTopicWithRotate) WatchPeers(ctx context.Context) (<-chan events.Event, error) {
	ch := make(chan events.Event)

	subCh, err := p.watchPeers(ctx)
	if err != nil {
		close(ch)
		return nil, err
	}

	go func() {
		defer close(ch)

		for {
			for e := range subCh {
				ch <- e
			}

			if ctx.Err() != nil {
				return
			}

			subCh, err = p.watchPeers(ctx)
			if err != nil {
				return
			}
		}
	}()

	return ch, nil
}

func (p *PubSubTopicWithRotate) watchPeers(ctx context.Context) (<-chan events.Event, error) {
	p.mu.Lock()
	impl := p.impl
	subCtx := p.subCtx
	p.mu.Unlock()

	if err := subCtx.Err(); err != nil {
		return nil, err
	}

	subCh, err := impl.WatchPeers(ctx)
	if err != nil {
		return nil, err
	}

	return subCh, nil
}

func (p *PubSubTopicWithRotate) WatchMessages(ctx context.Context) (<-chan *iface.EventPubSubMessage, error) {
	ch := make(chan *iface.EventPubSubMessage)

	subCh, err := p.watchMessages(ctx)
	if err != nil {
		close(ch)
		return nil, err
	}

	go func() {
		defer close(ch)

		for {
			for e := range subCh {
				ch <- e
			}

			if ctx.Err() != nil {
				return
			}

			subCh, err = p.watchMessages(ctx)
			if err != nil {
				return
			}
		}
	}()

	return ch, nil
}

func (p *PubSubTopicWithRotate) watchMessages(ctx context.Context) (<-chan *iface.EventPubSubMessage, error) {
	p.mu.Lock()
	impl := p.impl
	subCtx := p.subCtx
	p.mu.Unlock()

	if err := subCtx.Err(); err != nil {
		return nil, err
	}

	subCh, err := impl.WatchMessages(ctx)
	if err != nil {
		return nil, err
	}

	return subCh, nil
}

func (p *PubSubTopicWithRotate) Topic() string {
	return p.topic
}

func (p *PubSubWithRotation) NewPubSubTopic(ctx context.Context, interval time.Duration, topic string, key []byte) (*PubSubTopicWithRotate, error) {
	psTopicImpl, subCtx, cancel, err := p.getNextTopic(ctx, interval, topic, key)
	if err != nil {
		return nil, err
	}

	psTopic := &PubSubTopicWithRotate{
		topic:  topic,
		subCtx: ctx,
		impl:   psTopicImpl,
	}

	go func() {
		for {
			<-subCtx.Done()
			cancel()

			psTopic.mu.Lock()
			psTopicImpl, subCtx, cancel, err = p.getNextTopic(ctx, interval, topic, key)
			if err != nil {
				return
			}
			psTopic.impl = psTopicImpl
			psTopic.subCtx = subCtx
			psTopic.mu.Unlock()
		}
	}()

	return psTopic, nil
}

func (p *PubSubWithRotation) getNextTopic(ctx context.Context, interval time.Duration, topic string, key []byte) (iface.PubSubTopic, context.Context, context.CancelFunc, error) {
	if err := ctx.Err(); err != nil {
		return nil, nil, nil, err
	}

	topicBytes := []byte(topic)

	now := time.Now()
	start := rendezvous.RoundTimePeriod(now, interval)
	next := rendezvous.NextTimePeriod(now, interval)
	rendezvous.GenerateRendezvousPointForPeriod(topicBytes, key, start)

	subCtx, cancel := context.WithDeadline(ctx, next)

	t, err := p.impl.TopicSubscribe(subCtx, topic)
	if err != nil {
		cancel()
		return nil, nil, nil, err
	}

	return t, subCtx, cancel, nil
}

func NewPubSubWithRotation(impl iface.PubSubInterface, interval time.Duration) *PubSubWithRotation {
	return &PubSubWithRotation{
		impl:     impl,
		interval: interval,
		keys:     map[string][]byte{},
	}
}

var (
	_ iface.PubSubInterface = (*PubSubWithRotation)(nil)
	_ iface.PubSubTopic     = (*PubSubTopicWithRotate)(nil)
)
