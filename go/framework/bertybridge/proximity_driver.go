package bertybridge

import (
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

type ProximityDriver interface {
	proximity.ProximityDriver
}

type ProximityTransport interface {
	proximity.ProximityTransport
}

func GetProximityTransport(protocolName string) ProximityTransport {
	proximity.TransportMapMutex.RLock()
	t, ok := proximity.TransportMap[protocolName]
	proximity.TransportMapMutex.RUnlock()
	if ok {
		return t
	}
	return nil
}
