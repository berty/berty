package account

import (
	"io/ioutil"
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestStateDB(t *testing.T) {
	Convey("Testing StateDB", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		state, err := OpenStateDB(tmpFile.Name())
		So(err, ShouldBeNil)
		defer state.Close()
		So(state.StartCounter, ShouldEqual, 0)

		state.StartCounter++
		So(state.Save(), ShouldBeNil)
		So(state.StartCounter, ShouldEqual, 1)

		state.Close()

		state, err = OpenStateDB(tmpFile.Name())
		So(err, ShouldBeNil)
		defer state.Close()
		So(state.StartCounter, ShouldEqual, 1)
	})
}
