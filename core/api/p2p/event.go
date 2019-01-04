package p2p

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"github.com/jinzhu/gorm"
	opentracing "github.com/opentracing/opentracing-go"
	"go.uber.org/zap"
	context "golang.org/x/net/context"
)

func NewOutgoingEvent(ctx context.Context, sender, receiver string, kind Kind) *Event {
	tracer := tracing.EnterFunc(ctx, sender, receiver, kind)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &Event{
		SenderAPIVersion: Version,
		CreatedAt:        time.Now().UTC(),
		Kind:             kind,
		SenderID:         sender,
		ReceiverID:       receiver,
		Direction:        Event_Outgoing,
	}

}

func (e Event) IsJustReceived() bool {
	return e.Direction == Event_Incoming && (e.AckedAt == nil || e.AckedAt.IsZero())
}

func (e Event) Validate() error {
	// FIXME: generate validation
	return nil
}

func (e Event) Copy() *Event {
	return &Event{
		ID:                 e.ID,
		CreatedAt:          e.CreatedAt,
		UpdatedAt:          e.UpdatedAt,
		SenderID:           e.SenderID,
		Direction:          e.Direction,
		SenderAPIVersion:   e.SenderAPIVersion,
		ReceiverAPIVersion: e.ReceiverAPIVersion,
		ReceiverID:         e.ReceiverID,
		Kind:               e.Kind,
		SentAt:             e.SentAt,
		ReceivedAt:         e.ReceivedAt,
		AckedAt:            e.AckedAt,
		ConversationID:     e.ConversationID,
		Attributes:         e.Attributes,
	}
}

func (e Event) Author() string {
	return strings.Split(e.ID, ":")[0]
}

func (e Event) ToJSON() string {
	// FIXME: use jsonpb
	out, _ := json.Marshal(e)
	return string(out)
}

func (e Event) CreateSpan(ctx context.Context) (opentracing.Span, context.Context) {
	tracer := opentracing.GlobalTracer()
	caller := tracing.GetCallerName(1)
	topic := fmt.Sprintf("event::/%s/%s", e.Direction.String(), e.Kind.String())

	// Retrieve span context inside the event if needed
	spanctx, err := tracer.Extract(opentracing.TextMap, e.TextMapReader())

	var span opentracing.Span
	if err != nil {
		span = opentracing.StartSpan(topic, opentracing.ChildOf(spanctx))
	} else {
		span = opentracing.StartSpan(topic)
	}

	if e.ID != "" {
		span.SetTag("event.id", e.ID)
	}

	span.SetTag("caller", caller)
	span.SetTag("event.kind", e.Kind.String())
	span.SetTag("event.SenderID", e.SenderID)
	span.SetTag("event.DestinationID", e.ReceiverID)
	span.SetTag("event.Direction", e.Direction.String())

	if err := tracer.Inject(span.Context(), opentracing.TextMap, e.TextMapWriter()); err != nil {
		logger().Error("failed to inject span context", zap.Error(err))
	}

	return span, opentracing.ContextWithSpan(ctx, span)
}

func (e Event) IsNode() {} // required by gqlgen

func (e Event) TextMapWriter() opentracing.TextMapWriter {
	return (EventTextMap)(e)
}

func (e Event) TextMapReader() opentracing.TextMapReader {
	return (EventTextMap)(e)
}

var _ opentracing.TextMapWriter = (*EventTextMap)(nil)
var _ opentracing.TextMapReader = (*EventTextMap)(nil)

type EventTextMap Event

func (tm EventTextMap) Set(key, val string) {
	for _, data := range tm.Metadata {
		if data.Key == key {
			data.Values = []string{val}
			return
		}
	}

	tm.Metadata = append(tm.Metadata, &MetadataKeyValue{
		Key:    key,
		Values: []string{val},
	})
}

func (tm EventTextMap) ForeachKey(handler func(key, val string) error) (err error) {
	for _, data := range tm.Metadata {
		if len(data.Values) > 0 {
			err = handler(data.Key, data.Values[0])
		} else {
			err = handler(data.Key, "")
		}

		if err != nil {
			return
		}
	}

	return
}

// FindNonAcknowledgedEventDestinations finds non acknowledged event destinations emitted before the supplied time value
func FindNonAcknowledgedEventDestinations(db *gorm.DB, before time.Time) ([]*Event, error) {
	var events []*Event

	err := db.
		Table("event").
		Select("conversation_id, receiver_id").
		Where("sent_at < :time", before).
		Where("acked_at IS NULL").
		Where(&Event{
			Direction: Event_Outgoing,
		}).
		Group("conversation_id, receiver_id").
		Scan(&events).
		Error

	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return events, nil
}

// FindNonAcknowledgedEventsForDestination finds non acknowledged events for the supplied destination (conversation/receiver)
func FindNonAcknowledgedEventsForDestination(db *gorm.DB, destination *Event) ([]*Event, error) {
	var events []*Event

	err := db.Find(&events, &Event{
		ConversationID: destination.ConversationID,
		ReceiverID:     destination.ReceiverID,
		Direction:      Event_Outgoing,
	}).Where("acked_at IS NULL").Error

	if err != nil {
		return nil, err
	}

	return events, nil
}
