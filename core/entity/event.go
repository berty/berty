package entity

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
	opentracing "github.com/opentracing/opentracing-go"
	"go.uber.org/zap"
	context "golang.org/x/net/context"

	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/push"
)

func NewEvent() *Event {
	return &Event{
		Dispatches: make([]*EventDispatch, 0),
	}
}

func (e Event) IsJustReceived() bool {
	return e.Direction == Event_Incoming && (e.AckedAt == nil || e.AckedAt.IsZero())
}

func (e Event) Copy() *Event {
	return &Event{
		ID:              e.ID,
		SourceDeviceID:  e.SourceDeviceID,
		CreatedAt:       e.CreatedAt,
		UpdatedAt:       e.UpdatedAt,
		SentAt:          e.SentAt,
		ReceivedAt:      e.ReceivedAt,
		AckedAt:         e.AckedAt,
		Direction:       e.Direction,
		APIVersion:      e.APIVersion,
		Kind:            e.Kind,
		Attributes:      e.Attributes,
		SeenAt:          e.SeenAt,
		AckStatus:       e.AckStatus,
		Dispatches:      e.Dispatches,
		SourceContactID: e.SourceContactID,
		TargetType:      e.TargetType,
		TargetAddr:      e.TargetAddr,
		Metadata:        e.Metadata,
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
	span.SetTag("event.SourceDeviceID", e.SourceDeviceID)
	span.SetTag("event.TargetType", e.TargetType)
	span.SetTag("event.TargetAddr", e.TargetAddr)
	span.SetTag("event.Direction", e.Direction.String())
	span.SetTag("len(event.Dispatches)", len(e.Dispatches))

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
		Select("target_type, target_addr").
		Where("sent_at < :time", before).
		Where("acked_at IS NULL").
		Where(&Event{
			Direction: Event_Outgoing,
		}).
		Group("target_type, target_addr").
		Scan(&events).
		Error

	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return events, nil
}

// FindContactsWithNonAcknowledgedEvents finds non acknowledged event destinations as deviceIDs emitted before the supplied time value
func FindDevicesWithNonAcknowledgedEvents(db *gorm.DB, before time.Time) ([]string, error) {
	var deviceIDs []string

	err := db.
		Model(&EventDispatch{}).
		Joins("JOIN event ON event_dispatch.event_id = event.id").
		Where("event.direction = ?", Event_Outgoing).
		Where("event_dispatch.acked_at IS NULL").
		Where("event_dispatch.sent_at < ?", before).
		Group("event_dispatch.device_id").
		Pluck("event_dispatch.device_id", &deviceIDs).
		Error

	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return deviceIDs, nil
}

func FindDispatchesWithNonAcknowledgedEvents(db *gorm.DB, before time.Time) ([]*EventDispatch, error) {
	var dispatches []*EventDispatch

	err := db.
		Model(&EventDispatch{}).
		Joins("JOIN event ON event_dispatch.event_id = event.id").
		Joins("JOIN config").
		Where("config.myself_id != event_dispatch.contact_id").
		Where("event.direction = ?", Event_Outgoing).
		Where("event.kind != ? AND event.kind != ? AND event.kind != ?", Kind_Ack, Kind_Sent, Kind_Ping).
		Where("event_dispatch.acked_at IS NULL").
		Where("event_dispatch.sent_at > ? OR event_dispatch.sent_at IS NULL", before).
		Find(&dispatches).
		Error

	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return dispatches, nil
}

func FindNonAcknowledgedDispatchesForDestination(db *gorm.DB, deviceID string) ([]*EventDispatch, error) {
	var dispatches []*EventDispatch

	if err := db.Model(&EventDispatch{}).
		Joins("JOIN event ON event_dispatch.event_id = event.id").
		Joins("JOIN config").
		Where("config.myself_id != event_dispatch.contact_id").
		Where("event.kind != ? AND event.kind != ? AND event.kind != ?", Kind_Ack, Kind_Sent, Kind_Ping).
		Where("event.direction = ?", Event_Outgoing).
		Where("event_dispatch.device_id = ?", deviceID).
		Where("event_dispatch.acked_at IS NULL").
		Find(&dispatches).
		Error; err != nil {
		return nil, err
	}

	return dispatches, nil

}

// FindNonAcknowledgedEventsForDestination finds non acknowledged events for the supplied destination (conversation/receiver)
func FindNonAcknowledgedEventsForDestination(db *gorm.DB, destination *Event) ([]*Event, error) {
	var events []*Event

	err := db.Find(&events, &Event{
		TargetType: destination.TargetType,
		TargetAddr: destination.TargetAddr,
		Direction:  Event_Outgoing,
	}).Where("acked_at IS NULL").Error

	if err != nil {
		return nil, err
	}

	return events, nil
}

func (e Event) PushPriority() push.Priority {
	switch e.Kind {
	case Kind_ConversationInvite,
		Kind_ConversationNewMessage,
		Kind_ContactRequestAccepted:
		return push.Priority_Normal
	}

	return push.Priority_Low
}

func (e Event) ToConversationID() string {
	if e.TargetType == Event_ToSpecificConversation {
		return e.TargetAddr
	}
	return ""
}

func (e Event) ToContactID() string {
	// FIXME: query contact based on device
	//        -> if e.TargetType == Event_ToSpecificDevice {

	if e.TargetType == Event_ToSpecificContact {
		return e.TargetAddr
	}
	return ""
}

func (e Event) ToDeviceID() string {
	if e.TargetType == Event_ToSpecificDevice {
		return e.TargetAddr
	}
	return ""
}

func (e *Event) SetAckedAt(t time.Time) *Event {
	e.AckedAt = &t
	return e
}

func (e *Event) SetToContactID(id string) *Event {
	e.TargetType = Event_ToSpecificContact
	e.TargetAddr = id
	return e
}

func (e *Event) SetToContact(conv *Contact) *Event {
	return e.SetToContactID(conv.ID)
}

func (e *Event) SetToConversationID(id string) *Event {
	e.TargetType = Event_ToSpecificConversation
	e.TargetAddr = id
	return e
}

func (e *Event) SetToConversation(conv *Conversation) *Event {
	return e.SetToConversationID(conv.ID)
}

func (e *Event) SetToAllContacts() *Event {
	e.TargetType = Event_ToAllContacts
	return e
}

func (e *Event) SetToDeviceID(id string) *Event {
	e.TargetType = Event_ToSpecificDevice
	e.TargetAddr = id
	return e
}

func (e *Event) SetToDevice(conv *Device) *Event {
	return e.SetToDeviceID(conv.ID)
}

func (e *Event) SetErr(err error) *Event {
	if err != nil {
		// FIXME: enrich error -> consider extract the pkg/errorcodes logic somewhere
		e.ErrProxy = &Err{
			ErrMsg: err.Error(),
		}
	}
	return e
}

func (e *Event) Err() error {
	if e.ErrProxy != nil {
		return e.ErrProxy
	}
	return nil
}
