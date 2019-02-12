package test

import (
	"testing"

	"berty.tech/experiment/dht"
	"berty.tech/experiment/dht/src/bittorrent"
	"berty.tech/experiment/dht/src/chord"
	"berty.tech/experiment/dht/src/gnunet"
	"berty.tech/experiment/dht/src/libp2p"
	"berty.tech/experiment/dht/src/opendht"
	. "github.com/smartystreets/goconvey/convey"
)

func TestBasic(t *testing.T) {
	var dhts = map[string]dht.DHT{
		"bittorrent": &bittorrent.DHT{},
		"opendht":    &opendht.DHT{},
		"libp2p":     &libp2p.DHT{},
		"chord":      &chord.DHT{},
		"gnunet":     &gnunet.DHT{},
	}

	for key, dht := range dhts {
		Convey("Run "+key+" dht", t, FailureHalts, func() {
			So(dht.Run(0), ShouldBeNil)
		})
	}
}
