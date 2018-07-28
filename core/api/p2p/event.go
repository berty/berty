package p2p

import "time"

func NewOutgoingEvent(sender, receiver string, kind Kind) *Event {
	return &Event{
		SenderAPIVersion: Version,
		CreatedAt:        time.Now(),
		Kind:             kind,
		SenderID:         sender,
		ReceiverID:       receiver,
		Direction:        Event_Outgoing,
	}
}

func (e *Event) Validate() error {
	// FIXME: generate validation
	return nil
}
