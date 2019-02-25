package matrix

import (
	"fmt"
	"os"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestBasic(t *testing.T) {
	var err error
	var dht *DHT
	var (
		user       = os.Getenv("USER")
		password   = os.Getenv("PASSWORD")
		bootstraps = strings.Split(os.Getenv("BOOTSTRAPS"), ",")
	)

	Convey("Setup matrix dht", t, func(c C) {
		dht, err = New(&Options{
			User:     user,
			Password: password,
		})
		c.So(err, ShouldBeNil)

		fmt.Printf("%+v\n", bootstraps)
		c.Convey("Run matrix", FailureHalts, func(c C) {
			c.So(dht.Run(), ShouldBeNil)

			for _, bootstrap := range bootstraps {
				c.So(dht.Bootstrap(bootstrap), ShouldBeNil)
			}

			c.So(dht.Put(user, "hello world"), ShouldBeNil)

			clients := []string{"client-0", "client-1", "client-2"}
			for _, client := range clients {
				data, err := dht.Get(client)
				c.So(err, ShouldBeNil)
				c.So(data, ShouldEqual, "hello world")
			}
			c.So(dht.Shutdown(), ShouldBeNil)
		})
	})
}
