package test

import (
	"fmt"
	"testing"
	"time"

	"berty.tech/core/entity"

	networkmock "berty.tech/core/network/mock"
	"github.com/pkg/errors"

	"berty.tech/core/api/p2p"
)

func setupNonAcknowledgedEventDestinations() (*AppMock, time.Time, time.Time, time.Time) {
	n, err := NewAppMock(&entity.Device{Name: "Alice's iPhone"}, networkmock.NewEnqueuer(), WithUnencryptedDb())

	if err != nil {
		panic(err)
	}

	now := time.Now()
	past := now.Add(-time.Second)
	future := now.Add(time.Second)

	n.db.Save(&p2p.Event{ID: "Event1", Direction: p2p.Event_Outgoing, ReceiverID: "Receiver1", SentAt: &past})
	n.db.Save(&p2p.Event{ID: "Event2", Direction: p2p.Event_Outgoing, ReceiverID: "Receiver1", SentAt: &future})
	n.db.Save(&p2p.Event{ID: "Event3", Direction: p2p.Event_Outgoing, ReceiverID: "Receiver2", SentAt: &future})

	n.db.Save(&p2p.Event{ID: "Event4", Direction: p2p.Event_Incoming, ReceiverID: "Receiver1", SentAt: &past})
	n.db.Save(&p2p.Event{ID: "Event5", Direction: p2p.Event_Incoming, ReceiverID: "Receiver1", SentAt: &future})
	n.db.Save(&p2p.Event{ID: "Event6", Direction: p2p.Event_Incoming, ReceiverID: "Receiver2", SentAt: &future})

	n.db.Save(&p2p.Event{ID: "Event7", Direction: p2p.Event_Outgoing, ConversationID: "Conversation1", SentAt: &past})
	n.db.Save(&p2p.Event{ID: "Event8", Direction: p2p.Event_Outgoing, ConversationID: "Conversation1", SentAt: &future})
	n.db.Save(&p2p.Event{ID: "Event9", Direction: p2p.Event_Outgoing, ConversationID: "Conversation2", SentAt: &future})

	n.db.Save(&p2p.Event{ID: "Event10", Direction: p2p.Event_Incoming, ConversationID: "Conversation1", SentAt: &past})
	n.db.Save(&p2p.Event{ID: "Event11", Direction: p2p.Event_Incoming, ConversationID: "Conversation1", SentAt: &future})
	n.db.Save(&p2p.Event{ID: "Event12", Direction: p2p.Event_Incoming, ConversationID: "Conversation2", SentAt: &future})

	return n, past, now, future
}

func TestEventRetry(t *testing.T) {
	appMock, _, now, _ := setupNonAcknowledgedEventDestinations()
	defer appMock.Close()

	expected := map[string]bool{
		"Event1": false,
		"Event2": false,
		"Event7": false,
		"Event8": false,
	}

	events, err := appMock.node.EventRetry(now)

	if err != nil {
		t.Error(err)
	}

	for _, event := range events {
		value, ok := expected[event.ID]
		if ok == false {
			t.Error(errors.New(fmt.Sprintf("%s was not suppoesed to be found", event.ID)))
		}

		if value == true {
			t.Error(errors.New(fmt.Sprintf("%s was found twice", event.ID)))
		}

		expected[event.ID] = true
	}

	for identifier, value := range expected {
		if value == false {
			t.Error(errors.New(fmt.Sprintf("%s was supposed to be found but was not", identifier)))
		}
	}

}
