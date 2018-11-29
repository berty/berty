package test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	api "berty.tech/core/api/p2p"
	"berty.tech/core/network/p2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var bootstrapConfig = &dht.BootstrapConfig{
	Queries: 5,
	Period:  time.Duration(time.Second),
	Timeout: time.Duration(10 * time.Second),
}

func getBoostrap(d *p2p.Driver) []string {
	addrs := d.Addrs()
	bootstrap := make([]string, len(addrs))

	for i, a := range addrs {
		bootstrap[i] = fmt.Sprintf("%s/ipfs/%s", a.String(), d.ID(context.Background()).ID)
	}

	return bootstrap
}

func setupDriver(bootstrap ...string) (*p2p.Driver, error) {
	driver, err := p2p.NewDriver(
		context.Background(),
		p2p.WithRandomIdentity(),
		p2p.WithDefaultMuxers(),
		p2p.WithDefaultPeerstore(),
		p2p.WithDefaultSecurity(),
		p2p.WithDefaultTransports(),

		p2p.WithDHTBoostrapConfig(bootstrapConfig),
		p2p.WithListenAddrStrings("/ip4/127.0.0.1/tcp/0"),
		p2p.WithBootstrapSync(bootstrap...),
	)
	if err != nil {
		return nil, err
	}
	go func() {
		if err = driver.Start(context.Background()); err != nil {
			logger().Error("driver start error", zap.Error(err))
		}
	}()
	return driver, err
}

func setupTestLogging() {
	// initialize zap
	config := zap.NewDevelopmentConfig()
	if os.Getenv("LOG_LEVEL") == "debug" {
		config.Level.SetLevel(zap.DebugLevel)
	} else {
		config.Level.SetLevel(zap.InfoLevel)
	}
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, err := config.Build()
	if err != nil {
		panic(err)
	}
	zap.ReplaceGlobals(logger)
}

func TestP2PNetwork(t *testing.T) {
	var (
		homer, lisa, bart, roger, patrick *p2p.Driver
		err                               error
	)
	setupTestLogging()
	// logging.SetDebugLogging()

	dht.PoolSize = 3
	ds := []*p2p.Driver{homer, lisa, bart, roger, patrick}
	defer func() {
		for _, d := range ds {
			if d != nil {
				_d := d
				go func() {
					if err := _d.Close(context.Background()); err != nil {
						logger().Warn("error while closing", zap.Error(err))
					}
				}()
			}
		}
	}()

	Convey("p2p test", t, FailureHalts, func() {
		Convey("setup test", FailureHalts, func() {
			// ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
			// defer cancel()

			ctx := context.Background()

			homer, err = setupDriver()
			So(err, ShouldBeNil)

			b := getBoostrap(homer)

			lisa, err = setupDriver(b...)
			So(err, ShouldBeNil)

			bart, err = setupDriver(b...)
			So(err, ShouldBeNil)

			roger, err = setupDriver(b...)
			So(err, ShouldBeNil)

			patrick, err = setupDriver(b...)
			So(err, ShouldBeNil)

			err = lisa.Announce(ctx, "Lisa")
			So(err, ShouldBeNil)

			err = bart.Announce(ctx, "Bart")
			So(err, ShouldBeNil)

			err = patrick.Announce(ctx, "Patrick")
			So(err, ShouldBeNil)

			err = roger.Announce(ctx, "Roger")
			So(err, ShouldBeNil)

			time.Sleep(time.Second * 2)
		})

		Convey("Roger send an event to Lisa", FailureHalts, func(c C) {
			ctx := context.Background()
			e := &api.Envelope{
				ChannelID: "Lisa",
			}

			lisaQueue := make(chan *api.Envelope, 1)
			lisa.OnEnvelopeHandler(func(ctx context.Context, envelope *api.Envelope) (*api.Void, error) {
				if envelope == nil {
					lisaQueue <- nil
					return nil, err
				}
				lisaQueue <- envelope
				return &api.Void{}, nil
			})

			err = roger.Emit(ctx, e)
			So(err, ShouldBeNil)

			So(<-lisaQueue, ShouldNotBeNil)
			// So(len(lisaQueue), ShouldEqual, 1)
		})
	})
}
