package multiaddr

import (
	ma "github.com/multiformats/go-multiaddr"
)

// Add BLE to the list of libp2p's multiaddr protocols
func init() {
	err := ma.AddProtocol(protoBLE)
	if err != nil {
		panic(err)
	}
}
