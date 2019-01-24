package push

import (
	"berty.tech/core/pkg/errorcodes"
)

var DefaultPushRelayPubkeys = map[DevicePushType]string{
	DevicePushType_APNS: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlICvrOxGk1uI7wzTtjiQWlXku8ooMOacggZJ4mjIQQe1mc1W38YTYlFEbnKiwS7FnhqWusimKIi7DVmhmrO3OFl8VTfIsPW/dMrsefBHNSaKM72pTdjVjmVRsypZdchvSgGL2VgKENTyPtUjrG24UBfaeVr3fGYM38d599midNmLJRzOqbqMOeBsomHpKrTnhu/VqF/gvqxKJBbsxvgL0VqXFSkWVgzoOE+hrHIXdL3mOtYtzi/6nZzU+uIcm6guJQoJ6hE2Wl9sO8x/lCPrSPJ/a8QDwOHoS7q9uXx4KX97dr3YZhmVa+aMsT36Z9Np31HBcCodvv5+Vppk1uBGBwIDAQAB",
	DevicePushType_FCM:  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlICvrOxGk1uI7wzTtjiQWlXku8ooMOacggZJ4mjIQQe1mc1W38YTYlFEbnKiwS7FnhqWusimKIi7DVmhmrO3OFl8VTfIsPW/dMrsefBHNSaKM72pTdjVjmVRsypZdchvSgGL2VgKENTyPtUjrG24UBfaeVr3fGYM38d599midNmLJRzOqbqMOeBsomHpKrTnhu/VqF/gvqxKJBbsxvgL0VqXFSkWVgzoOE+hrHIXdL3mOtYtzi/6nZzU+uIcm6guJQoJ6hE2Wl9sO8x/lCPrSPJ/a8QDwOHoS7q9uXx4KX97dr3YZhmVa+aMsT36Z9Np31HBcCodvv5+Vppk1uBGBwIDAQAB",
}

type Dispatcher interface {
	CanDispatch(*PushData, *PushDestination) bool
	Dispatch(*PushData, *PushDestination) error
}

type Manager struct {
	dispatchers []Dispatcher
}

type Payload struct {
	Chunk string `json:"chunk"`
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
