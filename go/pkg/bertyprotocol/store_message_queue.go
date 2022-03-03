package bertyprotocol

import (
	"container/heap"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/stores/operation"
	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
)

// An Item is something we manage in a priority queue.
type messageCacheItem struct {
	op      operation.Operation
	env     *protocoltypes.MessageEnvelope
	headers *protocoltypes.MessageHeaders
	ownPK   crypto.PubKey
	hash    cid.Cid
}

func (m *messageCacheItem) Counter() uint64 {
	return m.headers.Counter
}

// A priorityMessageQueue implements heap.Interface and holds Items.
type priorityMessageQueue struct {
	messages []*messageCacheItem
}

func newPriorityMessageQueue() *priorityMessageQueue {
	queue := &priorityMessageQueue{
		messages: []*messageCacheItem{},
	}
	heap.Init(queue)
	return queue
}

func (pq *priorityMessageQueue) Add(m *messageCacheItem) {
	heap.Push(pq, m)
}

func (pq *priorityMessageQueue) Next() *messageCacheItem {
	return heap.Pop(pq).(*messageCacheItem)
}

func (pq *priorityMessageQueue) Len() int { return len(pq.messages) }

func (pq *priorityMessageQueue) Less(i, j int) bool {
	// We want Pop to give us the lowest, not highest, priority so we use lower than here.
	return pq.messages[i].Counter() < pq.messages[j].Counter()
}

func (pq priorityMessageQueue) Swap(i, j int) {
	pq.messages[i], pq.messages[j] = pq.messages[j], pq.messages[i]
}

func (pq *priorityMessageQueue) Push(x interface{}) {
	pq.messages = append(pq.messages, x.(*messageCacheItem))
}

func (pq *priorityMessageQueue) Pop() (item interface{}) {
	if n := len(pq.messages); n > 0 {
		item = pq.messages[n-1]
		pq.messages, pq.messages[n-1] = pq.messages[:n-1], nil
	}
	return item
}
