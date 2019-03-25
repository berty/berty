package entity

import (
	"fmt"
	"testing"
	"time"

	"berty.tech/core/test/mock"
	"github.com/jinzhu/gorm"
)

func setupNonAcknowledgedEventDestinations() (string, *gorm.DB, time.Time, time.Time, time.Time) {
	filename, db, _ := mock.GetMockedDb(Event{}, EventDispatch{})

	now := time.Now()
	past := now.Add(-time.Second)
	future := now.Add(time.Second)

	db.Save(&Event{ID: "Event1", Direction: Event_Outgoing, TargetType: Event_ToSpecificContact, TargetAddr: "Receiver1", SentAt: &past})
	db.Save(&Event{ID: "Event2", Direction: Event_Outgoing, TargetType: Event_ToSpecificContact, TargetAddr: "Receiver1", SentAt: &future})
	db.Save(&Event{ID: "Event3", Direction: Event_Outgoing, TargetType: Event_ToSpecificContact, TargetAddr: "Receiver2", SentAt: &future})

	db.Save(&Event{ID: "Event4", Direction: Event_Incoming, TargetType: Event_ToSpecificContact, TargetAddr: "Receiver1", SentAt: &past})
	db.Save(&Event{ID: "Event5", Direction: Event_Incoming, TargetType: Event_ToSpecificContact, TargetAddr: "Receiver1", SentAt: &future})
	db.Save(&Event{ID: "Event6", Direction: Event_Incoming, TargetType: Event_ToSpecificContact, TargetAddr: "Receiver2", SentAt: &future})

	db.Save(&Event{ID: "Event7", Direction: Event_Outgoing, TargetType: Event_ToSpecificConversation, TargetAddr: "Conversation1", SentAt: &past})
	db.Save(&Event{ID: "Event8", Direction: Event_Outgoing, TargetType: Event_ToSpecificConversation, TargetAddr: "Conversation1", SentAt: &future})
	db.Save(&Event{ID: "Event9", Direction: Event_Outgoing, TargetType: Event_ToSpecificConversation, TargetAddr: "Conversation2", SentAt: &future})

	db.Save(&Event{ID: "Event10", Direction: Event_Incoming, TargetType: Event_ToSpecificConversation, TargetAddr: "Conversation1", SentAt: &past})
	db.Save(&Event{ID: "Event11", Direction: Event_Incoming, TargetType: Event_ToSpecificConversation, TargetAddr: "Conversation1", SentAt: &future})
	db.Save(&Event{ID: "Event12", Direction: Event_Incoming, TargetType: Event_ToSpecificConversation, TargetAddr: "Conversation2", SentAt: &future})

	return filename, db, past, now, future
}

func TestEventErr(t *testing.T) {
	event := NewEvent()

	if event.Err() != nil {
		t.Error(fmt.Errorf("event.Err() should be nil"))
	}

	event.SetErr(fmt.Errorf("beep boop"))

	if event.Err() == nil || event.Err().Error() != "beep boop" {
		t.Error(fmt.Errorf("event.Err() should be 'beep boop'"))
	}
}

func TestFindNonAcknowledgedEventDestinations(t *testing.T) {
	filename, db, _, now, _ := setupNonAcknowledgedEventDestinations()
	defer mock.RemoveDb(filename, db)

	expected := map[string]bool{
		"ToSpecificContact:Receiver1":          false,
		"ToSpecificConversation:Conversation1": false,
	}

	destinations, err := FindNonAcknowledgedEventDestinations(db, now)

	if err != nil {
		t.Error(err)
	}

	for _, destination := range destinations {
		identifier := fmt.Sprintf("%s:%s", destination.TargetType.String(), destination.TargetAddr)

		value, ok := expected[identifier]
		if ok == false {
			t.Error(fmt.Errorf("%s was not supposed to be found", identifier))
		}

		if value == true {
			t.Error(fmt.Errorf("%s was found twice", identifier))
		}

		expected[identifier] = true
	}

	for identifier, value := range expected {
		if value == false {
			t.Error(fmt.Errorf("%s was supposed to be found but was not", identifier))
		}
	}
}

func TestFindNonAcknowledgedEventsForDestination(t *testing.T) {
	filename, db, _, _, _ := setupNonAcknowledgedEventDestinations()
	defer mock.RemoveDb(filename, db)

	expected := map[string]bool{
		"Event1": false,
		"Event2": false,
	}

	events, err := FindNonAcknowledgedEventsForDestination(db, &Event{TargetType: Event_ToSpecificContact, TargetAddr: "Receiver1"})

	if err != nil {
		t.Error(err)
	}

	for _, event := range events {
		value, ok := expected[event.ID]
		if ok == false {
			t.Error(fmt.Errorf("%s was not suppoesed to be found", event.ID))
		}

		if value == true {
			t.Error(fmt.Errorf("%s was found twice", event.ID))
		}

		expected[event.ID] = true
	}

	for identifier, value := range expected {
		if value == false {
			t.Error(fmt.Errorf("%s was supposed to be found but was not", identifier))
		}
	}
}
