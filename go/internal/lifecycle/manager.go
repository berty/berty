package lifecycle

import (
	"context"
	"sync"

	"berty.tech/berty/v2/go/internal/notify"
)

type State int

type Manager = manager[State]

const (
	StateActive State = iota
	StateInactive
)

type manager[S comparable] struct {
	currentState S

	locker *sync.RWMutex
	notify *notify.Notify
	tasks  Tasks

	groupWaiter sync.WaitGroup
}

func NewManager[S comparable](initialState S) *manager[S] {
	var locker sync.RWMutex
	return &manager[S]{
		currentState: initialState,
		locker:       &locker,
		notify:       notify.New(&locker),
	}
}

// UpdateState update the current state of the manager
func (m *manager[S]) UpdateState(state S) {
	m.locker.Lock()
	if m.currentState != state {
		m.currentState = state
		m.notify.Broadcast()
	}
	m.locker.Unlock()
}

// WaitForStateChange waits until the currentState changes from sourceState or ctx expires. A true value is returned in former case and false in latter.
func (m *manager[S]) WaitForStateChange(ctx context.Context, sourceState S) bool {
	m.locker.Lock()

	ok := true
	for sourceState == m.currentState && ok {
		// wait until state has been changed or context has been cancel
		ok = m.notify.Wait(ctx)
	}

	m.locker.Unlock()
	return ok
}

// GetCurrentState return the current state of the manager
func (m *manager[S]) GetCurrentState() (state S) {
	m.locker.RLock()
	state = m.currentState
	m.locker.RUnlock()
	return
}

// TaskWaitForStateChange is the same as `WaitForStateChange` but also return a
// task that can be mark as done by the upper caller to notify he is done
// handling the new state, done should always be called to avoid deadlock.
// use `WaitForTasks` to wait for task to complete
func (m *manager[S]) TaskWaitForStateChange(ctx context.Context, sourceState S) (Task, bool) {
	m.locker.Lock()
	defer m.locker.Unlock()

	for sourceState == m.currentState {
		// wait until state has been changed or context has been cancel
		if ok := m.notify.Wait(ctx); !ok {
			return nil, false
		}
	}

	m.groupWaiter.Add(1)
	return &task{t: &m.groupWaiter}, true
}

// WaitForTasks wait until all tasks returned by `TaskWaitForStateChange` are done
func (m *manager[S]) WaitForTasks() {
	m.locker.RLock()
	m.groupWaiter.Wait() // wait for all tasks to be done
	m.locker.RUnlock()
}
