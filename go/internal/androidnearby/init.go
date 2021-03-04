package androidnearby

import (
	ma "github.com/multiformats/go-multiaddr"
)

// Add MC to the list of libp2p's multiaddr protocols
// FIXME: remove this init
func init() { // nolint:gochecknoinits
	err := ma.AddProtocol(newProtocol())
	if err != nil {
		panic(err)
	}
}
