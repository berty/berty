package multiaddr

import (
	"github.com/gofrs/uuid"
	ma "github.com/multiformats/go-multiaddr"
)

// BLE multiaddr transcoder
// See https://github.com/multiformats/go-multiaddr/blob/master/transcoders.go
var TranscoderBLE = ma.NewTranscoderFromFunctions(bleStB, bleBtS, bleVal)

func bleStB(s string) ([]byte, error) {
	id, err := uuid.FromString(s)
	if err != nil {
		return nil, err
	}
	return id.Bytes(), nil
}

func bleBtS(b []byte) (string, error) {
	id, err := uuid.FromBytes(b)
	if err != nil {
		return "", err
	}
	return id.String(), nil
}

func bleVal(b []byte) error {
	_, err := uuid.FromBytes(b)
	return err
}
