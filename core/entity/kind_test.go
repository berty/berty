package entity

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestEvent_GetAttrs(t *testing.T) {
	Convey("Event.GetAttrs()", t, func() {
		input := &ConversationNewMessageAttrs{
			Message: &Message{
				Text: "hello world!",
			},
		}
		event := NewEvent().
			SetConversationNewMessageAttrs(input)

		So(event.Err(), ShouldBeNil)

		attrs, err := event.GetAttrs()
		So(err, ShouldBeNil)
		So(attrs, ShouldResemble, input)

		event.Kind = Kind_ContactRequestAccepted
		attrs, err = event.GetAttrs()
		So(err, ShouldNotBeNil)
	})
}
