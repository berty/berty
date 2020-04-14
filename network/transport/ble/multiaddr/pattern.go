package multiaddr

import (
	mafmt "github.com/whyrusleeping/mafmt"
)

// BLE multiaddr validation checker
// See https://github.com/multiformats/go-multiaddr-fmt
var BLE = mafmt.Base(P_BLE)
