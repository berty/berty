package notify

import (
	"context"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNotify(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	locker := sync.Mutex{}
	ntfy := New(&locker)

	locker.Lock()

	var ok bool = false
	go func() {
		locker.Lock()
		assert.False(t, ok)
		ok = true
		ntfy.Broadcast()
		locker.Unlock()
	}()

	ctxok := ntfy.Wait(ctx)
	assert.True(t, ctxok)
	assert.True(t, ok)

	locker.Unlock()
}

func TestNotifyConcurrentWait(t *testing.T) {
	const n = 200

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	locker := sync.Mutex{}
	notify := New(&locker)

	running := make(chan int, n)
	awake := make(chan int, n)

	for i := 0; i < n; i++ {
		go func(g int) {
			locker.Lock()
			ok := true
			for ok {
				running <- g
				ok = notify.Wait(ctx)
				awake <- g
			}
			locker.Unlock()
		}(i)
	}
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			<-running // Will deadlock unless n are running.
		}

		select {
		case g := <-awake:
			require.FailNow(t, "goroutine should be asleep", "goroutine #%d not asleep", g)
		default:
		}

		locker.Lock()
		if i == n-1 {
			cancel()
		} else {
			notify.Broadcast()
		}
		locker.Unlock()

		seen := make([]bool, n)
		for j := 0; j < n; j++ {
			g := <-awake
			require.Falsef(t, seen[g], "goroutine #%d woke up twice", g)
			seen[g] = true
		}
	}

	select {
	case g := <-running:
		require.FailNow(t, "goroutine should not be running", "goroutine #%d still running", g)
	default:
	}
}
