package multiaddr

import (
	ma "github.com/multiformats/go-multiaddr"
)

// BLE multiaddr protocol definition
// See https://github.com/multiformats/go-multiaddr/blob/master/protocols.go
// See https://github.com/multiformats/multiaddr/blob/master/protocols.csv
const P_MC = 0x0043

var protoMC = ma.Protocol{
	Name:       "mc",
	Code:       P_MC,
	VCode:      ma.CodeToVarint(P_MC),
	Size:       -1,
	Path:       false,
	Transcoder: TranscoderMC,
}
