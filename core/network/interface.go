package network

import (
	"context"
	"net"

	"berty.tech/core/entity"
	"berty.tech/core/network/config"
	"berty.tech/core/network/metric"
	protocol "github.com/libp2p/go-libp2p-protocol"
)

type Driver interface {
	// Return driver current id
	ID(context.Context) *metric.Peer

	// Emit sends an envelope to a channel
	Emit(context.Context, *entity.Envelope) error

	// Dial get a raw connection
	Dial(context.Context, string, protocol.ID) (net.Conn, error)

	// SetContactID for further uses
	SetContactID(string)

	// Join subscribe for new envelope in a channel
	Join(context.Context) error

	// OnEnvelopeHandler sets the callback that will handle each new received envelope
	OnEnvelopeHandler(func(context.Context, *entity.Envelope) (*entity.Void, error))

	// PingOtherNode send a ping message to another node
	PingOtherNode(ctx context.Context, destination string) error

	// Return the supported protocols of the given peer
	Protocols(context.Context, *metric.Peer) ([]string, error)

	// Return metric interface
	Metric() metric.Metric

	// Return current config
	Config() *config.Config

	// Close cleanups things
	Close(context.Context) error
}
