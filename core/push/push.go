package push

import (
	"berty.tech/core/pkg/errorcodes"
)

var DefaultPushRelayPubkeys = map[DevicePushType]string{
	DevicePushType_APNS: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1wyoWXdQZeaQoOKvC2YRwR3+GTb8prpMFNdOmhikU8eionUBKgKnUyIbr/DTvCJQhTlHZfy1pUL6mmRIk9PDQDO1t4ATY9LXfo/O3KoKJ0GmxhGdjheOf1kiKcrem+MJjBVEriZ7tJvuhA/DztQ1zolvflPz9+aNL1qA6qzJD/m2fNYpfEehtZH37MoN/qcn3THnC8H/wwr6soU5GpdPBiXXKcg1IFiaZX9JAoUzKVyzY1xQ/DOzCYCboPSXh1qSsMFsg2LCAmC56s9czKk7foAOV/WZ3Zzbv6yd74K6TdV0xwMgCctZjNa7/Tbq4pCBK2vEMutSXAJlfo+6K9dLQQIDAQAB", // TODO: REPLACE ME
	DevicePushType_FCM:  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1wyoWXdQZeaQoOKvC2YRwR3+GTb8prpMFNdOmhikU8eionUBKgKnUyIbr/DTvCJQhTlHZfy1pUL6mmRIk9PDQDO1t4ATY9LXfo/O3KoKJ0GmxhGdjheOf1kiKcrem+MJjBVEriZ7tJvuhA/DztQ1zolvflPz9+aNL1qA6qzJD/m2fNYpfEehtZH37MoN/qcn3THnC8H/wwr6soU5GpdPBiXXKcg1IFiaZX9JAoUzKVyzY1xQ/DOzCYCboPSXh1qSsMFsg2LCAmC56s9czKk7foAOV/WZ3Zzbv6yd74K6TdV0xwMgCctZjNa7/Tbq4pCBK2vEMutSXAJlfo+6K9dLQQIDAQAB", // TODO: REPLACE ME
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
