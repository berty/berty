package test

import (
	"testing"

	"berty.tech/experiment/dht"
	"berty.tech/experiment/dht/src/bittorrent"
	"berty.tech/experiment/dht/src/chord"
	"berty.tech/experiment/dht/src/gnunet"
	"berty.tech/experiment/dht/src/libp2p"
	"berty.tech/experiment/dht/src/matrix"
	. "github.com/smartystreets/goconvey/convey"
)

func TestBasic(t *testing.T) {
	var dhts = map[string]dht.DHT{
		"bittorrent": &bittorrent.DHT{},
		// "opendht":    opendht.New(),
		"libp2p": &libp2p.DHT{},
		"chord":  &chord.DHT{},
		"gnunet": &gnunet.DHT{},
		"matrix": matrix.New(&matrix.Options{Username: "hello_world", Password: "s3cur3"}),
	}

	for key, dht := range dhts {
		Convey("Run "+key+" dht", t, FailureHalts, func() {
			So(dht.Run(0), ShouldBeNil)
			So(dht.Bootstrap("localhost", ""), ShouldBeNil)
			So(dht.Put("hello", "world"), ShouldBeNil)
			data, err := dht.Get("hello")
			So(err, ShouldBeNil)
			So(data, ShouldEqual, "world")
			// So(dht.Shutdown(), ShouldBeNil)
		})
	}
}
