package multiaddr

import (
	ma "github.com/multiformats/go-multiaddr"
)

// BLE multiaddr protocol definition
// See https://github.com/multiformats/go-multiaddr/blob/master/protocols.go
// See https://github.com/multiformats/multiaddr/blob/master/protocols.csv
const P_BLE = 0x0042

var protoBLE = ma.Protocol{
	Name:       "ble",
	Code:       P_BLE,
	VCode:      ma.CodeToVarint(P_BLE),
	Size:       128,
	Path:       false,
	Transcoder: TranscoderBLE,
}
