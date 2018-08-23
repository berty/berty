package test

import (
	"context"
	"os"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
)

var cache = map[string]interface{}{}

func scenario(t *testing.T, alice, bob, eve *AppMock) {
	var (
		err                  error
		internalCtx          = context.Background()
		sleepBetweenSteps, _ = time.ParseDuration("50ms")
	)
	Convey("Prepare scenario", func() {
		if duration := os.Getenv("TEST_SLEEP_BETWEEN_STEPS"); duration != "" {
			sleepBetweenSteps, err = time.ParseDuration(duration)
			So(err, ShouldBeNil)
		}
	})

	Convey("Nodes should be empty when just initialized", FailureHalts, func() {
		contacts, err := alice.client.ContactList(internalCtx, &node.Void{})
		So(err, ShouldBeNil)
		So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

		contacts, err = bob.client.ContactList(internalCtx, &node.Void{})
		So(err, ShouldBeNil)
		So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

		contacts, err = eve.client.ContactList(internalCtx, &node.Void{})
		So(err, ShouldBeNil)
		So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact
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
			So(res, ShouldNotBeNil)
			time.Sleep(sleepBetweenSteps)
		})
		Convey("Bob calls node.ContactAcceptRequest", FailureHalts, func() {
			res, err := bob.client.Node().ContactAcceptRequest(internalCtx, &entity.Contact{
				ID: alice.node.UserID(),
			})
			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			time.Sleep(sleepBetweenSteps)
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
			So(contacts[1].Status, ShouldEqual, entity.Contact_IsFriend)
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
			So(contacts[1].Devices[0].ID, ShouldEqual, alice.node.UserID())
		})
		Convey("Eve has no friend", FailureHalts, func() {
			contacts, err := eve.client.ContactList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 1)
		})
	})
	Convey("Bob creates a conversation with Alice", FailureHalts, func() {
		Convey("Bob has no conversation", FailureHalts, func() {
			conversations, err := bob.client.ConversationList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 0)
		})
		Convey("Alice has no conversation", FailureHalts, func() {
			conversations, err := alice.client.ConversationList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 0)
		})
		Convey("Eve has no conversation", FailureHalts, func() {
			conversations, err := eve.client.ConversationList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 0)
		})
		Convey("Bob creates a conversation with Alice", FailureHalts, func() {
			res, err := bob.client.Node().ConversationCreate(internalCtx, &entity.Conversation{
				Title: "Alice & Bob",
				Topic: "hey!",
				Members: []*entity.ConversationMember{
					{ContactID: alice.node.UserID()},
				},
			})
			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			cache["conversation_id"] = res.ID
			time.Sleep(sleepBetweenSteps)
		})
		Convey("Bob has a conversation with Alice", FailureHalts, func() {
			conversations, err := bob.client.ConversationList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			So(conversations[0].Title, ShouldEqual, "Alice & Bob")
			So(len(conversations[0].Members), ShouldEqual, 2)
			So(conversations[0].Members[0].ContactID, ShouldEqual, bob.node.UserID())
			So(conversations[0].Members[1].ContactID, ShouldEqual, alice.node.UserID())
			So(conversations[0].Members[0].Status, ShouldEqual, entity.ConversationMember_Owner)
			So(conversations[0].Members[1].Status, ShouldEqual, entity.ConversationMember_Active)
		})
		Convey("Alice has the conversation with Bob", FailureHalts, func() {
			conversations, err := alice.client.ConversationList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			So(conversations[0].Title, ShouldEqual, "Alice & Bob")
			So(len(conversations[0].Members), ShouldEqual, 2)
			So(conversations[0].Members[0].ContactID, ShouldNotEqual, conversations[0].Members[1].ContactID)
			for _, member := range conversations[0].Members {
				switch member.ContactID {
				case alice.node.UserID():
					So(member.Status, ShouldEqual, entity.ConversationMember_Active)
				case bob.node.UserID():
					So(member.Status, ShouldEqual, entity.ConversationMember_Owner)
				}
			}
		})
		Convey("Eve has no conversation (again)", FailureHalts, func() {
			conversations, err := eve.client.ConversationList(internalCtx, &node.Void{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 0)
		})
	})
	Convey("Bob sends a message on the conversation", FailureHalts, func() {
		Convey("Bob does not have any message in conversation history", FailureHalts, func() {
			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := eve.client.EventList(internalCtx, &node.EventListInput{
				Limit: 10,
				Filter: &p2p.Event{
					ConversationID: cache["conversation_id"].(string),
				},
			})
			So(err, ShouldBeNil)
			So(len(events), ShouldEqual, 0)
			time.Sleep(sleepBetweenSteps)
		})
		Convey("Alice does not have any message in conversation history", FailureHalts, func() {
			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := eve.client.EventList(internalCtx, &node.EventListInput{
				Limit: 10,
				Filter: &p2p.Event{
					ConversationID: cache["conversation_id"].(string),
				},
			})
			So(err, ShouldBeNil)
			So(len(events), ShouldEqual, 0)
			time.Sleep(sleepBetweenSteps)
		})
		Convey("Bob creates a conversation with Alice", FailureHalts, func() {
			So(cache["conversation_id"], ShouldNotBeNil)
			res, err := bob.client.Node().ConversationAddMessage(internalCtx, &node.ConversationAddMessageInput{
				Conversation: &entity.Conversation{
					ID: cache["conversation_id"].(string),
				},
				Message: &entity.Message{
					Text: "hello world!",
				},
			})
			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			time.Sleep(sleepBetweenSteps)
		})
		Convey("Bob has one message in conversation history", FailureHalts, func() {
			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := bob.client.EventList(internalCtx, &node.EventListInput{
				Limit: 10,
				Filter: &p2p.Event{
					ConversationID: cache["conversation_id"].(string),
				},
			})
			So(err, ShouldBeNil)
			So(len(events), ShouldEqual, 1)

			So(events[0].Kind, ShouldEqual, p2p.Kind_ConversationNewMessage)
			So(events[0].Direction, ShouldEqual, p2p.Event_Outgoing)
			attrs, err := events[0].GetConversationNewMessageAttrs()
			So(err, ShouldBeNil)
			So(attrs.Message.Text, ShouldEqual, "hello world!")
			time.Sleep(sleepBetweenSteps)
		})
		Convey("Alice has one message in conversation history", FailureHalts, func() {
			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := alice.client.EventList(internalCtx, &node.EventListInput{
				Limit: 10,
				Filter: &p2p.Event{
					ConversationID: cache["conversation_id"].(string),
				},
			})
			So(err, ShouldBeNil)
			So(len(events), ShouldEqual, 1)
			So(events[0].Kind, ShouldEqual, p2p.Kind_ConversationNewMessage)
			So(events[0].Direction, ShouldEqual, p2p.Event_Incoming)
			attrs, err := events[0].GetConversationNewMessageAttrs()
			So(err, ShouldBeNil)
			So(attrs.Message.Text, ShouldEqual, "hello world!")
			time.Sleep(sleepBetweenSteps)
		})
	})
}
