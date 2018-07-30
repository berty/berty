package sql

import (
	"io/ioutil"
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/berty/berty/core/sql/sqlcipher"
)

func TestInit(t *testing.T) {
	Convey("testing Init", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := sqlcipher.Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		defer db.Close()

		// disable logger for the tests
		db.LogMode(false)

		// call init
		db, err = Init(db)
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)

		err = Migrate(db)
		So(err, ShouldBeNil)
		So(db.HasTable("contact"), ShouldBeTrue)
		So(db.HasTable("config"), ShouldBeTrue)
		So(db.HasTable("event"), ShouldBeTrue)
		So(db.HasTable("device"), ShouldBeTrue)
	})
}
