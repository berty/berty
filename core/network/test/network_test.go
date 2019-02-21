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
	var (
		rootContext = context.Background()
		// TODO: Test to cancel context to check:
		// https://github.com/libp2p/go-libp2p/blob/a4827ae9dda71d85f03fe6a5926194bfed2b2c71/libp2p.go#L52
	)

	Convey("network without options", t, FailureHalts, func() {
		ctx, cancel := context.WithCancel(rootContext)
		net, err := network.New(ctx)
		So(err, ShouldNotBeNil)
		So(net, ShouldBeNil)
		cancel()
	})

	Convey("network with libp2p", t, FailureHalts, func() {
		Convey("without option", FailureHalts, func() {
			ctx, cancel := context.WithCancel(rootContext)
			net, err := network.New(ctx)
			So(err, ShouldNotBeNil)
			So(net, ShouldBeNil)
			cancel()
		})

		Convey("with default options", FailureHalts, func() {
			ctx, cancel := context.WithCancel(rootContext)
			net, err := network.New(ctx, network.WithDefaultOptions())
			So(err, ShouldBeNil)
			So(net, ShouldNotBeNil)
			cancel()
		})
	})
}
