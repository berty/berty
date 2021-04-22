package notify

import (
	"context"
	"sync"
)

type Notify struct {
	L sync.Locker

	cc chan struct{}
	mu sync.Mutex
}

func New(l sync.Locker) *Notify {
	return &Notify{L: l}
}

func (n *Notify) getChan() <-chan struct{} {
	n.mu.Lock()
	defer n.mu.Unlock()

	if n.cc == nil {
		n.cc = make(chan struct{})
	}
	return n.cc
}

func (n *Notify) Wait(ctx context.Context) (ok bool) {
	signal := n.getChan()

	n.L.Unlock()

	// now := time.Now()
	select {
	case <-ctx.Done():
		ok = false
	case <-signal:
		ok = true
	}
	// fmt.Printf("TIMEOUT TOOK  %dms\n", time.Since(now).Milliseconds())

	n.L.Lock()

	return
}

func (n *Notify) Broadcast() {
	n.mu.Lock()
	if n.cc != nil {
		close(n.cc)
		n.cc = nil
	}
	n.mu.Unlock()
}
