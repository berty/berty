package orbitutilapi

import (
	"github.com/libp2p/go-libp2p-core/crypto"
)

type EventSecretNewDevice struct {
	SenderDevicePubKey crypto.PubKey
}

func NewEventSecretNewDevice(pk crypto.PubKey) *EventSecretNewDevice {
	return &EventSecretNewDevice{
		SenderDevicePubKey: pk,
	}
}
