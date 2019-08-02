package network

import (
	"context"

	host "berty.tech/network/host"
	"berty.tech/network/metric"
	"berty.tech/network/protocol/berty"
)

type Driver interface {
	// Return driver current id
	ID() *metric.Peer

	// Emit sends data to a channel
	EmitMessage(ctx context.Context, msg *berty.Message) error

	// SetLocalContactID for further uses
	SetLocalContactID(lcontactID string)

	// Join subscribe for new envelope in a channel
	Join() error

	// OnEnvelopeHandler sets the callback that will handle each new received envelope
	OnMessage(func(msg *berty.Message, cmeta *berty.ConnMetadata))

	// Return the supported protocols of the given peer
	Protocols(context.Context, *metric.Peer) ([]string, error)

	// @TODO: remove this in favor of a serializable config
	// Update berty host
	UpdateHost(bh *host.BertyHost)

	// PingOtherNode send a ping message to another node
	// PingOtherNode(ctx context.Context, destination string) error

	// Return metric interface
	Metric() metric.Metric

	// Return current config
	// Config() *config.Config

	// Close cleanups things
	Close(ctx context.Context) error
}
