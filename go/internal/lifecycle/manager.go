package lifecycle

import (
	"context"
	"sync"

	"berty.tech/berty/v2/go/internal/notify"
)

type State int

type Manager struct {
	notify       *notify.Notify
	currentState State
}

func NewManager(initialState State) *Manager {
	return &Manager{
		currentState: initialState,
		notify:       notify.New(&sync.Mutex{}),
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
	m.notify.L.Lock()

	ok := true
	for sourceState == m.currentState && ok {
		// wait until state has been changed or context has been cancel
		ok = m.notify.Wait(ctx)
	}

	m.notify.L.Unlock()
	return ok
}

// GetCurrentState return the current state of the manager
func (m *Manager) GetCurrentState() (state State) {
	m.notify.L.Lock()
	state = m.currentState
	m.notify.L.Unlock()
	return
}
