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

		c ConversationInteractor

		mm ConversationMemberInteractor
		hm ConversationMemberInteractor
		bm ConversationMemberInteractor
		lm ConversationMemberInteractor
	)

	Convey("create 1to1 conversation between myself and homer", t, FailureHalts, func() {
		c, err = NewOneToOneConversation(myself, homer)
		So(err, ShouldBeNil)

		mm, err = c.GetMember(myself.ID)
		So(err, ShouldBeNil)

		hm, err = c.GetMember(homer.ID)
		So(err, ShouldBeNil)

		Convey("myself and homer are owners", FailureHalts, func() {
			So(mm.IsOwner(), ShouldBeTrue)
			So(hm.IsOwner(), ShouldBeTrue)
		})

		Convey("myself try to block homer", FailureHalts, func() {
			err = mm.Block(homer.ID)
			So(err, ShouldNotBeNil)
		})

		Convey("homer write a message", FailureHalts, func() {
			err = hm.Write(time.Now(), &Message{Text: "D'oh!"})
			So(err, ShouldBeNil)

			Convey("myself read the message", FailureHalts, func() {
				err = mm.Read(time.Now())
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
			err = bm.Invite(homer)
			So(err, ShouldBeNil)

			hm, err = c.GetMember(homer.ID)
			So(err, ShouldBeNil)

			Convey("homer write message", FailureHalts, func() {
				err = hm.Write(time.Now(), &Message{Text: "D'oh!"})
				So(err, ShouldBeNil)
			})

			Convey("bart write message", FailureHalts, func() {
				err = bm.Write(time.Now(), &Message{Text: "¡ Ay, caramba!"})
				So(err, ShouldBeNil)
			})

			Convey("myself block homer", FailureHalts, func() {
				err = mm.Block(homer.ID)
				So(err, ShouldBeNil)

				Convey("homer try to write a message", FailureHalts, func() {
					err = hm.Write(time.Now(), &Message{Text: "D'oh!"})
					So(err, ShouldNotBeNil)
				})

				Convey("bart try to unblock homer", FailureHalts, func() {
					err = bm.Unblock(homer.ID)
					So(err, ShouldNotBeNil)
				})

				Convey("bart try to block myself", FailureHalts, func() {
					err = bm.Block(myself.ID)
					So(err, ShouldNotBeNil)
				})

				Convey("bart try to set lisa as owner", FailureHalts, func() {
					err = bm.SetOwner(lisa.ID)
					So(err, ShouldNotBeNil)
				})

				Convey("myself set lisa as owner", FailureHalts, func() {
					err = mm.SetOwner(lisa.ID)

					So(err, ShouldBeNil)

					So(lm.IsOwner(), ShouldBeTrue)

					Convey("lisa unblock homer", FailureHalts, func() {
						err = lm.Unblock(homer.ID)
						So(err, ShouldBeNil)
					})
				})
			})
		})
	})
}
