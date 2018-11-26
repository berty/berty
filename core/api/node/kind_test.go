package node

import (
	"strings"
	"testing"

	"berty.tech/core/api/p2p"
	. "github.com/smartystreets/goconvey/convey"
)

func TestEvent_GetAttrs(t *testing.T) {
	Convey("Event.GetAttrs()", t, func() {
		event, err := NewEvent(Kind_Debug, &DebugAttrs{
			Msg: "hello world",
		})
		So(err, ShouldBeNil)
		So(event.Kind, ShouldEqual, p2p.Kind_Node)
		So(event.Direction, ShouldEqual, p2p.Event_Node)
		So(event.CreatedAt.IsZero(), ShouldBeFalse)
		So(strings.Contains(string(event.Attributes), `{"msg":"hello world"}`), ShouldBeTrue)

		nodeEvent, err := GetNodeEvent(event)
		So(err, ShouldBeNil)
		So(nodeEvent.Kind, ShouldEqual, Kind_Debug)
		So(string(nodeEvent.Attributes), ShouldEqual, `{"msg":"hello world"}`)
		debug, err := nodeEvent.GetDebugAttrs()
		So(err, ShouldBeNil)
		So(debug.Msg, ShouldEqual, "hello world")
	})
}
