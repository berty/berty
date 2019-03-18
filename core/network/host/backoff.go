package host

import (
	"math/rand"
	"time"
)

const (
	Factor = 1.6

	// Randomize backoff delays so that if requests start at
	// the same time, they won't operate in lockstep.
	Jitter = 0.2
)

var rsource rand.Source

func init() {
	rsource = rand.NewSource(time.Now().UnixNano())
}

type BackoffDelay struct {
	rand      *rand.Rand
	baseDelay time.Duration
	maxDelay  time.Duration
}

func NewBackoffDelay(baseDelay, maxDelay time.Duration) *BackoffDelay {
	return &BackoffDelay{
		rand:      rand.New(rsource),
		baseDelay: baseDelay,
		maxDelay:  maxDelay,
	}
}

func (b *BackoffDelay) Backoff(retries int) time.Duration {
	if retries == 0 {
		return b.baseDelay
	}

	backoff, max := float64(b.baseDelay), float64(b.maxDelay)
	for backoff < max && retries > 0 {
		backoff *= Factor
		retries--
	}

	backoff *= 1 + Jitter*(b.rand.Float64()*2-1)
	if backoff < 0 {
		return 0
	}

	return time.Duration(backoff)
}
