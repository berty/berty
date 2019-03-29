package node

import (
	"context"
	"testing"

	"berty.tech/core/entity"

	. "github.com/smartystreets/goconvey/convey"
)

func makeEventDispatch(event *entity.Event, device *TestEnvDevice) *entity.EventDispatch {
	return &entity.EventDispatch{
		EventID:   event.ID,
		DeviceID:  device.Device.ID,
		ContactID: device.Device.ContactID,
	}
}

func TestHandleAckOneToOneConversation(t *testing.T) {
	Convey("Test handleAck one to one conversation single device", t, FailureHalts, func() {
		ctx := context.Background()
		env := NewTestEnv(ctx)
		defer env.Close()

		// Creating contacts, making them friends

		So(env.CreateBertyContacts("A", "B"), ShouldBeNil)
		So(env.Befriend("A", "B"), ShouldBeNil)

		deviceA := env.GetDevice("A")

		// Setting up test event and inserting it in A's database

		evt := env.ConversationEventFrom("A", "B").
			SetConversationNewMessageAttrs(&entity.ConversationNewMessageAttrs{Message: &entity.Message{Text: "hi"}})

		evtDispatch := makeEventDispatch(evt, env.GetDevice("B"))

		So(deviceA.DBInsert(evt), ShouldBeNil)
		So(deviceA.DBInsert(evtDispatch), ShouldBeNil)

		So(deviceA.DB.First(&evt, &entity.Event{ID: evt.ID}).Error, ShouldBeNil)
		So(evt.AckStatus, ShouldEqual, entity.Event_NotAcked)
		So(evt.AckedAt, ShouldBeNil)

		err := deviceA.DB.Find(&evtDispatch, evtDispatch).Error
		So(err, ShouldBeNil)
		So(evtDispatch.AckedAt, ShouldBeNil)

		// Handling ack event

		ackEvt := env.ConversationEventFrom("B", "A").
			SetAckAttrs(&entity.AckAttrs{IDs: []string{evt.ID}})

		err = deviceA.Node.handleAck(ctx, ackEvt)
		So(err, ShouldBeNil)

		// Checking values

		err = deviceA.DB.Find(&evtDispatch, evtDispatch).Error
		So(err, ShouldBeNil)
		So(evtDispatch.AckedAt, ShouldNotBeNil)

		So(deviceA.DB.First(&evt, &entity.Event{ID: evt.ID}).Error, ShouldBeNil)
		So(evt.AckedAt, ShouldNotBeNil)
		So(evt.AckStatus, ShouldEqual, entity.Event_AckedByAllDevices)
		So(len(deviceA.Node.clientEvents), ShouldEqual, 1)
	})
}

func TestHandleAckGroupConversation(t *testing.T) {
	Convey("Test handleAck one to one conversation single device", t, FailureHalts, func() {
		ctx := context.Background()
		env := NewTestEnv(ctx)
		defer env.Close()

		// Creating contacts, making them friends

		So(env.CreateBertyContacts("A", "B", "C"), ShouldBeNil)
		So(env.Befriend("A", "B"), ShouldBeNil)
		So(env.Befriend("A", "C"), ShouldBeNil)
		_, err := env.CreateGroupConversation("A", "B", "C")
		So(err, ShouldBeNil)

		deviceA := env.GetDevice("A")
		deviceB := env.GetDevice("B")
		deviceC := env.GetDevice("C")

		// Setting up test event and inserting it in A's database

		evt := env.ConversationEventFrom("A", "B", "C").
			SetConversationNewMessageAttrs(&entity.ConversationNewMessageAttrs{Message: &entity.Message{Text: "hi"}})
		evtDispatchB := makeEventDispatch(evt, env.GetDevice("B"))
		evtDispatchC := makeEventDispatch(evt, env.GetDevice("C"))

		So(deviceA.DBInsert(evt), ShouldBeNil)
		So(deviceA.DBInsert(evtDispatchB), ShouldBeNil)
		So(deviceA.DBInsert(evtDispatchC), ShouldBeNil)

		So(deviceA.DB.First(&evt, &entity.Event{ID: evt.ID}).Error, ShouldBeNil)
		So(evt.AckStatus, ShouldEqual, entity.Event_NotAcked)
		So(evt.AckedAt, ShouldBeNil)

		err = deviceA.DB.Find(&evtDispatchB, &entity.EventDispatch{EventID: evt.ID, DeviceID: deviceB.Device.ID}).Error
		So(err, ShouldBeNil)
		So(evtDispatchB.AckedAt, ShouldBeNil)

		err = deviceA.DB.Find(&evtDispatchC, &entity.EventDispatch{EventID: evt.ID, DeviceID: deviceC.Device.ID}).Error
		So(err, ShouldBeNil)
		So(evtDispatchC.AckedAt, ShouldBeNil)

		// Handling ack event from B

		ackEvt := env.ConversationEventFrom("B", "A", "C").
			SetAckAttrs(&entity.AckAttrs{IDs: []string{evt.ID}})

		err = deviceA.Node.handleAck(ctx, ackEvt)
		So(err, ShouldBeNil)

		// Checking values after ack from B

		err = deviceA.DB.Find(&evtDispatchB, &entity.EventDispatch{EventID: evt.ID, DeviceID: deviceB.Device.ID}).Error
		So(err, ShouldBeNil)
		So(evtDispatchB.AckedAt, ShouldNotBeNil)

		err = deviceA.DB.Find(&evtDispatchC, &entity.EventDispatch{EventID: evt.ID, DeviceID: deviceC.Device.ID}).Error
		So(err, ShouldBeNil)
		So(evtDispatchC.AckedAt, ShouldBeNil)

		So(deviceA.DB.First(&evt, &entity.Event{ID: evt.ID}).Error, ShouldBeNil)
		So(evt.AckedAt, ShouldBeNil)
		So(evt.AckStatus, ShouldEqual, entity.Event_AckedAtLeastOnce)
		So(len(deviceA.Node.clientEvents), ShouldEqual, 0)

		// Handling ack event from C

		ackEvt = env.ConversationEventFrom("C", "A", "B").
			SetAckAttrs(&entity.AckAttrs{IDs: []string{evt.ID}})

		err = deviceA.Node.handleAck(ctx, ackEvt)
		So(err, ShouldBeNil)

		// Checking values after ack from C

		err = deviceA.DB.Find(&evtDispatchB, &entity.EventDispatch{EventID: evt.ID, DeviceID: deviceB.Device.ID}).Error
		So(err, ShouldBeNil)
		So(evtDispatchB.AckedAt, ShouldNotBeNil)

		err = deviceA.DB.Find(&evtDispatchC, &entity.EventDispatch{EventID: evt.ID, DeviceID: deviceC.Device.ID}).Error
		So(err, ShouldBeNil)
		So(evtDispatchC.AckedAt, ShouldNotBeNil)

		So(deviceA.DB.First(&evt, &entity.Event{ID: evt.ID}).Error, ShouldBeNil)
		So(evt.AckedAt, ShouldNotBeNil)
		So(evt.AckStatus, ShouldEqual, entity.Event_AckedByAllDevices)
		So(len(deviceA.Node.clientEvents), ShouldEqual, 1)
	})
}
