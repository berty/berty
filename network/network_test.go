package network

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	host "berty.tech/network/host"
	"berty.tech/network/protocol/berty"
	p2plog "github.com/ipfs/go-log"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	. "github.com/smartystreets/goconvey/convey"
)

var bootstrapConfig = &dht.BootstrapConfig{
	Queries: 5,
	Period:  time.Duration(time.Second),
	Timeout: time.Duration(10 * time.Second),
}

func getBoostrap(n *Network) []string {
	addrs := n.host.Addrs()
	bootstrap := make([]string, len(addrs))

	for i, a := range addrs {
		if a.String() != "/p2p-circuit" {
			bootstrap[i] = fmt.Sprintf("%s/ipfs/%s", a.String(), n.ID().ID)
		}
	}

	return bootstrap
}

func setupTestClient(ctx context.Context, ID string, bootstrapAddr ...string) (*Network, error) {
	bh, err := host.New(ctx,
		host.WithMobileMode(),
		host.WithListeners("/ip4/127.0.0.1/tcp/0"),
	)

	if err != nil {
		return nil, err
	}

	return New(ctx, bh,
		WithLocalContactID(ID),
		WithPeerCache(),
		WithBootstrap(bootstrapAddr...),
	)
}

func setupTestServer(ctx context.Context, ID string) (*Network, error) {
	bh, err := host.New(ctx,
		host.WithListeners(
			"/ip4/127.0.0.1/tcp/0",
			"/ip4/127.0.0.1/udp/0/quic",
		),
	)
	if err != nil {
		return nil, err
	}

	return New(ctx, bh,
		WithLocalContactID(ID),
		WithPeerCache(),

		// Disable defaultBootstrap
		WithBootstrap(),
	)
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
					if err := n.Close(context.TODO()); err != nil {
						logger().Warn("error while closing", zap.Error(err))
					}
				}(n)
			}
		}
	}()

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	Convey("test driver", t, FailureHalts, func() {
		Convey("setup DHT servers", FailureHalts, func() {
			serv1, err = setupTestServer(ctx, "serv1")
			So(serv1, ShouldNotBeNil)
			So(err, ShouldBeNil)

			serv2, err = setupTestServer(ctx, "serv2")
			So(serv2, ShouldNotBeNil)
			So(err, ShouldBeNil)

			serv3, err = setupTestServer(ctx, "serv3")
			So(serv3, ShouldNotBeNil)
			So(err, ShouldBeNil)
		})

		Convey("setup clients", FailureHalts, func() {
			bootstrap := []string{}
			bootstrap = append(bootstrap, getBoostrap(serv1)...)
			bootstrap = append(bootstrap, getBoostrap(serv2)...)
			bootstrap = append(bootstrap, getBoostrap(serv3)...)

			homer, err = setupTestClient(ctx, "homer", bootstrap...)
			So(err, ShouldBeNil)

			lisa, err = setupTestClient(ctx, "lisa", bootstrap...)
			So(err, ShouldBeNil)

			bart, err = setupTestClient(ctx, "bart", bootstrap...)
			So(err, ShouldBeNil)
		})

		Convey("homer, lisa and bart join themselves on the DHT", FailureHalts, func() {
			err = homer.Join()
			So(err, ShouldBeNil)

			err = lisa.Join()
			So(err, ShouldBeNil)

			err = bart.Join()
			So(err, ShouldBeNil)
		})

		Convey("Bart send an event to Homer", FailureHalts, func(c C) {
			m := &berty.Message{
				RemoteContactID: "homer",
			}

			homerQueue := make(chan *berty.Message, 1)
			homer.OnMessage(func(msg *berty.Message, _ *berty.ConnMetadata) {
				if msg == nil {
					homerQueue <- nil
				} else {
					homerQueue <- msg
				}
			})

			err := bart.EmitMessage(ctx, m)
			So(err, ShouldBeNil)

			var msg *berty.Message
			select {
			case msg = <-homerQueue:
			case <-ctx.Done():
			}

			So(msg, ShouldNotBeNil)
		})

		Convey("Bart update his host with an udp/quic Listener", FailureHalts, func(c C) {
			oldid := bart.ID()
			bh, err := host.New(ctx,
				host.WithMobileMode(),
				host.WithListeners("/ip4/127.0.0.1/udp/0/quic"),
			)

			So(err, ShouldBeNil)

			// Update the host
			bart.UpdateHost(bh)
			So(bart.ID(), ShouldNotEqual, oldid)

		})

		Convey("Bart send a message to lisa", FailureHalts, func(c C) {
			m := &berty.Message{
				RemoteContactID: "lisa",
			}

			lisaQueue := make(chan *berty.Message, 1)
			lisa.OnMessage(func(msg *berty.Message, m *berty.ConnMetadata) {
				if msg == nil {
					lisaQueue <- nil
				} else {
					lisaQueue <- msg
				}
			})

			err = bart.EmitMessage(ctx, m)
			So(err, ShouldBeNil)

			var msg *berty.Message
			select {
			case msg = <-lisaQueue:
			case <-ctx.Done():
			}

			So(msg, ShouldNotBeNil)
		})

		// @TODO: add more test..
	})
}

func InitLogger() {
	// initialize zap
	config := zap.NewDevelopmentConfig()

	p2plog.SetDebugLogging()
	config.Level.SetLevel(zap.DebugLevel)

	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder

	logger, err := config.Build()
	if err != nil {
		panic(err)
	}

	zap.ReplaceGlobals(logger)
}

func init() {
	if _, ok := os.LookupEnv("ENABLE_LOG"); ok {
		InitLogger()
	}
}
