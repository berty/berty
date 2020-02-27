package tinder

import (
	"time"

	libp2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
)

const ScheduleKey = "Schedule"

// Schedule advertise at the given time
func Schedule(t time.Time) libp2p_discovery.Option {
	return func(opts *libp2p_discovery.Options) error {
		opts.Other[ScheduleKey] = t
		return nil
	}
}
