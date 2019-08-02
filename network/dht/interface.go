package dht

import (
	"context"

	routing "github.com/libp2p/go-libp2p-routing"
)

type Routing interface {
	routing.IpfsRouting

	// IsReady should return true if the the routing service is ready
	IsReady(ctx context.Context) bool

	// Close routing service
	Close() error
}
