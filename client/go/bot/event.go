package bot

import (
	"context"

	"github.com/berty/berty/core/api/p2p"
)

type Event struct {
	p2p.Event

	ctx context.Context
}
