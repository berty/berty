package p2p

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
)

func NewOutgoingEvent(sender, receiver string, kind Kind) *Event {
	return &Event{
		SenderAPIVersion: Version,
		CreatedAt:        time.Now().UTC(),
		Kind:             kind,
		SenderID:         sender,
		ReceiverID:       receiver,
		Direction:        Event_Outgoing,
	}
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
		DeletedAt:          e.DeletedAt,
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

func (e Event) IsNode() {} // required by gqlgen

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
		return nil, errors.Wrap(err, "unable to get non acknowledged events")
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
