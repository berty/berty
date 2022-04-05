package bertyprotocol

import (
	"container/heap"
	"sync"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/stores/operation"
)

// An Item is something we manage in a priority queue.
type messageItem struct {
	op      operation.Operation
	env     *protocoltypes.MessageEnvelope
	headers *protocoltypes.MessageHeaders
	ownPK   crypto.PubKey
	hash    cid.Cid
}

func (m *messageItem) Counter() uint64 {
	return m.headers.Counter
}

// A priorityMessageQueue implements heap.Interface and holds Items.
type priorityMessageQueue struct {
	messages   []*messageItem
	muMessages sync.RWMutex
}

func newPriorityMessageQueue() *priorityMessageQueue {
	queue := &priorityMessageQueue{
		messages: []*messageItem{},
	}
	heap.Init(queue)
	return queue
}

func (pq *priorityMessageQueue) Add(m *messageItem) {
	pq.muMessages.Lock()
	heap.Push(pq, m)
	pq.muMessages.Unlock()
}

func (pq *priorityMessageQueue) Next() (item *messageItem) {
	pq.muMessages.Lock()
	if len(pq.messages) > 0 {
		item = heap.Pop(pq).(*messageItem)
	}
	pq.muMessages.Unlock()
	return
}

func (pq *priorityMessageQueue) Size() (l int) {
	pq.muMessages.RLock()
	l = pq.Len()
	pq.muMessages.RUnlock()
	return
}

func (pq *priorityMessageQueue) Len() (l int) {
	l = len(pq.messages)
	return
}

func (pq *priorityMessageQueue) Less(i, j int) bool {
	// We want Pop to give us the lowest, not highest, priority so we use lower than here.
	return pq.messages[i].Counter() < pq.messages[j].Counter()
}

func (pq *priorityMessageQueue) Swap(i, j int) {
	pq.messages[i], pq.messages[j] = pq.messages[j], pq.messages[i]
}

func (pq *priorityMessageQueue) Push(x interface{}) {
	pq.messages = append(pq.messages, x.(*messageItem))
}

func (pq *priorityMessageQueue) Pop() (item interface{}) {
	if n := len(pq.messages); n > 0 {
		item = pq.messages[n-1]
		pq.messages, pq.messages[n-1] = pq.messages[:n-1], nil
	}
	return item
}
