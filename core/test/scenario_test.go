package test

import (
	"context"
	"os"
	"testing"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	. "github.com/smartystreets/goconvey/convey"
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
		shouldIContinue(t)

		contacts, err := alice.client.ContactList(internalCtx, &node.ContactListInput{})
		So(err, ShouldBeNil)
		So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

		contacts, err = bob.client.ContactList(internalCtx, &node.ContactListInput{})
		So(err, ShouldBeNil)
		So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

		contacts, err = eve.client.ContactList(internalCtx, &node.ContactListInput{})
		So(err, ShouldBeNil)
		So(len(contacts), ShouldEqual, 1) // 'myself' is the only known contact

		everythingWentFine()
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
			So(res, ShouldNotBeNil)
			time.Sleep(sleepBetweenSteps)

			everythingWentFine()
		})
		Convey("Alice has a new Conversation", FailureHalts, func() {
			res, err := alice.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			cache["conversation_id"] = res[0].ID
		})
		Convey("Bob calls node.ContactAcceptRequest", FailureHalts, func() {
			shouldIContinue(t)

			res, err := bob.client.Node().ContactAcceptRequest(internalCtx, &entity.Contact{
				ID: alice.node.UserID(),
			})
			So(err, ShouldBeNil)
			So(res, ShouldNotBeNil)
			time.Sleep(sleepBetweenSteps)

			everythingWentFine()
		})
		Convey("Alice has Bob as friend", FailureHalts, func() {
			shouldIContinue(t)
			time.Sleep(200 * time.Millisecond)

			contacts, err := alice.client.ContactList(internalCtx, &node.ContactListInput{
				Filter: &entity.Contact{Status: entity.Contact_IsFriend},
			})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 1)

			// bob
			So(contacts[0].ID, ShouldNotBeEmpty)
			So(contacts[0].DisplayName, ShouldEqual, "Bob")
			So(contacts[0].OverrideDisplayName, ShouldEqual, "Bob from school")
			So(contacts[0].Status, ShouldEqual, entity.Contact_IsFriend)

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
			So(contacts[0].Devices[0].ID, ShouldEqual, alice.node.UserID())

			everythingWentFine()
		})
		Convey("Eve has no friend", FailureHalts, func() {
			shouldIContinue(t)

			contacts, err := eve.client.ContactList(internalCtx, &node.ContactListInput{
				Filter: &entity.Contact{Status: entity.Contact_IsFriend},
			})
			So(err, ShouldBeNil)
			So(len(contacts), ShouldEqual, 0)
		})

		everythingWentFine()
	})
	Convey("Bob creates a conversation with Alice", FailureHalts, func() {

		Convey("Bob has a conversation", FailureHalts, func() {
			shouldIContinue(t)

			conversations, err := bob.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			everythingWentFine()
		})
		Convey("Alice has a conversation", FailureHalts, func() {
			shouldIContinue(t)

			conversations, err := alice.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			everythingWentFine()
		})
		Convey("Eve has no conversation", FailureHalts, func() {
			shouldIContinue(t)

			conversations, err := eve.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 0)

			everythingWentFine()
		})
		Convey("Bob has a conversations with Alice", FailureHalts, func() {
			shouldIContinue(t)

			conversations, err := bob.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)
			So(conversations[0].Title, ShouldEqual, "")
			So(len(conversations[0].Members), ShouldEqual, 2)
			memberBob := &entity.ConversationMember{}
			memberAlice := &entity.ConversationMember{}
			for _, member := range conversations[0].Members {
				switch member.ContactID {
				case alice.node.UserID():
					memberAlice = member
				case bob.node.UserID():
					memberBob = member
				}
			}
			So(memberBob.Contact.DisplayName, ShouldEqual, "Bob")
			So(memberAlice.Contact.DisplayName, ShouldEqual, "Alice")
			So(memberBob.ContactID, ShouldEqual, bob.node.UserID())
			So(memberAlice.ContactID, ShouldEqual, alice.node.UserID())
			So(memberBob.Status, ShouldEqual, entity.ConversationMember_Active)
			So(memberAlice.Status, ShouldEqual, entity.ConversationMember_Owner)

			everythingWentFine()
		})
		Convey("Alice has a conversation with Bob", FailureHalts, func() {
			shouldIContinue(t)

			conversations, err := alice.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 1)

			So(conversations[0].Title, ShouldEqual, "")
			So(len(conversations[0].Members), ShouldEqual, 2)
			So(conversations[0].Members[0].ContactID, ShouldNotEqual, conversations[0].Members[1].ContactID)
			for _, member := range conversations[0].Members {
				switch member.ContactID {
				case alice.node.UserID():
					So(member.Status, ShouldEqual, entity.ConversationMember_Owner)
				case bob.node.UserID():
					So(member.Status, ShouldEqual, entity.ConversationMember_Active)
				}
			}

			everythingWentFine()
		})

		Convey("Eve has no conversation (again)", FailureHalts, func() {
			shouldIContinue(t)

			conversations, err := eve.client.ConversationList(internalCtx, &node.ConversationListInput{})
			So(err, ShouldBeNil)
			So(len(conversations), ShouldEqual, 0)
		})

		everythingWentFine()
	})
	Convey("Bob sends a message on the conversation", FailureHalts, func() {
		Convey("Bob does not have any message in conversation history", FailureHalts, func() {
			shouldIContinue(t)

			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := eve.client.EventList(internalCtx, &node.EventListInput{
				Filter: &p2p.Event{
					ConversationID: cache["conversation_id"].(string),
				},
			})
			So(err, ShouldBeNil)
			So(len(events), ShouldEqual, 0)
			time.Sleep(sleepBetweenSteps)

			everythingWentFine()
		})
		Convey("Alice does not have any message in conversation history", FailureHalts, func() {
			shouldIContinue(t)

			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := eve.client.EventList(internalCtx, &node.EventListInput{
				Filter: &p2p.Event{
					ConversationID: cache["conversation_id"].(string),
				},
			})
			So(err, ShouldBeNil)
			So(len(events), ShouldEqual, 0)
			time.Sleep(sleepBetweenSteps)

			everythingWentFine()
		})
		Convey("Bob creates a conversation with Alice", FailureHalts, func() {
			shouldIContinue(t)

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

			everythingWentFine()
		})
		Convey("Bob has one message in conversation history", FailureHalts, func() {
			shouldIContinue(t)

			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := bob.client.EventList(internalCtx, &node.EventListInput{
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

			everythingWentFine()
		})
		Convey("Alice has one message in conversation history", FailureHalts, func() {
			shouldIContinue(t)

			So(cache["conversation_id"], ShouldNotBeNil)
			events, err := alice.client.EventList(internalCtx, &node.EventListInput{
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

			everythingWentFine()
		})
	})
}
