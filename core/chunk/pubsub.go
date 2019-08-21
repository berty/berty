package chunk

import (
	"context"
	"sync"

	"berty.tech/core/pkg/errorcodes"
	"go.uber.org/zap"
)

var (
	subscribers      = []*subscriber{}
	subscribersMutex sync.RWMutex
)

type subscriber struct {
	fcancel context.CancelFunc
	ctx     context.Context
	csub    chan []byte
}

func send(sub *subscriber, data []byte) error {
	subscribersMutex.RLock()
	defer subscribersMutex.RUnlock()

	select {
	case <-sub.ctx.Done():
		return sub.ctx.Err()
	case sub.csub <- data:
	}

	return nil
}

func sendAll(sub *subscriber) error {
	subscribersMutex.RLock()
	defer subscribersMutex.RUnlock()

	slices, err := findAllSlices()
	if err != nil {
		return err
	}

	for _, slice := range slices {
		if data, err := Reconstruct(slice); err == nil {
			select {
			case <-sub.ctx.Done():
				return sub.ctx.Err()
			case sub.csub <- data:
			}
		}
	}

	return nil
}

func Subscribe() <-chan []byte {
	ctx, cancel := context.WithCancel(context.Background())
	sub := &subscriber{
		ctx:     ctx,
		fcancel: cancel,
		csub:    make(chan []byte, 1),
	}

	subscribersMutex.Lock()
	subscribers = append(subscribers, sub)
	subscribersMutex.Unlock()

	go func() {
		if err := sendAll(sub); err != nil {
			logger().Warn("subscribe chunk error", zap.Error(err))
		}
	}()

	return sub.csub
}

func getSubscriber(c <-chan []byte) (int, *subscriber) {
	subscribersMutex.RLock()
	defer subscribersMutex.RUnlock()

	for i := range subscribers {
		if c == subscribers[i].csub {
			return i, subscribers[i]
		}
	}

	return -1, nil
}

func Unsubscribe(c <-chan []byte) {
	if i, sub := getSubscriber(c); sub != nil {
		sub.fcancel()

		subscribersMutex.Lock()
		subscribers = append(subscribers[:i], subscribers[i+1:]...)
		close(sub.csub)
		subscribersMutex.Unlock()
	}
}

func Publish(chunk *Chunk) error {
	err := save(chunk)
	if err != nil {
		return errorcodes.ErrChunkPublish.Wrap(err)
	}
	// try to retrieve slice
	go func() {
		slice, err := findSliceByID(chunk.SliceID)
		if err != nil {
			return
		}
		data, err := Reconstruct(slice)
		if err != nil {
			return
		}

		for _, sub := range subscribers {
			if err := send(sub, data); err != nil {
				logger().Warn("publish chunk error", zap.Error(err))
			}
		}
	}()
	return nil
}
