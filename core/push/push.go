package push

import (
	"berty.tech/core/api/p2p"
	"berty.tech/core/pkg/errorcodes"
)

type Dispatcher interface {
	CanDispatch(*p2p.DevicePushToAttrs, *p2p.DevicePushToDecrypted) bool
	Dispatch(*p2p.DevicePushToAttrs, *p2p.DevicePushToDecrypted) error
}

type Manager struct {
	dispatchers []Dispatcher
}

func (n *Manager) Dispatch(push *p2p.DevicePushToAttrs, pushDestination *p2p.DevicePushToDecrypted) error {
	for _, dispatcher := range n.dispatchers {
		if !dispatcher.CanDispatch(push, pushDestination) {
			continue
		}

		return dispatcher.Dispatch(push, pushDestination)
	}

	return errorcodes.ErrPushUnknownProvider.New()
}

func New(dispatchers ...Dispatcher) *Manager {
	pushManager := &Manager{
		dispatchers: dispatchers,
	}

	return pushManager
}
