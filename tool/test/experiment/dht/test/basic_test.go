package test

import (
	"testing"

	"berty.tech/berty/experiment/dht"
	"berty.tech/berty/experiment/dht/src/bittorrent"
	"berty.tech/berty/experiment/dht/src/chord"
	"berty.tech/berty/experiment/dht/src/gnunet"
	"berty.tech/berty/experiment/dht/src/libp2p"
	"berty.tech/berty/experiment/dht/src/matrix"
	. "github.com/smartystreets/goconvey/convey"
)

func TestBasic(t *testing.T) {
	var err error
	var dhts = map[string]dht.DHT{
		"bittorrent": &bittorrent.DHT{},
		// "opendht":    opendht.New(),
		"libp2p": &libp2p.DHT{},
		"chord":  &chord.DHT{},
		"gnunet": &gnunet.DHT{},
		"matrix": nil,
	}

	Convey("Setup matrix dht", t, FailureHalts, func() {
		dhts["matrix"], err = matrix.New(&matrix.Options{
			URL:      "http://localhost:8008", // the homeserver where the use is registered
			User:     "hello",
			Password: "world",
		})
		So(err, ShouldBeNil)
	})

	for key, dht := range dhts {
		Convey("Run "+key+" dht", t, FailureHalts, func() {
			So(dht.Run(), ShouldBeNil)
			So(dht.Bootstrap("http://localhost:8008"), ShouldBeNil)
			So(dht.Put("hello", "world"), ShouldBeNil)
			data, err := dht.Get("hello")
			So(err, ShouldBeNil)
			So(data, ShouldEqual, "world")
			So(dht.Put("world", "hello"), ShouldBeNil)
			data, err = dht.Get("world")
			So(err, ShouldBeNil)
			So(data, ShouldEqual, "hello")
			So(dht.Shutdown(), ShouldBeNil)
		})
	}
}
