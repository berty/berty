package bot

import (
	"context"

	"berty.tech/core/entity"
)

type Event struct {
	entity.Event

	ctx context.Context
}
