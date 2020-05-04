package mc

import (
	mcdrv "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/driver"
)

func init() {
	// Bind native to golang bridge functions
	mcdrv.BindNativeToGoFunctions(
		HandleFoundPeer,
		ReceiveFromPeer,
	)
}
