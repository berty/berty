package ble

import (
	bledrv "berty.tech/network/transport/ble/driver"
)

func init() {
	// Bind native to golang bridge functions
	bledrv.BindNativeToGoFunctions(
		HandleFoundPeer,
		ReceiveFromPeer,
	)
}
