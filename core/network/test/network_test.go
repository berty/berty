package test

import (
	"context"
	"testing"

	"berty.tech/core/network"
	"berty.tech/core/testrunner"
	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	testrunner.InitLogger()
}

func Test(t *testing.T) {
	ctx := context.Background()
	Convey("network without options", t, FailureHalts, func() {
		net, err := network.New(ctx)
		So(err, ShouldBeNil)
		So(net, ShouldNotBeNil)
	})

	Convey("network with libp2p", t, FailureHalts, func() {
		Convey("without option", FailureHalts, func() {
			net, err := network.New(ctx)
			So(err, ShouldBeNil)
			So(net, ShouldNotBeNil)
		})

		Convey("with default options", FailureHalts, func() {
			net, err := network.New(ctx, network.WithDefaultOptions())
			So(err, ShouldBeNil)
			So(net, ShouldNotBeNil)
		})
	})
}
