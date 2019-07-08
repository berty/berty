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

func TestContact(t *testing.T) {
	var (
		err error

		hc *Contact
		bc *Contact
	)

	Convey("create contacts", t, FailureHalts, func() {
		Convey("create homer and bart", FailureHalts, func() {
			hc, err = NewContact("homer", "homer", Contact_Unknown)
			So(err, ShouldBeNil)
			bc, err = NewContact("bart", "bart", Contact_Unknown)
			So(err, ShouldBeNil)

			Convey("myself request homer", FailureHalts, func() {
				now := time.Now().UTC()
				err = hc.Requested(now)
				So(err, ShouldBeNil)
				So(hc.IsRequested(), ShouldBeTrue)

				Convey("homer accept request", FailureHalts, func() {
					now := time.Now().UTC()
					err = hc.AcceptedMe(now)
					So(err, ShouldBeNil)
					So(hc.IsFriend(), ShouldBeTrue)
				})

				Convey("homer request myself", FailureHalts, func() {
					now := time.Now().UTC()
					err = hc.RequestedMe(now)
					So(err, ShouldBeNil)
					So(hc.IsFriend(), ShouldBeTrue)
				})
			})

			Convey("bart request me", FailureHalts, func() {
				now := time.Now().UTC()
				err := bc.RequestedMe(now)
				So(err, ShouldBeNil)
				So(bc.DidRequestMe(), ShouldBeTrue)

				Convey("myself accept bart request", FailureHalts, func() {
					now := time.Now().UTC()
					err := bc.Accepted(now)
					So(err, ShouldBeNil)
					So(bc.IsFriend(), ShouldBeTrue)
				})

				Convey("myself request bart", FailureHalts, func() {
					now := time.Now().UTC()
					err = bc.Requested(now)
					So(err, ShouldBeNil)
					So(bc.IsFriend(), ShouldBeTrue)
				})
			})
		})
	})
}
