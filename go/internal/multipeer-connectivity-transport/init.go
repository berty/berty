package mc

import (
	mcdrv "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/driver"
)

// FIXME: remove this init
// nolint: gochecknoinits
func init() {
	// Bind native to golang bridge functions
	mcdrv.BindNativeToGoFunctions(
		HandleFoundPeer,
		ReceiveFromPeer,
	)
}
