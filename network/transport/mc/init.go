package mc

import (
	mcdrv "berty.tech/network/transport/mc/driver"
)

// nolint: gochecknoinits
func init() {
	// Bind native to golang bridge functions
	mcdrv.BindNativeToGoFunctions(
		HandleFoundPeer,
		ReceiveFromPeer,
	)
}
