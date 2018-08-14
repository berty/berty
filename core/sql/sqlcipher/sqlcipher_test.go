package sqlcipher

import (
	"io/ioutil"
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestOpen(t *testing.T) {
	Convey("testing Open", t, func() {
		tmpFile, err := ioutil.TempFile("", "sqlite")
		So(err, ShouldBeNil)
		defer os.Remove(tmpFile.Name())

		// create a database
		db, err := Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		So(db.Exec("CREATE TABLE test (id int)").Error, ShouldBeNil)
		So(db.Exec("SELECT * FROM test").Error, ShouldBeNil)
		So(db.Close(), ShouldBeNil)

		// reopen the database with the good key
		db, err = Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		So(db.Exec("SELECT * FROM test").Error, ShouldBeNil)
		So(db.Close(), ShouldBeNil)

		// reopen the database with an invalid key
		db, err = Open(tmpFile.Name(), []byte(`invalid`))
		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldEqual, "invalid sqlcipher encryption key: file is not a database")
		So(db, ShouldBeNil)

		// reopen the database with the good key
		db, err = Open(tmpFile.Name(), []byte(`s3cur3`))
		So(err, ShouldBeNil)
		So(db, ShouldNotBeNil)
		So(db.Exec("SELECT * FROM test").Error, ShouldBeNil)
		So(db.Close(), ShouldBeNil)
	})
}
