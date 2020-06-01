package multiaddr

import (
	ma "github.com/multiformats/go-multiaddr"
)

// Add MC to the list of libp2p's multiaddr protocols
// FIXME: remove this init
// nolint: gochecknoinits
func init() {
	err := ma.AddProtocol(protoMC)
	if err != nil {
		panic(err)
	}
}
