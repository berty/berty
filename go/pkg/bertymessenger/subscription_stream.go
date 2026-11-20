package bertymessenger

import (
	"bytes"
	"context"
	"errors"
	"io"
	"math/rand/v2"
	"time"

	"go.uber.org/zap"

	weshnet_errcode "berty.tech/weshnet/v2/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

const (
	subscriptionMinRetryDelay = time.Second
	subscriptionMaxRetryDelay = 30 * time.Second
	// Bound the live-event deduplication set by periodically reconciling history.
	subscriptionCheckpointInterval = 256
)

type subscriptionEvent interface {
	GetEventContext() *protocoltypes.EventContext
}

type subscriptionStream[T subscriptionEvent] interface {
	Recv() (T, error)
}

type subscriptionConnector[T subscriptionEvent] func(ctx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[T], error)

// runSubscription owns both startup and recovery. Only a bounded, ordered history
// read advances the checkpoint: Weshnet's history-and-live streams can interleave
// newer live events with older history. Advancing on those live events could skip
// unprocessed history after a disconnect.
//
// Live events are handled promptly and remembered until the next history pass.
// Periodic history passes bound that set and deduplicate the overlap between
// history and live events, including Weshnet's inclusive SinceId boundary.
func runSubscription[T subscriptionEvent](
	ctx context.Context,
	logger *zap.Logger,
	seedID []byte,
	connect subscriptionConnector[T],
	handle func(T) error,
) {
	checkpoint := bytes.Clone(seedID)
	pending := make(map[string]struct{})
	delay := subscriptionMinRetryDelay

	consume := func(untilNow bool) error {
		// Cancel every attempt, including handler failures and checkpoint refreshes,
		// so abandoned RPCs do not survive until the subscription itself stops.
		streamCtx, cancel := context.WithCancel(ctx)
		defer cancel()
		stream, err := connect(streamCtx, checkpoint, untilNow)
		if err != nil {
			return err
		}
		for ctx.Err() == nil {
			event, err := stream.Recv()
			if err != nil {
				if untilNow && errors.Is(err, io.EOF) {
					return nil
				}
				return err
			}
			if ctx.Err() != nil {
				return ctx.Err()
			}
			ec := event.GetEventContext()
			if ec == nil || len(ec.GetId()) == 0 {
				continue // Ignore history sentinels and events without a usable ID.
			}
			id := ec.GetId()
			if bytes.Equal(id, checkpoint) {
				continue // SinceId is inclusive.
			}
			if _, handled := pending[string(id)]; !handled {
				if err := handle(event); err != nil {
					return err // Retry without acknowledging a failed handler.
				}
				delay = subscriptionMinRetryDelay
			}
			if untilNow {
				checkpoint = bytes.Clone(id)
				delete(pending, string(id))
			} else {
				pending[string(id)] = struct{}{}
				if len(pending) >= subscriptionCheckpointInterval {
					return nil
				}
			}
		}
		return ctx.Err()
	}

	for ctx.Err() == nil {
		started := time.Now()
		err := consume(true)
		if err == nil && ctx.Err() == nil {
			// Request history AND live events from the checkpoint. SinceNow would
			// lose events appended between the bounded read and this subscription.
			err = consume(false)
		}
		if ctx.Err() != nil {
			return
		}
		if err == nil {
			continue // The live batch filled; refresh the checkpoint immediately.
		}
		if checkpoint != nil && weshnet_errcode.Has(err, weshnet_errcode.ErrCode_ErrInvalidRange) {
			// A persisted interaction can refer to a log entry no longer present
			// locally. Recover from history instead of retrying that cursor forever.
			logger.Warn("subscription cursor unavailable, replaying history", zap.Error(err))
			checkpoint = nil
		}
		if time.Since(started) >= subscriptionMaxRetryDelay {
			delay = subscriptionMinRetryDelay
		}
		// Equal jitter prevents groups from reconnecting in lockstep while keeping
		// a nonzero delay even when opening succeeds but Recv fails immediately.
		retryIn := delay/2 + time.Duration(rand.Int64N(int64(delay/2))) //nolint:gosec // Retry jitter does not require cryptographic randomness.
		logger.Warn("subscription interrupted, will retry", zap.Error(err), zap.Duration("retry-in", retryIn))
		timer := time.NewTimer(retryIn)
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
		}
		delay = min(delay*2, subscriptionMaxRetryDelay)
	}
}
