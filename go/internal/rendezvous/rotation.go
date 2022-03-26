package rendezvous

import (
	"fmt"
	"sync"
	"time"
)

var (
	RotationGracePeriod  = time.Minute * 10
	MinimumDelayRotation = time.Minute
)

type RotationInterval struct {
	interval time.Duration

	cacheTopics    map[string]*Point
	cacheRotations map[string]*Point
	muCache        sync.RWMutex
}

func NewStaticRotationInterval() *RotationInterval {
	// from https://stackoverflow.com/a/32620397
	maxTime := time.Unix(1<<63-62135596801, 999999999)
	return NewRotationInterval(time.Until(maxTime))
}

func NewRotationInterval(interval time.Duration) *RotationInterval {
	return &RotationInterval{
		interval:       interval,
		cacheTopics:    make(map[string]*Point),
		cacheRotations: make(map[string]*Point),
	}
}

func (r *RotationInterval) RegisterRotation(at time.Time, topic string, seed []byte) {
	point := r.NewRendezvousPointForPeriod(at, topic, seed)
	r.muCache.Lock()
	r.registerPoint(point)
	r.muCache.Unlock()
}

func (r *RotationInterval) RoundTimePeriod(at time.Time) time.Time {
	return RoundTimePeriod(at, r.interval)
}

func (r *RotationInterval) NextTimePeriod(at time.Time) time.Time {
	return NextTimePeriod(at, r.interval)
}

func (r *RotationInterval) PointForRawRotation(rotation []byte) (*Point, error) {
	return r.PointForRotation(string(rotation))
}

func (r *RotationInterval) PointForRotation(rotation string) (*Point, error) {
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

func (r *RotationInterval) PointForTopic(topic string) (*Point, error) {
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

func (r *RotationInterval) NewRendezvousPointForPeriod(at time.Time, topic string, seed []byte) (point *Point) {
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

func (r *RotationInterval) registerPoint(point *Point) {
	keytopic, keyrotation := point.keys()
	r.cacheTopics[keytopic] = point
	r.cacheRotations[keyrotation] = point
}

func (r *RotationInterval) rotate(old *Point, graceperiod time.Duration) *Point {
	new := old.NextPoint()

	// register new point
	r.registerPoint(new)

	cleanuptime := time.Until(new.Deadline().Add(graceperiod))
	if cleanuptime < 0 {
		cleanuptime = 0
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
	rp       *RotationInterval
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
