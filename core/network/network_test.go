package network

import (
	"context"
	"fmt"
	"testing"
	"time"

	"berty.tech/core/entity"
	"berty.tech/core/testrunner"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"go.uber.org/zap"

	. "github.com/smartystreets/goconvey/convey"
)

var bootstrapConfig = &dht.BootstrapConfig{
	Queries: 5,
	Period:  time.Duration(time.Second),
	Timeout: time.Duration(10 * time.Second),
}

func init() {
	testrunner.InitLogger()
}

func getBoostrap(n *Network) []string {
	addrs := n.Addrs()
	bootstrap := make([]string, len(addrs))

	for i, a := range addrs {
		if a.String() != "/p2p-circuit" {
			bootstrap[i] = fmt.Sprintf("%s/ipfs/%s", a.String(), n.ID(context.Background()).ID)
		}
	}

	return bootstrap
}

func setupClient(ctx context.Context) (*Network, error) {
	return New(ctx, WithClientTestOptions())
}

func setupServer(ctx context.Context) (*Network, error) {
	return New(ctx, WithServerTestOptions())
}

func TestDriver(t *testing.T) {
	var (
		homer, lisa, bart   *Network
		serv1, serv2, serv3 *Network
		err                 error
	)

	dht.PoolSize = 3
	ds := []*Network{homer, lisa, bart, serv1, serv2, serv3}
	defer func() {
		for _, n := range ds {
			if n != nil {
				go func(n *Network) {
					if err := n.Close(context.Background()); err != nil {
						logger().Warn("error while closing", zap.Error(err))
					}
				}(n)
			}
		}
	}()

	ctx := context.Background()
	Convey("net test", t, FailureHalts, func() {
		Convey("setup DHT servers", FailureHalts, func() {
			serv1, err = setupServer(ctx)
			So(err, ShouldBeNil)

			serv2, err = setupServer(ctx)
			So(err, ShouldBeNil)

			serv3, err = setupServer(ctx)
			So(err, ShouldBeNil)
		})

		Convey("setup clients", FailureHalts, func() {
			homer, err = setupClient(ctx)
			So(err, ShouldBeNil)

			lisa, err = setupClient(ctx)
			So(err, ShouldBeNil)

			bart, err = setupClient(ctx)
			So(err, ShouldBeNil)
		})

		Convey("bootstrap clients", FailureHalts, func() {
			tctx, cancel := context.WithTimeout(ctx, time.Second*10)
			defer cancel()

			bootstrap := []string{}
			bootstrap = append(bootstrap, getBoostrap(serv1)...)
			bootstrap = append(bootstrap, getBoostrap(serv2)...)
			bootstrap = append(bootstrap, getBoostrap(serv3)...)

			err = homer.Bootstrap(tctx, true, bootstrap...)
			So(err, ShouldBeNil)

			err = lisa.Bootstrap(tctx, true, bootstrap...)
			So(err, ShouldBeNil)

			err = bart.Bootstrap(tctx, true, bootstrap...)
			So(err, ShouldBeNil)
		})

		Convey("homer, lisa and bart join themselves on the DHT", FailureHalts, func() {
			err = homer.Join(ctx, "Homer")
			So(err, ShouldBeNil)

			err = lisa.Join(ctx, "Lisa")
			So(err, ShouldBeNil)

			err = bart.Join(ctx, "Bart")
			So(err, ShouldBeNil)

		})

		Convey("Bart send an event to Homer", FailureHalts, func(c C) {
			tctx, cancel := context.WithTimeout(ctx, time.Second*10)
			defer cancel()

			e := &entity.Envelope{
				ChannelID: "Homer",
			}

			homerQueue := make(chan *entity.Envelope, 1)
			homer.OnEnvelopeHandler(func(ctx context.Context, envelope *entity.Envelope) (*entity.Void, error) {
				if envelope == nil {
					homerQueue <- nil
					return nil, fmt.Errorf("empty envelope")
				}
				homerQueue <- envelope
				return &entity.Void{}, nil
			})

			err = homer.Join(tctx, "Homer")

			err := bart.Emit(tctx, e)
			So(err, ShouldBeNil)
			So(<-homerQueue, ShouldNotBeNil)
			// So(len(homerQueue), ShouldEqual, 1)
		})

		// @TODO: add more test..
	})
}
