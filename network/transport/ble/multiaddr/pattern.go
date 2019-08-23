package multiaddr

import (
	mafmt "github.com/multiformats/go-multiaddr-fmt"
)

// BLE multiaddr validation checker
// See https://github.com/multiformats/go-multiaddr-fmt
var BLE = mafmt.Base(P_BLE)
