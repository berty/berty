package proximitytransport

/*
  The mplex struct as NOT relationship with libp2p mplex package!!!

  This mplex struct is a multiplexer taken multiple inputs for one output.
  You must initialize mplex by setting input and output before running it.
  There are two types of input:
  1) RingBufferMap
  2) builtin chan []byte
  There is only one type of output: *io.PipeWriter
  When you start mplex, its flushed buffers first in the order you set them,
  and read on its chan []byte.
*/

import (
	"context"
	"io"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

type mplex struct {
	inputCaches []*RingBufferMap
	inputLock   sync.Mutex
	input       chan []byte

	output *io.PipeWriter

	ctx    context.Context
	logger *zap.Logger
}

func newMplex(ctx context.Context, logger *zap.Logger) *mplex {
	logger = logger.Named("mplex")
	return &mplex{
		input:  make(chan []byte),
		ctx:    ctx,
		logger: logger,
	}
}

func (m *mplex) setOutput(o *io.PipeWriter) {
	m.output = o
}

func (m *mplex) addInputCache(c *RingBufferMap) {
	m.inputLock.Lock()
	m.inputCaches = append(m.inputCaches, c)
	m.inputLock.Unlock()
}

func (m *mplex) write(s []byte) {
	m.logger.Debug("write", logutil.PrivateBinary("payload", s))
	_, err := m.output.Write(s)
	if err != nil {
		m.logger.Error("write: write pipe error", zap.Error(err))
	} else {
		m.logger.Debug("write: successful write pipe")
	}
}

// run flushes caches and read input channel
func (m *mplex) run(peerID string) {
	m.logger.Debug("run: started")
	// flush caches
	m.inputLock.Lock()
	for _, cache := range m.inputCaches {
		m.logger.Debug("run: flushing one cache")

		payloads := cache.Flush(peerID)
		for payload := range payloads {
			m.write(payload)
		}
	}
	m.inputLock.Unlock()

	// read input
	m.logger.Debug("run: reading input channel")
	for {
		select {
		case payload := <-m.input:
			m.write(payload)
		case <-m.ctx.Done():
			return
		}
	}
}
