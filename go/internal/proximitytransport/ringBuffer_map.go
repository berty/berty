package proximitytransport

import (
	"container/ring"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
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
	rbm.logger.Debug("Add", logutil.PrivateString("peerID", peerID), logutil.PrivateBinary("payload", payload))

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
	rbm.logger.Debug("flushCache", logutil.PrivateString("peerID", peerID))

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

				rbm.logger.Debug("flushCache", logutil.PrivateBinary("payload", payload))
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

// Delete cache entry
func (rbm *RingBufferMap) Delete(peerID string) {
	rbm.logger.Debug("RingBufferMap: Delete called", logutil.PrivateString("peerID", peerID))

	rbm.Lock()
	_, ok := rbm.cache[peerID]
	if ok {
		rbm.logger.Debug("RingBufferMap: Delete: cache found", logutil.PrivateString("peerID", peerID))

		delete(rbm.cache, peerID)
	}
	rbm.Unlock()
}
