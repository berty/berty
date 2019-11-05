package grpcutil

import (
	ma "github.com/multiformats/go-multiaddr"
)

// berty multiformat custom prefix
const BERTY_CUSTOM_PREFIX = 0xbe00

const P_GRPC = BERTY_CUSTOM_PREFIX + 0x0002
const P_GRPC_WEB = BERTY_CUSTOM_PREFIX + 0x0004
const P_GRPC_WEBSOCKET = BERTY_CUSTOM_PREFIX + 0x0008
const P_GRPC_GATEWAY = BERTY_CUSTOM_PREFIX + 0x0016

var protos = []ma.Protocol{
	ma.Protocol{
		Name:  "grpc",
		Code:  P_GRPC,
		VCode: ma.CodeToVarint(P_GRPC),
	},

	ma.Protocol{
		Name:  "grpcweb",
		Code:  P_GRPC_WEB,
		VCode: ma.CodeToVarint(P_GRPC_WEB),
	},

	ma.Protocol{
		Name:  "grpcws",
		Code:  P_GRPC_WEBSOCKET,
		VCode: ma.CodeToVarint(P_GRPC_WEBSOCKET),
	},

	ma.Protocol{
		Name:       "gw",
		Code:       P_GRPC_GATEWAY,
		VCode:      ma.CodeToVarint(P_GRPC_GATEWAY),
		Size:       16,
		Path:       false,
		Transcoder: ma.TranscoderPort,
	},
}

func init() {
	// register protos
	for _, proto := range protos {
		if err := ma.AddProtocol(proto); err != nil {
			panic(err)
		}

	}
}
