package multiaddr

import (
	peer "github.com/libp2p/go-libp2p-core/peer"
	ma "github.com/multiformats/go-multiaddr"
)

// BLE multiaddr transcoder
// See https://github.com/multiformats/go-multiaddr/blob/master/transcoders.go
var TranscoderBLE = ma.NewTranscoderFromFunctions(bleStB, bleBtS, bleVal)

func bleStB(s string) ([]byte, error) {
	_, err := peer.IDB58Decode(s)
	if err != nil {
		return nil, err
	}
	return []byte(s), nil
}

func bleBtS(b []byte) (string, error) {
	_, err := peer.IDB58Decode(string(b))
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func bleVal(b []byte) error {
	_, err := peer.IDB58Decode(string(b))
	return err
}
