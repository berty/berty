package ble

import (
	ma "github.com/multiformats/go-multiaddr"
)

func init() { // nolint:gochecknoinits
	err := ma.AddProtocol(newProtocol())
	if err != nil {
		panic(err)
	}
}
