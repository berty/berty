package test

import (
	"context"
	"fmt"
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

	config.Level.SetLevel(zap.DebugLevel)

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
		homer, lisa, bart *p2p.Driver
		err               error
	)
	// setupTestLogging()
	// log.SetDebugLogging()

	// logging.SetDebugLogging()

	dht.PoolSize = 3
	ds := []*p2p.Driver{homer, lisa, bart}
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

	ctx := context.Background()
	Convey("p2p test", t, FailureHalts, func() {
		Convey("setup test", FailureHalts, func() {
			homer, err = setupDriver()
			So(err, ShouldBeNil)

			b := getBoostrap(homer)

			lisa, err = setupDriver(b...)
			So(err, ShouldBeNil)

			err = lisa.Join(ctx, "Lisa")
			So(err, ShouldBeNil)

			bart, err = setupDriver(b...)
			So(err, ShouldBeNil)
		})

		Convey("Bart send an event to Homer", FailureHalts, func(c C) {
			tctx, cancel := context.WithTimeout(ctx, time.Second*4)
			defer cancel()

			e := &api.Envelope{
				ChannelID: "Homer",
			}

			homerQueue := make(chan *api.Envelope, 1)
			homer.OnEnvelopeHandler(func(ctx context.Context, envelope *api.Envelope) (*api.Void, error) {
				if envelope == nil {
					homerQueue <- nil
					return nil, fmt.Errorf("empty envelope")
				}
				homerQueue <- envelope
				return &api.Void{}, nil
			})

			logger().Debug("Homer joing himself")
			err = homer.Join(ctx, "Homer")

			err := bart.Emit(tctx, e)
			So(err, ShouldBeNil)
			So(<-homerQueue, ShouldNotBeNil)
			// So(len(homerQueue), ShouldEqual, 1)
		})

		Convey("Roger send an event to Lisa", FailureHalts, func(c C) {
			tctx, cancel := context.WithTimeout(ctx, time.Second*4)
			defer cancel()

			e := &api.Envelope{
				ChannelID: "Lisa",
			}

			lisaQueue := make(chan *api.Envelope, 1)
			lisa.OnEnvelopeHandler(func(ctx context.Context, envelope *api.Envelope) (*api.Void, error) {
				if envelope == nil {
					lisaQueue <- nil
					return nil, fmt.Errorf("empty envelope")
				}
				lisaQueue <- envelope
				return &api.Void{}, nil
			})

			err = bart.Emit(tctx, e)
			So(err, ShouldBeNil)
			So(<-lisaQueue, ShouldNotBeNil)
			// So(len(lisaQueue), ShouldEqual, 1)
		})
	})
}
