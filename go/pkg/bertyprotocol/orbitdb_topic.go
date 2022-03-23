package bertyprotocol

// import (
// 	"context"
// 	"fmt"
// 	"sync"
// 	"time"

// 	"github.com/libp2p/go-libp2p-core/peer"
// 	"go.uber.org/zap"

// 	"berty.tech/berty/v2/go/internal/rendezvous"
// 	"berty.tech/go-orbit-db/events"
// 	"berty.tech/go-orbit-db/iface"
// )

// const DefaultRotationInterval = time.Hour * 24

// type PubSubWithRotation struct {
// 	logger *zap.Logger
// 	impl   iface.PubSubInterface
// 	rp     *rendezvous.RotationPoint
// 	mu     sync.RWMutex
// }

// type PubSubRotation struct {
// 	topic iface.PubSubTopic
// 	point *rendezvous.Point
// }

// func (p *PubSubWithRotation) newPubsubRotation(ctx context.Context, topic iface.PubSubTopic, point *rendezvous.Point) (*PubSubRotation, error) {
// 	return &PubSubRotation{
// 		topic: topic,
// 		point: point,
// 	}, nil
// }

// func (p *PubSubWithRotation) TopicSubscribe(ctx context.Context, topic string) (iface.PubSubTopic, error) {
// 	point, err := p.rp.PointForTopic(topic)
// 	if err != nil {
// 		return nil, err
// 	}

// 	// first subscribe
// 	t, err := p.impl.TopicSubscribe(ctx, point.RotationTopic())
// 	if err != nil {
// 		return nil, fmt.Errorf("unable to subscribe to topic: %w", err)
// 	}

// 	rot, err := p.newPubsubRotation(ctx, t, point)

// 	return
// }

// // func (p *PubSubWithRotation) RegisterGroupLinkKey(dbAddress string, linkKey []byte) {
// // 	p.mu.Lock()
// // 	p.keys[dbAddress] = linkKey
// // 	p.mu.Unlock()
// // }

// type PubSubTopicWithRotate struct {
// 	point        *rendezvous.Point
// 	logger       *zap.Logger
// 	closed       bool
// 	topic        iface.PubSubTopic
// 	muRotation   *sync.RWMutex
// 	condRotation *sync.Cond
// }

// func (p *PubSubTopicWithRotate) Publish(ctx context.Context, message []byte) error {
// 	p.muRotation.RLock()
// 	impl := p.topic
// 	p.muRotation.RUnlock()

// 	// do not lock while publishing, publish can be stuck if no peers is on the topic
// 	return impl.Publish(ctx, message)
// }

// func (p *PubSubTopicWithRotate) Peers(ctx context.Context) (ps []peer.ID, err error) {
// 	p.muRotation.RLock()
// 	ps, err = p.topic.Peers(ctx)
// 	p.muRotation.RUnlock()
// 	return
// }

// func (p *PubSubTopicWithRotate) WatchPeers(ctx context.Context) (<-chan events.Event, error) {
// 	ch := make(chan events.Event)

// 	go func() {
// 		defer close(ch)
// 		for !p.isClose() {
// 			if err := p.watchPeers(ctx, ch); err != nil {
// 				return
// 			}

// 			p.muRotation.Lock()
// 			for !p.closed && time.Now().After(p.point.Deadline()) {
// 				p.condRotation.Wait()
// 			}
// 			p.muRotation.Unlock()

// 			<-time.After(time.Second)
// 		}
// 	}()

// 	return ch, nil
// }

// func (p *PubSubTopicWithRotate) watchPeers(ctx context.Context, c chan<- events.Event) error {
// 	p.muRotation.RLock()
// 	subCtx, cancel := context.WithDeadline(ctx, p.point.Deadline())
// 	defer cancel()
// 	subCh, err := p.topic.WatchPeers(subCtx)
// 	p.muRotation.RUnlock()
// 	if err != nil {
// 		return err
// 	}

// 	for evt := range subCh {
// 		c <- evt
// 	}

// 	// return parent ctx error
// 	return ctx.Err()
// }

// func (p *PubSubTopicWithRotate) WatchMessages(ctx context.Context) (<-chan *iface.EventPubSubMessage, error) {
// 	ch := make(chan *iface.EventPubSubMessage)

// 	go func() {
// 		defer close(ch)
// 		for !p.isClose() {
// 			if err := p.watchMessages(ctx, ch); err != nil {
// 				return
// 			}

// 			p.muRotation.Lock()
// 			for !p.closed && time.Now().After(p.point.Deadline()) {
// 				p.condRotation.Wait()
// 			}
// 			p.muRotation.Unlock()

// 			<-time.After(time.Second)
// 		}
// 	}()

// 	return ch, nil
// }

// func (p *PubSubTopicWithRotate) watchMessages(ctx context.Context, c chan<- *iface.EventPubSubMessage) error {
// 	p.muRotation.RLock()

// 	subCtx, cancel := context.WithDeadline(ctx, p.point.Deadline())
// 	defer cancel()

// 	subCh, err := p.topic.WatchMessages(subCtx)
// 	p.muRotation.RUnlock()
// 	if err != nil {
// 		return err
// 	}

// 	for evt := range subCh {
// 		c <- evt
// 	}

// 	// return parent ctx error
// 	return ctx.Err()
// }

// func (p *PubSubTopicWithRotate) Topic() (topic string) {
// 	p.muRotation.RLock()
// 	topic = p.topic.Topic()
// 	p.muRotation.RUnlock()
// 	return
// }

// func (p *PubSubTopicWithRotate) isClose() (yes bool) {
// 	p.muRotation.RLock()
// 	yes = p.closed
// 	p.muRotation.RUnlock()
// 	return
// }

// func (p *PubSubTopicWithRotate) closeTopic() {
// 	p.muRotation.Lock()
// 	p.closed = true
// 	p.condRotation.Broadcast()
// 	p.muRotation.Unlock()
// }

// func (p *PubSubWithRotation) newPubSubTopic(ctx context.Context, point *rendezvous.Point) (*PubSubTopicWithRotate, error) {

// 	var muRotation sync.RWMutex
// 	psTopic := &PubSubTopicWithRotate{
// 		logger:       p.logger,
// 		muRotation:   &muRotation,
// 		condRotation: sync.NewCond(&muRotation),
// 		point:        point,
// 		topic:        implTopic,
// 	}

// 	go func() {
// 		defer psTopic.closeTopic()
// 		for {
// 			p.logger.Debug("next rotation", zap.Duration("next", point.TTL()))
// 			select {
// 			case <-ctx.Done():
// 				return
// 			case <-time.After(point.TTL()):
// 			}

// 			// rotate topic
// 			point = point.NextPoint()
// 			implTopic, err = p.impl.TopicSubscribe(ctx, point.RotationTopic())
// 			if err != nil {
// 				p.logger.Error("unable to subscribe", zap.Error(err))
// 				return
// 			}

// 			psTopic.muRotation.Lock()
// 			psTopic.topic = implTopic
// 			psTopic.point = point

// 			// singal every goroutine that we have updated the topic
// 			psTopic.condRotation.Broadcast()

// 			psTopic.muRotation.Unlock()
// 		}
// 	}()

// 	return psTopic, nil
// }

// func NewPubSubWithRotation(impl iface.PubSubInterface, logger *zap.Logger, rp *rendezvous.RotationPoint) *PubSubWithRotation {
// 	return &PubSubWithRotation{
// 		logger: logger.Named("psr"),
// 		impl:   impl,
// 		rp:     rp,
// 	}
// }

// var (
// 	_ iface.PubSubInterface = (*PubSubWithRotation)(nil)
// 	_ iface.PubSubTopic     = (*PubSubTopicWithRotate)(nil)
// )
