package mini

import (
	"time"
)

type messageType uint64

const (
	messageTypeMeta messageType = iota + 1
	messageTypeMessage
	messageTypeError
)

type historyMessage struct {
	messageType messageType
	sender      []byte
	receivedAt  time.Time
	payload     []byte
}

func (h *historyMessage) Text() string {
	return string(h.payload)
}

func (h *historyMessage) Timestamp() string {
	receivedAt := "00:00:00"
	if !h.receivedAt.IsZero() {
		receivedAt = h.receivedAt.Format("15:04:05")
	}

	return receivedAt
}

func (h *historyMessage) Sender() string {
	sender := "--------"
	if len(h.sender) > 0 {
		sender = pkAsShortID(h.sender)
	}

	return sender
}
