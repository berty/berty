package push

import (
	"berty.tech/core/pkg/errorcodes"
)

var DefaultPushRelayIds = map[DevicePushType][]byte{
	DevicePushType_UnknownDevicePushType: []byte("FILL_ME"),
	DevicePushType_APNS:                  []byte("FILL_ME"),
	DevicePushType_FCM:                   []byte("FILL_ME"),
}

type Dispatcher interface {
	CanDispatch(*PushData, *PushDestination) bool
	Dispatch(*PushData, *PushDestination) error
}

type Manager struct {
	dispatchers []Dispatcher
}

type Payload struct {
	BertyEnvelope string `json:"berty-envelope"`
}

func (m *Manager) Dispatch(push *PushData, pushDestination *PushDestination) error {
	for _, dispatcher := range m.dispatchers {
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
