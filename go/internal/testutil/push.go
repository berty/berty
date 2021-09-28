package testutil

import (
	"fmt"
	"sync"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

const (
	DummyPushServerAddr = "server.test"
	PushMockBundleID    = "tech.berty.mock"
)

type PushMockedDispatcher struct {
	mu       sync.RWMutex
	bundleID string
	queue    map[string][][]byte
}

func (d *PushMockedDispatcher) TokenType() pushtypes.PushServiceTokenType {
	return pushtypes.PushServiceTokenType_PushTokenMQTT
}

func (d *PushMockedDispatcher) Dispatch(data []byte, receiver *protocoltypes.PushServiceReceiver) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	d.queue[string(receiver.Token)] = append(d.queue[string(receiver.Token)], data)

	return nil
}

func (d *PushMockedDispatcher) BundleID() string {
	return d.bundleID
}

func (d *PushMockedDispatcher) Shift(token []byte) []byte {
	d.mu.Lock()
	defer d.mu.Unlock()

	if len(d.queue[string(token)]) == 0 {
		return nil
	}

	var payload []byte
	payload, d.queue[string(token)] = d.queue[string(token)][0], d.queue[string(token)][1:]

	return payload
}

func (d *PushMockedDispatcher) Len(token []byte) int {
	d.mu.RLock()
	defer d.mu.RUnlock()

	return len(d.queue[string(token)])
}

func (d *PushMockedDispatcher) Debug() string {
	d.mu.RLock()
	defer d.mu.RUnlock()

	out := "Showing contents of the push dispatcher:\n\n"

	for k, v := range d.queue {
		out = fmt.Sprintf("%s%s: %d entrie(s)\n", out, k, len(v))
	}

	return out
}

func NewPushMockedDispatcher(bundleID string) *PushMockedDispatcher {
	return &PushMockedDispatcher{
		bundleID: bundleID,
		queue:    map[string][][]byte{},
	}
}
