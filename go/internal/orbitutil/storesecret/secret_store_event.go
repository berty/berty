package storesecret

import (
	"github.com/libp2p/go-libp2p-core/crypto"
)

type EventNewSecret struct {
	SenderDevicePubKey crypto.PubKey
}

func NewEventNewSecret(pk crypto.PubKey) *EventNewSecret {
	return &EventNewSecret{
		SenderDevicePubKey: pk,
	}
}
