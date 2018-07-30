package test

import (
	"context"
	"io"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/entity"
)

func Test(t *testing.T) {
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
	Convey("End-to-end test", t, func() {
		Convey("Initialize nodes", func() {
			alice, err = NewAppMock(&entity.Device{Name: "Alice's iPhone"})
			So(err, ShouldBeNil)

			bob, err = NewAppMock(&entity.Device{Name: "iPhone de Bob"})
			So(err, ShouldBeNil)

			eve, err = NewAppMock(&entity.Device{Name: "Eve"})
			So(err, ShouldBeNil)
		})

		Convey("Contact flow", FailureContinues, func() {
			Convey("Nodes should be empty when just initialized", FailureHalts, func() {
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 0, 0, 0})

				Convey("Alice should only know itself", FailureHalts, func() {
					// alice should only know itself
					stream, err := alice.client.Node().ContactList(internalCtx, &node.Void{})
					So(err, ShouldBeNil)
					contacts := []*entity.Contact{}
					for {
						contact, err := stream.Recv()
						if err == io.EOF {
							break
						}
						So(err, ShouldBeNil)
						contacts = append(contacts, contact)
					}
					So(len(contacts), ShouldEqual, 1)
				})
				Convey("Bob should only know istself", FailureHalts, nil)
				Convey("Eve should only know istself", FailureHalts, nil)
			})
			Convey("Alice adds Bob as contact", FailureHalts, func() {
				Convey("Alice calls node.ContactRequest", FailureHalts, func() {
					res, err := alice.client.Node().ContactRequest(internalCtx, &node.ContactRequestInput{
						Contact: &entity.Contact{
							OverrideDisplayName: "Bob from school",
							ID:                  bob.node.PeerID(),
						},
						IntroMessage: "hello, I want to chat!",
					})
					So(err, ShouldBeNil)
					So(res.Status, ShouldEqual, entity.Contact_IsRequested)
					So(res.OverrideDisplayName, ShouldEqual, "Bob from school")
					So(res.DisplayName, ShouldBeEmpty)
					So(res.DisplayStatus, ShouldBeEmpty)
					// FIXME: So(res.PeerID(), ShouldEqual, bob.node.PeerID())
					So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{1, 0, 0, 0, 0, 0})
				})
				Convey("Alice has en entry in sql for Bob", FailureHalts, nil)
				Convey("Alice sends a ContactRequest event to Bob", FailureHalts, nil)
				Convey("Bob emits the ContactRequest event to its client", FailureHalts, nil)
				Convey("Bob replies an Ack event to Alice's ContactRequest", FailureHalts, nil)
				Convey("Bob calls node.ContactAcceptRequest", FailureHalts, nil)
				Convey("Bob sends a ContactRequestAccepted event to Alice", FailureHalts, nil)
				Convey("Alice emits the ContactRequestAccepted event to its clients", FailureHalts, nil)
				Convey("Bob sends a ContactShareMe event to Alice", FailureHalts, nil)
				Convey("Alice emits the ContactShareMe event to its client", FailureHalts, nil)
				Convey("Alice sends a ContactShareMe event to Bob", FailureHalts, nil)
				Convey("Alice replies an Ack event to Bob's ContactRequestAccepted", FailureHalts, nil)
				Convey("Alice replies an Ack event to Bob's ContactShareMe", FailureHalts, nil)
				Convey("Bob replies an Ack event to Alice's ContactShareMe", FailureHalts, nil)
				Convey("Bob emits the ContactShareMe event to its client", FailureHalts, nil)
				Convey("Alice has Bob as friend", FailureHalts, nil)
				Convey("Bob has Alice as friend", FailureHalts, nil)
				Convey("Eve has no friend", FailureHalts, nil)
				Convey("All sent events are acked and queues are empty", FailureHalts, nil)
			})
			Convey("Bob pings Alice", FailureHalts, func() {
				Convey("TODO", FailureHalts, nil)
			})
			Convey("Bob creates a new conversation with Alice", FailureHalts, func() {
				Convey("TODO", FailureHalts, nil)
			})
		})
	})
}

func nodeChansLens(apps ...*AppMock) []int {
	out := []int{}
	for _, app := range apps {
		out = append(out, len(app.node.OutgoingEventsChan()))
		out = append(out, len(app.node.ClientEventsChan()))
	}
	return out
}
