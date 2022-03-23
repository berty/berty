package rendezvous

import (
	"context"
	"fmt"
	"sync"
	"time"
)

var (
	RotationGracePeriod  = time.Minute * 10
	MinimumDelayRotation = time.Minute
)

type RendezVousPoint interface {
	RegisterRotation(ctx context.Context, at time.Time, topic string, seed []byte)
}

type RotationPoint struct {
	interval time.Duration

	cacheTopics    map[string]*Point
	cacheRotations map[string]*Point
	muCache        sync.RWMutex
}

func NewStaticRotation() *RotationPoint {
	return NewRotationPoint(time.Hour * 24 * 360)
}

func NewRotationPoint(interval time.Duration) *RotationPoint {
	return &RotationPoint{
		interval:       interval,
		cacheTopics:    make(map[string]*Point),
		cacheRotations: make(map[string]*Point),
	}
}

func (r *RotationPoint) RegisterRotation(at time.Time, topic string, seed []byte) {
	point := r.NewRendezvousPointForPeriod(at, topic, seed)
	r.muCache.Lock()
	r.registerPoint(point)
	r.muCache.Unlock()
}

func (r *RotationPoint) RoundTimePeriod(at time.Time) time.Time {
	return RoundTimePeriod(at, r.interval)
}

func (r *RotationPoint) NextTimePeriod(at time.Time) time.Time {
	return NextTimePeriod(at, r.interval)
}

func (r *RotationPoint) PointForRawRotation(rotation []byte) (*Point, error) {
	return r.PointForRotation(string(rotation))
}

func (r *RotationPoint) PointForRotation(rotation string) (*Point, error) {
	r.muCache.Lock()
	defer r.muCache.Unlock()

	if point, ok := r.cacheRotations[rotation]; ok {
		if point.IsExpired() {
			point = r.rotate(point, DefaultRotationInterval)
		}

		return point, nil
	}

	return nil, fmt.Errorf("unable to get rendez vous, no matching rotation registered")
}

func (r *RotationPoint) PointForTopic(topic string) (*Point, error) {
	r.muCache.Lock()
	defer r.muCache.Unlock()

	if point, ok := r.cacheTopics[topic]; ok {
		if point.IsExpired() {
			point = r.rotate(point, DefaultRotationInterval)
		}

		return point, nil
	}

	return nil, fmt.Errorf("unable to get rendezvous point, no matching topic registered")
}

func (r *RotationPoint) NewRendezvousPointForPeriod(at time.Time, topic string, seed []byte) (point *Point) {
	at = r.RoundTimePeriod(at)
	rotation := GenerateRendezvousPointForPeriod([]byte(topic), seed, at)

	next := r.NextTimePeriod(at)
	return &Point{
		rp:       r,
		rotation: rotation,
		topic:    topic,
		seed:     seed,
		deadline: next,
	}
}

func (r *RotationPoint) registerPoint(point *Point) {
	keytopic, keyrotation := point.keys()
	r.cacheTopics[keytopic] = point
	r.cacheRotations[keyrotation] = point
}

func (r *RotationPoint) rotate(old *Point, graceperiod time.Duration) *Point {
	new := old.NextPoint()

	// register new point
	r.registerPoint(new)

	cleanuptime := time.Until(new.Deadline().Add(graceperiod))
	if graceperiod < 0 {
		graceperiod = 0
	}

	// cleanup after the grace period
	time.AfterFunc(cleanuptime, func() {
		r.muCache.Lock()
		_, keyrotation := old.keys()
		delete(r.cacheRotations, keyrotation)
		r.muCache.Unlock()
	})

	return new
}

type Point struct {
	rp       *RotationPoint
	topic    string
	rotation []byte
	seed     []byte
	deadline time.Time
}

func (p *Point) NextPoint() *Point {
	if p.IsExpired() {
		return p.rp.NewRendezvousPointForPeriod(time.Now(), p.topic, p.seed)
	}

	return p.rp.NewRendezvousPointForPeriod(p.deadline.Add(time.Second), p.topic, p.seed)
}

func (p *Point) Seed() []byte {
	return p.seed
}

func (p *Point) keys() (topic string, rotation string) {
	topic = p.Topic()
	rotation = p.RotationTopic()
	return
}

func (p *Point) Topic() string {
	return p.topic
}

func (p *Point) RawTopic() []byte {
	return []byte(p.topic)
}

func (p *Point) RotationTopic() string {
	return string(p.rotation)
}

func (p *Point) RawRotationTopic() []byte {
	return p.rotation
}

func (p *Point) Deadline() time.Time {
	return p.deadline
}

func (p *Point) TTL() time.Duration {
	return time.Until(p.deadline)
}

func (p *Point) IsExpired() bool {
	return p.TTL() > 0
}
