package ble

import (
	peer "github.com/libp2p/go-libp2p/core/peer"
	ma "github.com/multiformats/go-multiaddr"
)

func newProtocol() ma.Protocol {
	transcoderMC := ma.NewTranscoderFromFunctions(mcStB, mcBtS, mcVal)
	return ma.Protocol{
		Name:       ProtocolName,
		Code:       ProtocolCode,
		VCode:      ma.CodeToVarint(ProtocolCode),
		Size:       -1,
		Path:       false,
		Transcoder: transcoderMC,
	}
}

func mcStB(s string) ([]byte, error) {
	_, err := peer.Decode(s)
	if err != nil {
		return nil, err
	}
	return []byte(s), nil
}

func mcBtS(b []byte) (string, error) {
	_, err := peer.Decode(string(b))
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func mcVal(b []byte) error {
	_, err := peer.Decode(string(b))
	return err
}
