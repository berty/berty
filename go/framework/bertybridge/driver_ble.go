package bertybridge

import (
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

type NativeBleDriver interface {
	proximity.NativeDriver
}

type ProximityTransport interface {
	proximity.ProximityTransport
}

func GetProximityTransport(protocolName string) ProximityTransport {
	t, ok := proximity.TransportMap.Load(protocolName)
	if ok {
		return t.(proximity.ProximityTransport)
	}
	return nil
}
