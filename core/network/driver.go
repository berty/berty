package network

import (
	"context"
	"net"

	protocol "github.com/libp2p/go-libp2p-protocol"

	"berty.tech/core/api/p2p"
)

type Driver interface {
	// Emit sends an envelope to a channel
	Emit(context.Context, *p2p.Envelope) error

	// Dial get a raw connection
	Dial(context.Context, string, protocol.ID) (net.Conn, error)

	// Join subscribe for new envelope in a channel
	Join(context.Context, string) error

	// OnEnvelopeHandler sets the callback that will handle each new received envelope
	OnEnvelopeHandler(func(context.Context, *p2p.Envelope) (*p2p.Void, error))

	// PingOtherNode send a ping message to another node
	PingOtherNode(ctx context.Context, destination string) error

	// Close cleanups things
	Close() error
}
