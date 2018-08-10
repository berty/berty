package network

import (
	"context"

	"github.com/berty/berty/core/api/p2p"
)

type Driver interface {
	SendEvent(context.Context, *p2p.Event) error
	SetReceiveEventHandler(func(context.Context, *p2p.Event) (*p2p.Void, error))
	//SubscribeToConversation(id []byte) error
}
