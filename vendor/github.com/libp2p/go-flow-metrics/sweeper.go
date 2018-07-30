package flow

import (
	"math"
	"sync"
	"sync/atomic"
	"time"
)

// IdleRate the rate at which we declare a meter idle (and stop tracking it
// until it's re-registered).
//
// The default ensures that 1 event every ~30s will keep the meter from going
// idle.
var IdleRate = 1e-13

// Alpha for EWMA of 1s
var alpha = 1 - math.Exp(-1.0)

// The global sweeper.
var globalSweeper sweeper

type sweeper struct {
	sweepOnce       sync.Once
	meters          []*Meter
	mutex           sync.RWMutex
	registerChannel chan *Meter
}

func (sw *sweeper) start() {
	sw.registerChannel = make(chan *Meter, 16)
	go sw.run()
}

func (sw *sweeper) run() {
	for m := range sw.registerChannel {
		sw.register(m)
		sw.runActive()
	}
}

func (sw *sweeper) register(m *Meter) {
	// Add back the snapshot total. If we unregistered this
	// one, we set it to zero.
	atomic.AddUint64(&m.accumulator, m.snapshot.Total)
	sw.meters = append(sw.meters, m)
}

func (sw *sweeper) runActive() {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for len(sw.meters) > 0 {
		// Scale back allocation.
		if len(sw.meters)*2 < cap(sw.meters) {
			newMeters := make([]*Meter, len(sw.meters))
			copy(newMeters, sw.meters)
			sw.meters = newMeters
		}

		select {
		case t := <-ticker.C:
			sw.update(t)
		case m := <-sw.registerChannel:
			sw.register(m)
		}
	}
	sw.meters = nil
	// Till next time.
}

func (sw *sweeper) update(t time.Time) {
	sw.mutex.Lock()
	defer sw.mutex.Unlock()
	for i := 0; i < len(sw.meters); i++ {
		m := sw.meters[i]
		total := atomic.LoadUint64(&m.accumulator)
		diff := total - m.snapshot.Total

		if m.snapshot.Rate == 0 {
			m.snapshot.Rate = float64(diff)
		} else {
			m.snapshot.Rate += alpha * (float64(diff) - m.snapshot.Rate)
		}
		m.snapshot.Total = total

		// This is equivalent to one zeros, then one, then 30 zeros.
		// We'll consider that to be "idle".
		if m.snapshot.Rate > IdleRate {
			continue
		}

		// Ok, so we are idle...

		// Mark this as idle by zeroing the accumulator.
		swappedTotal := atomic.SwapUint64(&m.accumulator, 0)

		// So..., are we really idle?
		if swappedTotal > total {
			// Not so idle...
			// Now we need to make sure this gets re-registered.

			// First, add back what we removed. If we can do this
			// fast enough, we can put it back before anyone
			// notices.
			currentTotal := atomic.AddUint64(&m.accumulator, swappedTotal)

			// Did we make it?
			if currentTotal == swappedTotal {
				// Yes! Nobody noticed, move along.
				continue
			}
			// No. Someone noticed and will (or has) put back into
			// the registration channel.
			//
			// Remove the snapshot total, it'll get added back on
			// registration.
			//
			// `^uint64(total - 1)` is the two's compliment of
			// `total`. It's the "correct" way to subtract
			// atomically in go.
			atomic.AddUint64(&m.accumulator, ^uint64(m.snapshot.Total-1))
		}

		// Reset the rate, keep the total.
		m.snapshot.Rate = 0

		// remove it and repeat `i`
		sw.meters[i] = sw.meters[len(sw.meters)-1]
		sw.meters[len(sw.meters)-1] = nil
		sw.meters = sw.meters[:len(sw.meters)-1]
		i--
	}
}

func (sw *sweeper) Register(m *Meter) {
	sw.sweepOnce.Do(sw.start)
	sw.registerChannel <- m
}
