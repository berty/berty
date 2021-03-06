package proximitytransport

import (
	"container/ring"
	"sync"

	"go.uber.org/zap"
)

// RingBufferMap is a map of string:ringBuffer(aka circular buffer)
// The key is a peerID.
type RingBufferMap struct {
	sync.Mutex

	cache      map[string]*ringBuffer
	bufferSize int
	logger     *zap.Logger
}

type ringBuffer struct {
	sync.Mutex
	buffer *ring.Ring
}

// NewRingBufferMap returns a new connMgr struct
// The size argument is the number of packets to save in cache.
func NewRingBufferMap(logger *zap.Logger, size int) *RingBufferMap {
	logger = logger.Named("RingBuffer")
	return &RingBufferMap{
		cache:      make(map[string]*ringBuffer),
		bufferSize: size,
		logger:     logger,
	}
}

// Add adds the payload into a circular cache
func (rbm *RingBufferMap) Add(peerID string, payload []byte) {
	rbm.logger.Debug("Add", zap.String("peerID", peerID), zap.Binary("payload", payload))

	var rBuffer *ringBuffer

	rbm.Lock()
	rBuffer, ok := rbm.cache[peerID]
	rbm.Unlock()
	if !ok {
		rBuffer = &ringBuffer{
			buffer: ring.New(rbm.bufferSize),
		}
	}

	rBuffer.Lock()
	rBuffer.buffer.Value = payload
	rBuffer.buffer = rBuffer.buffer.Next()
	rBuffer.Unlock()

	rbm.Lock()
	rbm.cache[peerID] = rBuffer
	rbm.Unlock()
}

// Flush puts the cache contents into a chan and clears it
func (rbm *RingBufferMap) Flush(peerID string) <-chan []byte {
	rbm.logger.Debug("flushCache", zap.String("peerID", peerID))

	c := make(chan []byte)

	go func() {
		rbm.Lock()
		rBuffer, ok := rbm.cache[peerID]
		rbm.Unlock()

		if ok {
			rBuffer.Lock()
			for i := 0; i < rbm.bufferSize; i++ {
				payload, ok := rBuffer.buffer.Value.([]byte)
				if !ok {
					rBuffer.buffer = rBuffer.buffer.Next()
					continue
				}

				rbm.logger.Debug("flushCache", zap.Binary("payload", payload))
				c <- payload

				rBuffer.buffer.Value = nil
				rBuffer.buffer = rBuffer.buffer.Next()
			}
			rBuffer.Unlock()

			rbm.Lock()
			delete(rbm.cache, peerID)
			rbm.Unlock()
		}

		close(c)
	}()

	return c
}
