package p2p

import (
	"testing"

	"berty.tech/core/entity"
	. "github.com/smartystreets/goconvey/convey"
)

func TestEvent_GetAttrs(t *testing.T) {
	Convey("Event.GetAttrs()", t, func() {
		event := Event{
			Kind: Kind_ConversationNewMessage,
		}
		input := ConversationNewMessageAttrs{
			Message: &entity.Message{
				Text: "hello world!",
			},
		}
		So(event.SetConversationNewMessageAttrs(&input), ShouldBeNil)

		attrs, err := event.GetAttrs()
		So(err, ShouldBeNil)
		So(attrs, ShouldResemble, &input)

		event.Kind = Kind_ContactRequestAccepted
		attrs, err = event.GetAttrs()
		So(err, ShouldNotBeNil)
	})
}
