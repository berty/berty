package tinder

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

const defaultTTL = time.Hour

// StartAdvertises topic on each of service drivers
func (s *Service) StartAdvertises(ctx context.Context, topic string, opts ...Option) error {
	if len(s.drivers) == 0 {
		return fmt.Errorf("no driver available to advertise")
	}

	var aopts Options
	if err := aopts.apply(opts...); err != nil {
		return fmt.Errorf("failed to advertise: %w", err)
	}

	for _, driver := range s.drivers {
		// skip filter driver
		if aopts.DriverFilters.ShouldFilter(driver.Name()) {
			continue
		}

		// start background job
		go func(driver IDriver) {
			if err := s.advertise(ctx, driver, topic); err != nil {
				s.logger.Debug("advertise ended", zap.Error(err))
			}
		}(driver)
	}

	return nil
}

func (s *Service) advertise(ctx context.Context, d IDriver, topic string) error {
	for {
		currentAddrs := s.networkNotify.GetLastUpdatedAddrs(ctx)

		now := time.Now()
		ttl, err := d.Advertise(ctx, topic)
		took := time.Since(now)

		var deadline time.Duration
		if err != nil {
			select {
			case <-ctx.Done():
				return ctx.Err()
			default:
			}

			// retry in 30 seconds
			deadline = time.Second * 30
		} else {
			if ttl == 0 {
				ttl = defaultTTL
			}
			deadline = 4 * ttl / 5
		}

		s.logger.Debug("advertise",
			zap.String("driver", d.Name()),
			logutil.PrivateString("topic", topic),
			zap.Duration("ttl", ttl),
			zap.Duration("took", took),
			zap.Duration("next", deadline),
			zap.Error(err),
		)

		waitctx, cancel := context.WithTimeout(ctx, deadline)
		// wait for network update or waitctx expire
		_, ok := s.networkNotify.WaitForUpdate(waitctx, currentAddrs)
		cancel()

		// filter addrs

		if !ok {
			select {
			// check for parent ctx
			case <-ctx.Done():
				// main context has expire, stop
				return ctx.Err()
			default:
				// waitContext has expire, continue
			}
		}
	}
}
