package lifecycle

import (
	"context"
	"sync"

	"berty.tech/berty/v2/go/internal/notify"
)

type State int

const (
	StateActive State = iota
	StateInactive
)

type Manager struct {
	currentState State

	locker *sync.RWMutex
	notify *notify.Notify

	groupWaiter sync.WaitGroup
}

func NewManager(initialState State) *Manager {
	var locker sync.RWMutex
	return &Manager{
		currentState: initialState,
		locker:       &locker,
		notify:       notify.New(&locker),
	}
}

// UpdateState update the current state of the Manager
func (m *Manager) UpdateState(state State) {
	m.locker.Lock()
	if m.currentState != state {
		m.currentState = state
		m.notify.Broadcast()
	}
	m.locker.Unlock()
}

// WaitForStateChange waits until the currentState changes from sourceState or ctx expires. A true value is returned in former case and false in latter.
func (m *Manager) WaitForStateChange(ctx context.Context, sourceState State) bool {
	m.locker.Lock()

	ok := true
	for sourceState == m.currentState && ok {
		// wait until state has been changed or context has been cancel
		ok = m.notify.Wait(ctx)
	}

	m.locker.Unlock()
	return ok
}

// GetCurrentState return the current state of the Manager
func (m *Manager) GetCurrentState() (state State) {
	m.locker.RLock()
	state = m.currentState
	m.locker.RUnlock()
	return
}

// TaskWaitForStateChange is the same as `WaitForStateChange` but also return a
// task that can be mark as done by the upper caller to notify he is done
// handling the new state, done should always be called to avoid deadlock.
// use `WaitForTasks` to wait for task to complete
func (m *Manager) TaskWaitForStateChange(ctx context.Context, sourceState State) (Task, bool) {
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
func (m *Manager) WaitForTasks() {
	m.locker.RLock()
	m.groupWaiter.Wait() // wait for all tasks to be done
	m.locker.RUnlock()
}
