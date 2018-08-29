package network

import (
	"context"

	"berty.tech/core/api/p2p"
)

type Driver interface {
	// Emit sends an envelope to a channel
	Emit(context.Context, *p2p.Envelope) error

	// Join subscribe for new envelope in a channel
	Join(context.Context, string) error

	// OnEnvelopeHandler sets the callback that will handle each new received envelope
	OnEnvelopeHandler(func(context.Context, *p2p.Envelope) (*p2p.Void, error))

	// Close cleanups things
	Close() error
}
