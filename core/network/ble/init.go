package ble

import (
	ma "github.com/multiformats/go-multiaddr"
	"github.com/satori/go.uuid"
	mafmt "github.com/whyrusleeping/mafmt"
)

const P_BLE = 0x56

var TranscoderBLE = ma.NewTranscoderFromFunctions(bleStB, bleBtS, nil)

var BLE = mafmt.Or(mafmt.Base(P_BLE))

var protoBLE = ma.Protocol{
	Name:       "ble",
	Code:       P_BLE,
	Path:       false,
	Size:       128,
	VCode:      ma.CodeToVarint(P_BLE),
	Transcoder: TranscoderBLE,
}

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

func init() {
	ma.AddProtocol(protoBLE)
}
