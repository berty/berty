package bot

import (
	"context"

	"berty.tech/core/api/p2p"
)

type Event struct {
	p2p.Event

	ctx context.Context
}
