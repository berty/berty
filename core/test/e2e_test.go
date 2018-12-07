package test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/network/mock"
	p2pnet "berty.tech/core/network/p2p"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/testrunner"
	"github.com/libp2p/go-libp2p-kad-dht"
	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
)

func init() {
	testrunner.InitLogger()
}

func TestWithEnqueuer(t *testing.T) {
	var (
		alice, bob, eve *AppMock
		err             error
		internalCtx     = context.Background()
	)

	defer func() {
		if alice != nil {
			alice.Close()
		}
		if bob != nil {
			bob.Close()
		}
		if eve != nil {
			eve.Close()
		}
	}()

	everythingWentFine()

	//
	// let's test
	//
	Convey("End-to-end test (with enqueuer network mock)", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
			shouldIContinue(t)

			alice, err = NewAppMock(&entity.Device{Name: "Alice's iPhone"}, mock.NewEnqueuer(context.Background()))
			So(err, ShouldBeNil)
			So(alice.InitEventStream(), ShouldBeNil)

			bob, err = NewAppMock(&entity.Device{Name: "iPhone de Bob"}, mock.NewEnqueuer(context.Background()))
			So(err, ShouldBeNil)
			So(bob.InitEventStream(), ShouldBeNil)

			eve, err = NewAppMock(&entity.Device{Name: "Eve"}, mock.NewEnqueuer(context.Background()))
			So(err, ShouldBeNil)
			So(eve.InitEventStream(), ShouldBeNil)

			everythingWentFine()
		})

		Convey("Test enqueuer system", FailureHalts, func() {
			shouldIContinue(t)

			for i := 0; i < 100; i++ {
				{
					event := alice.node.NewContactEvent(alice.ctx, &entity.Contact{ID: bob.node.DeviceID()}, p2p.Kind_DevtoolsMapset)
					So(event.SetAttrs(&p2p.DevtoolsMapsetAttrs{Key: "test", Val: fmt.Sprintf("%d", i)}), ShouldBeNil)
					res, err := bob.node.HandleEvent(alice.ctx, event.Copy())
					So(err, ShouldBeNil)
					So(res, ShouldResemble, &node.Void{})
				}
				{
					So(bob.node.DevtoolsMapget("test"), ShouldEqual, fmt.Sprintf("%d", i))
					envelope := <-bob.networkDriver.(*mock.Enqueuer).Queue()
					event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
					So(true, ShouldBeIn, err == nil, errorcodes.ErrEnvelopeUntrusted.Is(err))
					So(event.Kind, ShouldEqual, p2p.Kind_Ack)
					//jsonPrintIndent(event)
				}
				{
					in, out, err := asyncEventsWithTimeout(bob.eventStream, 2)
					So(err, ShouldBeNil)
					So(len(in), ShouldEqual, 1)
					So(len(out), ShouldEqual, 1)
					So(in[0].Kind, ShouldEqual, p2p.Kind_DevtoolsMapset)
					So(out[0].Kind, ShouldEqual, p2p.Kind_Ack)
				}
			}
			So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 0, 0, 0})
			everythingWentFine()
		})
		Convey("Nodes should be empty when just initialized", FailureHalts, func() {
			So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 0, 0, 0})

			Convey("Alice should only know itself", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := alice.client.ContactList(internalCtx, &node.ContactListInput{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

				So(contacts[0].DisplayName, ShouldEqual, "Alice")
				So(contacts[0].ID, ShouldEqual, alice.node.UserID())
				So(contacts[0].DisplayStatus, ShouldEqual, "")
				So(contacts[0].Status, ShouldEqual, entity.Contact_Myself)
				So(len(contacts[0].Devices), ShouldEqual, 1)
				So(contacts[0].Devices[0].Name, ShouldEqual, "Alice's iPhone")
				So(contacts[0].Devices[0].Status, ShouldEqual, entity.Device_Myself)
				So(contacts[0].Devices[0].ApiVersion, ShouldEqual, p2p.Version)
				So(contacts[0].Devices[0].ID, ShouldEqual, alice.node.DeviceID())
				So(contacts[0].Devices[0].ContactID, ShouldEqual, alice.node.UserID())

				everythingWentFine()
			})
			Convey("Bob should only know itself", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := bob.client.ContactList(internalCtx, &node.ContactListInput{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

				So(contacts[0].DisplayName, ShouldEqual, "Bob")
				So(contacts[0].ID, ShouldEqual, bob.node.UserID())
				So(contacts[0].DisplayStatus, ShouldEqual, "")
				So(contacts[0].Status, ShouldEqual, entity.Contact_Myself)
				So(len(contacts[0].Devices), ShouldEqual, 1)
				So(contacts[0].Devices[0].Name, ShouldEqual, "iPhone de Bob")
				So(contacts[0].Devices[0].Status, ShouldEqual, entity.Device_Myself)
				So(contacts[0].Devices[0].ApiVersion, ShouldEqual, p2p.Version)
				So(contacts[0].Devices[0].ID, ShouldEqual, bob.node.DeviceID())
				So(contacts[0].Devices[0].ContactID, ShouldEqual, bob.node.UserID())

				everythingWentFine()
			})
			Convey("Eve should only know itself", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := eve.client.ContactList(internalCtx, &node.ContactListInput{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

				So(contacts[0].DisplayName, ShouldEqual, "Eve")
				So(contacts[0].ID, ShouldEqual, eve.node.UserID())
				So(contacts[0].DisplayStatus, ShouldEqual, "")
				So(contacts[0].Status, ShouldEqual, entity.Contact_Myself)
				So(len(contacts[0].Devices), ShouldEqual, 1)
				So(contacts[0].Devices[0].Name, ShouldEqual, "Eve")
				So(contacts[0].Devices[0].Status, ShouldEqual, entity.Device_Myself)
				So(contacts[0].Devices[0].ApiVersion, ShouldEqual, p2p.Version)
				So(contacts[0].Devices[0].ID, ShouldEqual, eve.node.DeviceID())
				So(contacts[0].Devices[0].ContactID, ShouldEqual, eve.node.UserID())
				everythingWentFine()
			})

		})
		Convey("Alice adds Bob as contact", FailureHalts, func() {

			Convey("Alice calls node.ContactRequest", FailureHalts, func() {
				shouldIContinue(t)

				res, err := alice.client.Node().ContactRequest(internalCtx, &node.ContactRequestInput{
					Contact: &entity.Contact{
						OverrideDisplayName: "Bob from school",
						ID:                  bob.node.UserID(),
					},
					IntroText: "hello, I want to chat!",
				})
				So(err, ShouldBeNil)
				So(res.Status, ShouldEqual, entity.Contact_IsRequested)
				So(res.OverrideDisplayName, ShouldEqual, "Bob from school")
				So(res.DisplayName, ShouldBeEmpty)
				So(res.DisplayStatus, ShouldBeEmpty)
				So(len(res.Devices), ShouldEqual, 0)

				in, out, err := asyncEventsWithTimeout(alice.eventStream, 1)
				So(err, ShouldBeNil)
				So(len(in), ShouldEqual, 0)
				So(len(out), ShouldEqual, 1)
				So(out[0].Kind, ShouldEqual, p2p.Kind_ContactRequest)

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{1, 0, 0, 0, 0, 0})

				everythingWentFine()
			})
			Convey("Alice has en entry in sql for Bob", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := alice.client.ContactList(internalCtx, &node.ContactListInput{
					Filter: &entity.Contact{Status: entity.Contact_IsRequested},
				})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1)

				So(contacts[0].DisplayName, ShouldBeEmpty)
				So(contacts[0].OverrideDisplayName, ShouldEqual, "Bob from school")
				So(contacts[0].ID, ShouldEqual, bob.node.UserID())
				So(contacts[0].DisplayStatus, ShouldBeEmpty)
				So(contacts[0].Status, ShouldEqual, entity.Contact_IsRequested)
				So(len(contacts[0].Devices), ShouldEqual, 0)

				everythingWentFine()
			})
			Convey("Alice sends a ContactRequest event to Bob", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(err, ShouldBeNil)

				So(event.Author(), ShouldEqual, alice.node.UserID())
				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				So(event.Kind, ShouldEqual, p2p.Kind_ContactRequest)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				attrs, err := event.GetContactRequestAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.DisplayName, ShouldEqual, "Alice")
				So(attrs.Me.ID, ShouldEqual, alice.node.UserID())
				So(attrs.Me.Status, ShouldEqual, entity.Contact_Unknown)
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)
				So(attrs.Me.Devices, ShouldBeNil)
				So(attrs.IntroText, ShouldEqual, "hello, I want to chat!")
				// unary call
				res, err := bob.node.HandleEvent(alice.ctx, event.Copy())
				// FIXME: we should call an internal function in node that calls HandleEvent
				//        and automatically mark the event as acked when unary responds
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 1, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Bob emits the ContactRequest event to its client", FailureHalts, func() {
				shouldIContinue(t)

				in, out, err := asyncEventsWithTimeout(bob.eventStream, 2)
				So(err, ShouldBeNil)
				So(len(in), ShouldEqual, 1)
				So(len(out), ShouldEqual, 1)
				event := in[0]

				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Incoming)
				So(event.Kind, ShouldEqual, p2p.Kind_ContactRequest)
				So(event.SenderAPIVersion, ShouldEqual, p2p.Version)
				So(event.ReceiverAPIVersion, ShouldEqual, p2p.Version)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				attrs, err := event.GetContactRequestAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.ID, ShouldEqual, alice.node.UserID())
				So(attrs.Me.DisplayName, ShouldEqual, "Alice")
				So(attrs.Me.Status, ShouldEqual, entity.Contact_Unknown)
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)
				So(attrs.Me.Devices, ShouldBeNil)
				So(attrs.IntroText, ShouldEqual, "hello, I want to chat!")
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 1, 0, 0, 0})

				everythingWentFine()
			})
			Convey("Bob replies an Ack event to Alice's ContactRequest", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(errorcodes.ErrEnvelopeUntrusted.Is(err), ShouldBeTrue)

				So(event.Author(), ShouldEqual, bob.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)
				// FIXME: check that event is not acked in db
				res, err := alice.node.HandleEvent(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 1, 0, 0, 0, 0})
				// FIXME: check that event is acked in db

				everythingWentFine()
			})
			Convey("Bob has en entry in sql for Alice", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := bob.client.ContactList(internalCtx, &node.ContactListInput{
					Filter: &entity.Contact{DisplayName: "Alice"},
				})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1)

				So(contacts[0].DisplayName, ShouldEqual, "Alice")
				So(contacts[0].OverrideDisplayName, ShouldBeEmpty)
				So(contacts[0].ID, ShouldEqual, alice.node.UserID())
				So(contacts[0].DisplayStatus, ShouldBeEmpty)
				So(contacts[0].Status, ShouldEqual, entity.Contact_RequestedMe)
				So(len(contacts[0].Devices), ShouldEqual, 1)

				everythingWentFine()
			})
			Convey("Bob calls node.ContactAcceptRequest", FailureHalts, func() {
				shouldIContinue(t)

				res, err := bob.client.Node().ContactAcceptRequest(internalCtx, &entity.Contact{
					ID: alice.node.UserID(),
				})
				So(err, ShouldBeNil)
				So(res.Status, ShouldEqual, entity.Contact_IsFriend)
				So(res.DisplayName, ShouldEqual, "Alice")
				So(res.OverrideDisplayName, ShouldBeEmpty)
				So(res.DisplayStatus, ShouldBeEmpty)
				So(len(res.Devices), ShouldEqual, 1)
				So(res.Devices[0].ID, ShouldEqual, alice.node.UserID())

				time.Sleep(time.Second * 1)

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 1, 2, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Bob sends a ContactRequestAccepted event to Alice", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(errorcodes.ErrEnvelopeUntrusted.Is(err), ShouldBeTrue)

				So(event.Kind, ShouldEqual, p2p.Kind_ContactRequestAccepted)
				So(event.SenderAPIVersion, ShouldEqual, p2p.Version)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				_, err = event.GetContactRequestAcceptedAttrs()
				So(err, ShouldBeNil)

				res, err := alice.node.HandleEvent(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{2, 4, 1, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Alice emits the ContactRequestAccepted event to its clients", FailureHalts, func() {
				shouldIContinue(t)

				in, out, err := asyncEventsWithTimeout(alice.eventStream, 3)
				So(err, ShouldBeNil)
				So(len(in), ShouldEqual, 1)
				So(len(out), ShouldEqual, 2)
				event := in[0]

				//jsonPrintIndent(event)

				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_ContactRequestAccepted)
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Incoming)
				_, err = event.GetContactRequestAcceptedAttrs()
				So(err, ShouldBeNil)
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{2, 1, 1, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Bob sends a ContactShareMe event to Alice", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(errorcodes.ErrEnvelopeUntrusted.Is(err), ShouldBeTrue)

				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.DisplayName, ShouldEqual, "Bob")
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)

				res, err := alice.node.HandleEvent(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{3, 3, 0, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Alice emits the ContactShareMe event to its client", FailureHalts, func() {
				shouldIContinue(t)

				in, out, err := asyncEventsWithTimeout(alice.eventStream, 2)
				So(err, ShouldBeNil)
				So(len(in), ShouldEqual, 1)
				So(len(out), ShouldEqual, 1)
				event := in[0]

				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Incoming)
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.DisplayName, ShouldEqual, "Bob")
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{3, 1, 0, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Alice sends a ContactShareMe event to Bob", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(err, ShouldBeNil)

				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.ID, ShouldEqual, alice.node.UserID())
				So(attrs.Me.Status, ShouldEqual, entity.Contact_Unknown)
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)

				res, err := bob.node.HandleEvent(alice.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{2, 1, 1, 4, 0, 0})

				everythingWentFine()
			})
			Convey("Alice replies an Ack event to Bob's ContactRequestAccepted", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(err, ShouldBeNil)

				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)

				res, err := bob.node.HandleEvent(alice.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{1, 1, 1, 5, 0, 0})

				everythingWentFine()
			})
			Convey("Alice replies an Ack event to Bob's ContactShareMe", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(err, ShouldBeNil)

				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)

				res, err := bob.node.HandleEvent(alice.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 1, 1, 6, 0, 0})

				everythingWentFine()
			})
			Convey("Bob replies an Ack event to Alice's ContactShareMe", FailureHalts, func() {
				shouldIContinue(t)

				envelope := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				event, err := alice.node.OpenEnvelope(alice.ctx, envelope)
				So(errorcodes.ErrEnvelopeUntrusted.Is(err), ShouldBeTrue)

				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)

				res, err := alice.node.HandleEvent(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &node.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 2, 0, 6, 0, 0})

				everythingWentFine()
			})
			Convey("Bob emits the ContactShareMe event to its client", FailureHalts, func() {
				shouldIContinue(t)

				in, out, err := asyncEventsWithTimeout(bob.eventStream, 4)
				So(err, ShouldBeNil)
				So(len(in), ShouldEqual, 1)
				So(len(out), ShouldEqual, 3)
				event := in[0]

				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Incoming)
				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.SenderAPIVersion, ShouldEqual, p2p.Version)
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.ID, ShouldEqual, alice.node.UserID())
				So(attrs.Me.DisplayName, ShouldEqual, "Alice")
				So(attrs.Me.Status, ShouldEqual, entity.Contact_Unknown)
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)
				So(attrs.Me.Devices, ShouldBeNil)
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 2, 0, 2, 0, 0})

				everythingWentFine()
			})
			Convey("Alice has Bob as friend", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := alice.client.ContactList(internalCtx, &node.ContactListInput{
					Filter: &entity.Contact{Status: entity.Contact_IsFriend},
				})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1)

				// bob
				So(contacts[0].ID, ShouldNotBeEmpty)
				So(contacts[0].DisplayName, ShouldEqual, "Bob")
				So(contacts[0].OverrideDisplayName, ShouldEqual, "Bob from school")
				//So(contacts[0].Devices[0].ID, ShouldEqual, bob.node.UserID())
				So(contacts[0].Status, ShouldEqual, entity.Contact_IsFriend)
				So(contacts[0].DisplayStatus, ShouldBeEmpty)
				//So(contacts[0].Devices[0].Key, ShouldNotBeNil)

				everythingWentFine()
			})
			Convey("Bob has Alice as friend", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := bob.client.ContactList(internalCtx, &node.ContactListInput{
					Filter: &entity.Contact{Status: entity.Contact_IsFriend},
				})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1)

				// alice
				So(contacts[0].ID, ShouldNotBeEmpty)
				So(contacts[0].DisplayName, ShouldEqual, "Alice")
				So(contacts[0].Status, ShouldEqual, entity.Contact_IsFriend)
				So(contacts[0].DisplayStatus, ShouldBeEmpty)
				So(contacts[0].OverrideDisplayName, ShouldBeEmpty)
				So(contacts[0].Devices[0].ID, ShouldEqual, alice.node.UserID())
				//So(contacts[1].Devices[0].Key, ShouldNotBeNil)

				everythingWentFine()
			})
			Convey("Eve has no friend", FailureHalts, func() {
				shouldIContinue(t)

				contacts, err := eve.client.ContactList(internalCtx, &node.ContactListInput{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 1)
			})
			Convey("All sent events are acked and queues are empty", FailureHalts, nil)
		})
		Convey("Bob pings Alice", FailureHalts, func() {
			Convey("TODO", FailureHalts, nil)
		})
		Convey("Bob creates a new conversation with Alice", FailureHalts, func() {
			Convey("TODO", FailureHalts, nil)
		})
		Convey("Test multi-devices", FailureHalts, func() {
			Convey("TODO", FailureHalts, nil)
		})
		Convey("Test synchronous messages", FailureHalts, func() {
			Convey("TODO", FailureHalts, nil)
		})
		Convey("Test asynchronous messages", FailureHalts, func() {
			Convey("TODO", FailureHalts, nil)
		})
	})
}

func TestAliasesFlow(t *testing.T) {
	var (
		alice, bob  *AppMock
		err         error
		internalCtx = context.Background()
		res         interface{}
		envelope    *p2p.Envelope
	)

	defer func() {
		if alice != nil {
			alice.Close()
		}
		if bob != nil {
			bob.Close()
		}
	}()

	timeBetweenSteps := 150 * time.Millisecond

	Convey("Test renew aliases via mock.NewEnqueuer", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
			everythingWentFine()

			network := mock.NewSimple()
			aliceNetwork := network.Driver()
			alice, err = NewAppMock(&entity.Device{Name: "Alice's iPhone"}, aliceNetwork, WithUnencryptedDb())
			So(err, ShouldBeNil)
			So(alice.InitEventStream(), ShouldBeNil)

			bobNetwork := network.Driver()
			bob, err = NewAppMock(&entity.Device{Name: "iPhone de Bob"}, bobNetwork, WithUnencryptedDb())
			So(err, ShouldBeNil)
			So(bob.InitEventStream(), ShouldBeNil)

			network.AddPeer(aliceNetwork)
			network.AddPeer(bobNetwork)

			everythingWentFine()
		})

		Convey("Alice adds Bob as a friend and init a conversation", FailureHalts, func() {

			contacts, err := alice.client.ContactList(internalCtx, &node.ContactListInput{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

			contacts, err = bob.client.ContactList(internalCtx, &node.ContactListInput{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

			shouldIContinue(t)
			res, err = alice.client.Node().ContactRequest(internalCtx, &node.ContactRequestInput{
				Contact: &entity.Contact{
					OverrideDisplayName: "Bob from school",
					ID:                  bob.node.UserID(),
				},
				IntroText: "hello, I want to chat!",
			})

			So(err, ShouldBeNil)
			time.Sleep(timeBetweenSteps)

			contacts, err = alice.client.ContactList(internalCtx, &node.ContactListInput{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 2) // 'myself' is the only known contact

			contacts, err = bob.client.ContactList(internalCtx, &node.ContactListInput{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 2) // 'myself' is the only known contact

			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			time.Sleep(timeBetweenSteps)

			res, err = bob.client.Node().ContactAcceptRequest(internalCtx, &entity.Contact{
				ID: alice.node.UserID(),
			})

			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			time.Sleep(timeBetweenSteps)

			contacts, err = alice.client.ContactList(internalCtx, &node.ContactListInput{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 2)

			contacts, err = bob.client.ContactList(internalCtx, &node.ContactListInput{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 2)

			_, err = bob.client.Node().ConversationCreate(internalCtx, &node.ConversationCreateInput{
				Title: "Alice & Bob",
				Topic: "hey!",
				Contacts: []*entity.Contact{
					{ID: alice.node.UserID()},
				},
			})

			So(err, ShouldBeNil)

			time.Sleep(200 * time.Millisecond)

			conversations, err := bob.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			conversations, err = alice.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			everythingWentFine()
		})

		Convey("Check that bob emitted non aliased messages", FailureHalts, func() {
			shouldIContinue(t)

			envelope = bob.networkDriver.(*mock.SimpleDriver).GetLastSentEnvelope()
			So(envelope.Source, ShouldEqual, bob.node.UserID())

			envelope = bob.networkDriver.(*mock.SimpleDriver).GetLastReceivedEnvelope()
			So(envelope.Source, ShouldEqual, alice.node.UserID())

			everythingWentFine()
		})

		Convey("Alice send initial aliases to Bob and sends an aliased message to Bob", FailureHalts, func() {
			shouldIContinue(t)

			alias, err := alice.node.GenerateAliasForContact(alice.ctx, bob.node.UserID())
			So(err, ShouldBeNil)

			time.Sleep(timeBetweenSteps)

			_, err = alice.client.Node().ConversationCreate(internalCtx, &node.ConversationCreateInput{
				Title: "Alice & Bob 2",
				Topic: "hey! oh!",
				Contacts: []*entity.Contact{
					{ID: bob.node.UserID()},
				},
			})

			So(err, ShouldBeNil)
			time.Sleep(timeBetweenSteps)

			conversations, err := bob.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 2)

			conversations, err = alice.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 2)

			envelope = bob.networkDriver.(*mock.SimpleDriver).GetLastReceivedEnvelope()
			So(envelope.Source, ShouldEqual, alias.AliasIdentifier)

			envelope = alice.networkDriver.(*mock.SimpleDriver).GetLastSentEnvelope()
			So(envelope.Source, ShouldEqual, alias.AliasIdentifier)

			err = alice.node.SenderAliasesRenew(alice.ctx)

			So(err, ShouldBeNil)

			time.Sleep(timeBetweenSteps)

			_, err = alice.client.Node().ConversationCreate(internalCtx, &node.ConversationCreateInput{
				Title: "Alice & Bob 3",
				Topic: "hey! oh! let's go",
				Contacts: []*entity.Contact{
					{ID: bob.node.UserID()},
				},
			})

			So(err, ShouldBeNil)
			time.Sleep(timeBetweenSteps)

			conversations, err = bob.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 3)

			conversations, err = alice.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 3)

			envelope = bob.networkDriver.(*mock.SimpleDriver).GetLastReceivedEnvelope()
			So(envelope.Source, ShouldNotEqual, alias.AliasIdentifier)
			So(envelope.Source, ShouldNotEqual, alice.node.UserID())

			envelope = alice.networkDriver.(*mock.SimpleDriver).GetLastSentEnvelope()
			So(envelope.Source, ShouldNotEqual, alias.AliasIdentifier)
			So(envelope.Source, ShouldNotEqual, alice.node.UserID())

			everythingWentFine()
		})
	})
}

func setupP2PNetwork(bootstrap ...string) (*p2pnet.Driver, error) {
	var (
		driver *p2pnet.Driver
		err    error
	)

	var bootstrapConfig = &dht.BootstrapConfig{
		Queries: 5,
		Period:  time.Duration(time.Second),
		Timeout: time.Duration(10 * time.Second),
	}

	driver, err = p2pnet.NewDriver(
		context.Background(),
		p2pnet.WithRandomIdentity(),
		p2pnet.WithDefaultMuxers(),
		p2pnet.WithDefaultPeerstore(),
		p2pnet.WithDefaultSecurity(),
		p2pnet.WithDefaultTransports(),
		p2pnet.WithDHTBoostrapConfig(bootstrapConfig),
		p2pnet.WithListenAddrStrings("/ip4/127.0.0.1/tcp/0"),
		p2pnet.WithBootstrapSync(bootstrap...),
	)
	if err != nil {
		return nil, err
	}
	go func() {
		if err := driver.Start(context.Background()); err != nil {
			logger().Error("driver start error", zap.Error(err))
		}
	}()
	return driver, nil
}

func getBoostrap(d *p2pnet.Driver) []string {
	addrs := d.Addrs()
	bootstrap := make([]string, len(addrs))

	for i, a := range addrs {
		bootstrap[i] = fmt.Sprintf("%s/ipfs/%s", a.String(), d.ID(context.Background()).ID)
	}

	return bootstrap
}

func TestWithSimpleNetwork(t *testing.T) {
	var (
		alice, bob, eve *AppMock
		err             error
	)
	defer func() {
		if alice != nil {
			alice.Close()
		}
		if bob != nil {
			bob.Close()
		}
		if eve != nil {
			eve.Close()
		}
	}()

	everythingWentFine()

	Convey("End-to-end test (with simple network mock)", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
			shouldIContinue(t)

			network := mock.NewSimple()
			aliceNetwork := network.Driver()
			alice, err = NewAppMock(&entity.Device{Name: "Alice's iPhone"}, aliceNetwork)
			So(err, ShouldBeNil)

			bobNetwork := network.Driver()
			bob, err = NewAppMock(&entity.Device{Name: "iPhone de Bob"}, bobNetwork)
			So(err, ShouldBeNil)

			eveNetwork := network.Driver()
			eve, err = NewAppMock(&entity.Device{Name: "Eve"}, eveNetwork)
			So(err, ShouldBeNil)

			network.AddPeer(aliceNetwork)
			network.AddPeer(bobNetwork)
			network.AddPeer(eveNetwork)

			So(alice.InitEventStream(), ShouldBeNil)
			So(bob.InitEventStream(), ShouldBeNil)
			So(eve.InitEventStream(), ShouldBeNil)

			everythingWentFine()
		})
		scenario(t, alice, bob, eve)
	})
}

func TestNodesWithP2PNetwork(t *testing.T) {
	var (
		aliceNetwork, bobNetwork, eveNetwork *p2pnet.Driver
		alice, bob, eve                      *AppMock
		err                                  error
	)

	everythingWentFine()

	Convey("End-to-end test (with p2p network)", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
			shouldIContinue(t)

			aliceNetwork, err = setupP2PNetwork()
			So(err, ShouldBeNil)

			bootstrap := getBoostrap(aliceNetwork)

			bobNetwork, err = setupP2PNetwork(bootstrap...)
			So(err, ShouldBeNil)
			eveNetwork, err = setupP2PNetwork(bootstrap...)
			So(err, ShouldBeNil)

			bob, err = NewAppMock(&entity.Device{Name: "Bob"}, bobNetwork)
			So(err, ShouldBeNil)
			alice, err = NewAppMock(&entity.Device{Name: "Alice"}, aliceNetwork)
			So(err, ShouldBeNil)
			eve, err = NewAppMock(&entity.Device{Name: "Eve"}, eveNetwork)
			So(err, ShouldBeNil)

			So(bob.InitEventStream(), ShouldBeNil)
			So(alice.InitEventStream(), ShouldBeNil)
			So(eve.InitEventStream(), ShouldBeNil)

			everythingWentFine()
		})
		scenario(t, alice, bob, eve)
	})
}
