package network

import (
	"context"

	"github.com/berty/berty/core/api/p2p"
)

type Driver interface {
	SendEvent(ctx context.Context, event *p2p.Event) error
}
