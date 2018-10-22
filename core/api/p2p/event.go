package p2p

import (
	"encoding/json"
	"strings"
	"time"
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
