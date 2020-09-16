package lifecycle

import (
	"context"
	"sync"
)

type State int

type Manager struct {
	condState    *sync.Cond
	currentState State
}

func NewManager(initialState State) *Manager {
	return &Manager{
		currentState: initialState,
		condState:    sync.NewCond(&sync.Mutex{}),
	}
}

// UpdateState update the current state of the manager
func (m *Manager) UpdateState(state State) {
	m.condState.L.Lock()
	if m.currentState != state {
		m.currentState = state
		m.condState.Broadcast()
	}
	m.condState.L.Unlock()
}

// WaitForStateChange waits until the currentState changes from sourceState or ctx expires. A true value is returned in former case and false in latter.
func (m *Manager) WaitForStateChange(ctx context.Context, sourceState State) bool {
	m.condState.L.Lock()
	defer m.condState.L.Unlock()

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	go func() {
		<-ctx.Done()
		m.condState.Broadcast()
	}()

	for sourceState == m.currentState {
		select {
		case <-ctx.Done():
			return false
		default:
			// wait until state has been changed or context has been cancel
			m.condState.Wait()
		}
	}

	return true
}

// GetCurrentState return the current state of the manager
func (m *Manager) GetCurrentState() (state State) {
	m.condState.L.Lock()
	state = m.currentState
	m.condState.L.Unlock()
	return
}
