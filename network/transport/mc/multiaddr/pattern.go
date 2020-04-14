package multiaddr

import (
	mafmt "github.com/multiformats/go-multiaddr-fmt"
)

// MC multiaddr validation checker
// See https://github.com/multiformats/go-multiaddr-fmt
var MC = mafmt.Base(P_MC)
