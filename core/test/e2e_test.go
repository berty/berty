package test

import (
	"context"
	"fmt"
	"testing"
	"time"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
	"github.com/berty/berty/core/network/mock"
	p2pnet "github.com/berty/berty/core/network/p2p"
)

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

	setupTestLogging()

	// let's test

	Convey("End-to-end test (with enqueuer network mock)", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
			alice, err = NewAppMock(&entity.Device{Name: "Alice's iPhone"}, mock.NewEnqueuer())
			So(err, ShouldBeNil)

			bob, err = NewAppMock(&entity.Device{Name: "iPhone de Bob"}, mock.NewEnqueuer())
			So(err, ShouldBeNil)

			eve, err = NewAppMock(&entity.Device{Name: "Eve"}, mock.NewEnqueuer())
			So(err, ShouldBeNil)
		})

		Convey("Nodes should be empty when just initialized", FailureHalts, func() {
			So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 0, 0, 0})

			Convey("Alice should only know itself", FailureHalts, func() {
				contacts, err := alice.client.ContactList(internalCtx, &node.Void{})
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
			})
			Convey("Bob should only know itself", FailureHalts, func() {
				contacts, err := bob.client.ContactList(internalCtx, &node.Void{})
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
			})
			Convey("Eve should only know itself", FailureHalts, func() {
				contacts, err := eve.client.ContactList(internalCtx, &node.Void{})
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
			})
		})
		Convey("Alice adds Bob as contact", FailureHalts, func() {
			Convey("Alice calls node.ContactRequest", FailureHalts, func() {
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
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{1, 0, 0, 0, 0, 0})
			})
			Convey("Alice has en entry in sql for Bob", FailureHalts, func() {
				contacts, err := alice.client.ContactList(internalCtx, &node.Void{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 2)

				So(contacts[1].DisplayName, ShouldBeEmpty)
				So(contacts[1].OverrideDisplayName, ShouldEqual, "Bob from school")
				So(contacts[1].ID, ShouldEqual, bob.node.UserID())
				So(contacts[1].DisplayStatus, ShouldBeEmpty)
				So(contacts[1].Status, ShouldEqual, entity.Contact_IsRequested)
				So(len(contacts[1].Devices), ShouldEqual, 0)
			})
			Convey("Alice sends a ContactRequest event to Bob", FailureHalts, func() {
				event := <-alice.networkDriver.(*mock.Enqueuer).Queue()
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
				res, err := bob.node.Handle(alice.ctx, event.Copy())
				// FIXME: we should call an internal function in node that calls HandleEvent
				//        and automatically mark the event as acked when unary responds
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 1, 1, 0, 0})
			})
			Convey("Bob emits the ContactRequest event to its client", FailureHalts, func() {
				event := <-bob.node.ClientEventsChan()
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
			})
			Convey("Bob replies an Ack event to Alice's ContactRequest", FailureHalts, func() {
				event := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				So(event.Author(), ShouldEqual, bob.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)
				// FIXME: check that event is not acked in db
				res, err := alice.node.Handle(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 0, 0, 0})
				So(res, ShouldResemble, &p2p.Void{})
				// FIXME: check that event is acked in db
			})
			Convey("Bob has en entry in sql for Alice", FailureHalts, func() {
				contacts, err := bob.client.ContactList(internalCtx, &node.Void{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 2)

				So(contacts[1].DisplayName, ShouldEqual, "Alice")
				So(contacts[1].OverrideDisplayName, ShouldBeEmpty)
				So(contacts[1].ID, ShouldEqual, alice.node.UserID())
				So(contacts[1].DisplayStatus, ShouldBeEmpty)
				So(contacts[1].Status, ShouldEqual, entity.Contact_RequestedMe)
				So(len(contacts[1].Devices), ShouldEqual, 1)
			})
			Convey("Bob calls node.ContactAcceptRequest", FailureHalts, func() {
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
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 2, 0, 0, 0})
			})
			Convey("Bob sends a ContactRequestAccepted event to Alice", FailureHalts, func() {
				event := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				So(event.Kind, ShouldEqual, p2p.Kind_ContactRequestAccepted)
				So(event.SenderAPIVersion, ShouldEqual, p2p.Version)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				_, err := event.GetContactRequestAcceptedAttrs()
				So(err, ShouldBeNil)

				res, err := alice.node.Handle(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})

				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{2, 1, 1, 0, 0, 0})
			})
			Convey("Alice emits the ContactRequestAccepted event to its clients", FailureHalts, func() {
				event := <-alice.node.ClientEventsChan()
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_ContactRequestAccepted)
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Incoming)
				_, err := event.GetContactRequestAcceptedAttrs()
				So(err, ShouldBeNil)
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{2, 0, 1, 0, 0, 0})
			})
			Convey("Bob sends a ContactShareMe event to Alice", FailureHalts, func() {
				event := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.DisplayName, ShouldEqual, "Bob")
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)

				res, err := alice.node.Handle(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{3, 1, 0, 0, 0, 0})
			})
			Convey("Alice emits the ContactShareMe event to its client", FailureHalts, func() {
				event := <-alice.node.ClientEventsChan()
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Incoming)
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.DisplayName, ShouldEqual, "Bob")
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{3, 0, 0, 0, 0, 0})
			})
			Convey("Alice sends a ContactShareMe event to Bob", FailureHalts, func() {
				event := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_ContactShareMe)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetContactShareMeAttrs()
				So(err, ShouldBeNil)
				So(attrs.Me.ID, ShouldEqual, alice.node.UserID())
				So(attrs.Me.Status, ShouldEqual, entity.Contact_Unknown)
				So(attrs.Me.DisplayStatus, ShouldBeEmpty)

				res, err := bob.node.Handle(alice.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{2, 0, 1, 1, 0, 0})
			})
			Convey("Alice replies an Ack event to Bob's ContactRequestAccepted", FailureHalts, func() {
				event := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)

				res, err := bob.node.Handle(alice.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{1, 0, 1, 1, 0, 0})
			})
			Convey("Alice replies an Ack event to Bob's ContactShareMe", FailureHalts, func() {
				event := <-alice.networkDriver.(*mock.Enqueuer).Queue()
				So(event.SenderID, ShouldEqual, alice.node.UserID())
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.ReceiverID, ShouldEqual, bob.node.UserID())
				So(event.Direction, ShouldEqual, p2p.Event_Outgoing)
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)

				res, err := bob.node.Handle(alice.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 1, 1, 0, 0})
			})
			Convey("Bob replies an Ack event to Alice's ContactShareMe", FailureHalts, func() {
				event := <-bob.networkDriver.(*mock.Enqueuer).Queue()
				So(event.Kind, ShouldEqual, p2p.Kind_Ack)
				So(event.SenderID, ShouldEqual, bob.node.UserID())
				So(event.ReceiverID, ShouldEqual, alice.node.UserID())
				attrs, err := event.GetAckAttrs()
				So(err, ShouldBeNil)
				So(len(attrs.IDs), ShouldEqual, 1)

				res, err := alice.node.Handle(bob.ctx, event.Copy())
				So(err, ShouldBeNil)
				So(res, ShouldResemble, &p2p.Void{})
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 1, 0, 0})
			})
			Convey("Bob emits the ContactShareMe event to its client", FailureHalts, func() {
				event := <-bob.node.ClientEventsChan()
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
				So(nodeChansLens(alice, bob, eve), ShouldResemble, []int{0, 0, 0, 0, 0, 0})
			})
			Convey("Alice has Bob as friend", FailureHalts, func() {
				contacts, err := alice.client.ContactList(internalCtx, &node.Void{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 2)

				// myself
				So(contacts[0].DisplayName, ShouldEqual, "Alice")
				So(contacts[0].Status, ShouldEqual, entity.Contact_Myself)

				// bob
				So(contacts[1].ID, ShouldNotBeEmpty)
				So(contacts[1].DisplayName, ShouldEqual, "Bob")
				So(contacts[1].OverrideDisplayName, ShouldEqual, "Bob from school")
				//So(contacts[1].Devices[0].ID, ShouldEqual, bob.node.UserID())
				So(contacts[1].Status, ShouldEqual, entity.Contact_IsFriend)
				So(contacts[1].DisplayStatus, ShouldBeEmpty)
				//So(contacts[1].Devices[0].Key, ShouldNotBeNil)
			})
			Convey("Bob has Alice as friend", FailureHalts, func() {
				contacts, err := bob.client.ContactList(internalCtx, &node.Void{})
				So(err, ShouldBeNil)
				So(len(contacts), ShouldEqual, 2)

				// myself
				So(contacts[0].DisplayName, ShouldEqual, "Bob")
				So(contacts[0].Status, ShouldEqual, entity.Contact_Myself)

				// alice
				So(contacts[1].ID, ShouldNotBeEmpty)
				So(contacts[1].DisplayName, ShouldEqual, "Alice")
				So(contacts[1].Status, ShouldEqual, entity.Contact_IsFriend)
				So(contacts[1].DisplayStatus, ShouldBeEmpty)
				So(contacts[1].OverrideDisplayName, ShouldBeEmpty)
				So(contacts[1].Devices[0].ID, ShouldEqual, alice.node.UserID())
				//So(contacts[1].Devices[0].Key, ShouldNotBeNil)
			})
			Convey("Eve has no friend", FailureHalts, func() {
				contacts, err := eve.client.ContactList(internalCtx, &node.Void{})
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
	return driver, nil
}

func getBoostrap(d *p2pnet.Driver) []string {
	addrs := d.Addrs()
	bootstrap := make([]string, len(addrs))

	for i, a := range addrs {
		bootstrap[i] = fmt.Sprintf("%s/ipfs/%s", a, d.ID().Pretty())
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

	setupTestLogging()

	Convey("End-to-end test (with simple network mock)", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
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

			network.AddPeer(alice.node.UserID(), aliceNetwork)
			network.AddPeer(bob.node.UserID(), bobNetwork)
			network.AddPeer(eve.node.UserID(), eveNetwork)
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
	Convey("End-to-end test (with p2p network)", t, FailureHalts, func() {
		Convey("Initialize nodes", FailureHalts, func() {
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
		})
		scenario(t, alice, bob, eve)
	})
}
