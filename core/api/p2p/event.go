package p2p

import (
	"time"

	entity "berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	context "golang.org/x/net/context"
)

func NewOutgoingEvent(ctx context.Context, sender, receiver string, kind entity.Kind) *entity.Event {
	tracer := tracing.EnterFunc(ctx, sender, receiver, kind)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &entity.Event{
		SenderAPIVersion: Version,
		CreatedAt:        time.Now().UTC(),
		Kind:             kind,
		SenderID:         sender,
		ReceiverID:       receiver,
		Direction:        entity.Event_Outgoing,
	}
}
