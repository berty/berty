package entity

import (
	"testing"
	time "time"

	"berty.tech/core/testrunner"
	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	testrunner.InitLogger()
}

func Test(t *testing.T) {
	var (
		err error

		myself = &Contact{ID: "myself", DisplayName: "myself", Status: Contact_Myself}
		homer  = &Contact{ID: "homer", DisplayName: "homer", Status: Contact_IsFriend}
		bart   = &Contact{ID: "bart", DisplayName: "bart", Status: Contact_IsRequested}
		lisa   = &Contact{ID: "lisa", DisplayName: "lisa", Status: Contact_RequestedMe}

		c *Conversation

		active ConversationMemberInteractive

		mm ConversationMemberInformative
		hm ConversationMemberInformative
		bm ConversationMemberInformative
		lm ConversationMemberInformative
	)

	Convey("create 1to1 conversation between myself and homer", t, FailureHalts, func() {
		c, err = NewOneToOneConversation(myself, homer)
		So(err, ShouldBeNil)

		mm, err = c.GetInteractiveMember(myself.ID)
		So(err, ShouldBeNil)

		hm, err = c.GetInteractiveMember(homer.ID)
		So(err, ShouldBeNil)

		Convey("myself and homer are owners", FailureHalts, func() {
			So(mm.IsOwner(), ShouldBeTrue)
			So(hm.IsOwner(), ShouldBeTrue)
		})

		Convey("myself try to block homer", FailureHalts, func() {
			active, err = c.GetInteractiveMember(mm.GetContactID())
			So(err, ShouldBeNil)

			err = active.Block(homer.ID)
			So(err, ShouldNotBeNil)
		})

		Convey("homer write a message", FailureHalts, func() {
			active, err = c.GetInteractiveMember(hm.GetContactID())
			So(err, ShouldBeNil)

			err = active.Write(&Message{Text: "D'oh!"})
			So(err, ShouldBeNil)

			Convey("myself read the message", FailureHalts, func() {
				active, err := c.GetInteractiveMember(mm.GetContactID())
				So(err, ShouldBeNil)

				err = active.Read(time.Now())
				So(err, ShouldBeNil)
			})
		})

		Convey("marshal conversation with his members", FailureHalts, func() {
			marshalled, err := c.Marshal()
			So(err, ShouldBeNil)

			Convey("unmarshal conversation", FailureHalts, func() {
				unmarshalled := &Conversation{}
				err := unmarshalled.Unmarshal(marshalled)
				So(err, ShouldBeNil)
			})
		})
	})

	Convey("create 1to1 conversation between bart and lisa", t, FailureHalts, func() {
		_, err = NewOneToOneConversation(bart, lisa)
		So(err, ShouldBeNil)
	})

	Convey("create group conversation between myself, bart and lisa", t, FailureHalts, func() {
		c, err = NewGroupConversation([]*Contact{myself, bart, lisa})
		So(err, ShouldBeNil)

		mm, err = c.GetMember(myself.ID)
		So(err, ShouldBeNil)

		bm, err = c.GetMember(bart.ID)
		So(err, ShouldBeNil)

		lm, err = c.GetMember(lisa.ID)
		So(err, ShouldBeNil)

		Convey("myself only is the owner", FailureHalts, func() {
			So(mm.IsOwner(), ShouldBeTrue)
			So(bm.IsOwner(), ShouldBeFalse)
			So(lm.IsOwner(), ShouldBeFalse)
		})

		Convey("bart invite homer", FailureHalts, func() {
			active, err = c.GetInteractiveMember(bm.GetContactID())
			So(err, ShouldBeNil)

			err = active.Invite(homer)
			So(err, ShouldBeNil)

			hm, err = c.GetMember(homer.ID)
			So(err, ShouldBeNil)

			Convey("homer write message", FailureHalts, func() {
				active, err = c.GetInteractiveMember(hm.GetContactID())
				So(err, ShouldBeNil)

				err = active.Write(&Message{Text: "D'oh!"})
				So(err, ShouldBeNil)
			})

			Convey("bart write message", FailureHalts, func() {
				active, err = c.GetInteractiveMember(bm.GetContactID())
				So(err, ShouldBeNil)

				err = active.Write(&Message{Text: "¡ Ay, caramba!"})
				So(err, ShouldBeNil)
			})

			Convey("myself block homer", FailureHalts, func() {
				active, err = c.GetInteractiveMember(mm.GetContactID())
				So(err, ShouldBeNil)

				err = active.Block(homer.ID)
				So(err, ShouldBeNil)

				Convey("homer try to write a message", FailureHalts, func() {
					active, err = c.GetInteractiveMember(hm.GetContactID())
					So(err, ShouldBeNil)

					err = active.Write(&Message{Text: "D'oh!"})
					So(err, ShouldNotBeNil)
				})

				Convey("bart try to unblock homer", FailureHalts, func() {
					active, err = c.GetInteractiveMember(bm.GetContactID())
					So(err, ShouldBeNil)

					err = active.Unblock(homer.ID)
					So(err, ShouldNotBeNil)
				})

				Convey("bart try to block myself", FailureHalts, func() {
					active, err = c.GetInteractiveMember(bm.GetContactID())
					So(err, ShouldBeNil)

					err = active.Block(myself.ID)
					So(err, ShouldNotBeNil)
				})

				Convey("bart try to set lisa as owner", FailureHalts, func() {
					active, err = c.GetInteractiveMember(bm.GetContactID())
					So(err, ShouldBeNil)

					err = active.SetOwner(lisa.ID)
					So(err, ShouldNotBeNil)
				})

				Convey("myself set lisa as owner", FailureHalts, func() {
					active, err = c.GetInteractiveMember(mm.GetContactID())
					So(err, ShouldBeNil)

					err = active.SetOwner(lisa.ID)
					So(err, ShouldBeNil)

					So(lm.IsOwner(), ShouldBeTrue)

					Convey("lisa unblock homer", FailureHalts, func() {
						active, err = c.GetInteractiveMember(lm.GetContactID())
						So(err, ShouldBeNil)

						err = active.Unblock(homer.ID)
						So(err, ShouldBeNil)
					})
				})
			})
		})
	})
}
