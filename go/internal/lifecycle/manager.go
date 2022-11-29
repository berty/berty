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
	notify        *notify.Notify
	currentState  State
	tasks, waiter *sync.WaitGroup
}

func NewManager(initialState State) *Manager {
	return &Manager{
		currentState: initialState,
		notify:       notify.New(&sync.Mutex{}),
		tasks:        &sync.WaitGroup{},
		waiter:       &sync.WaitGroup{},
	}
}

// UpdateState update the current state of the manager
func (m *Manager) UpdateState(state State) {
	m.notify.L.Lock()
	if m.currentState != state {
		m.currentState = state
		m.notify.Broadcast()
	}
	m.notify.L.Unlock()
}

// WaitForStateChange waits until the currentState changes from sourceState or ctx expires. A true value is returned in former case and false in latter.
func (m *Manager) WaitForStateChange(ctx context.Context, sourceState State) bool {
	m.waiter.Add(1)
	m.notify.L.Lock()

	ok := true
	for sourceState == m.currentState && ok {
		// wait until state has been changed or context has been cancel
		ok = m.notify.Wait(ctx)
	}

	m.notify.L.Unlock()
	m.waiter.Done()
	return ok
}

// TaskWaitForStateChange is the same as `WaitForStateChange` but also return a
// task that can be mark as done by the upper caller to notiy he is done
// handling the new state, done should always be called to avoid deadlock.
// use `WaitForTasks` to wait for task to complete
func (m *Manager) TaskWaitForStateChange(ctx context.Context, sourceState State) (Task, bool) {
	m.waiter.Add(1)
	defer m.waiter.Done()

	m.notify.L.Lock()
	defer m.notify.L.Unlock()

	for sourceState == m.currentState {
		// wait until state has been changed or context has been cancel
		if ok := m.notify.Wait(ctx); !ok {
			return nil, false
		}
	}

	m.tasks.Add(1)
	return &task{tasks: m.tasks}, true
}

// GetCurrentState return the current state of the manager
func (m *Manager) GetCurrentState() (state State) {
	m.notify.L.Lock()
	state = m.currentState
	m.notify.L.Unlock()
	return
}

// WaitForTasks wait until all tasks returned by `TaskWaitForStateChange` are done
func (m *Manager) WaitForTasks() {
	m.waiter.Wait()
	m.tasks.Wait()
}
