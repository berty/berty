package provider

import (
	"context"
	"fmt"
	"testing"
	"time"

	ipfsaddr "github.com/ipfs/go-ipfs-addr"
	libp2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-host"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type ProviderTest struct {
	name     string
	provider *Provider
	host     host.Host
}

func getBoostrap(d *ProviderTest) []string {
	addrs := d.host.Addrs()
	bootstrap := make([]string, len(addrs))

	for i, a := range addrs {
		bootstrap[i] = fmt.Sprintf("%s/ipfs/%s", a.String(), d.host.ID().Pretty())
	}

	return bootstrap
}

func (pt *ProviderTest) handler(id string, pi pstore.PeerInfo) {
	logger().Debug("Handler", zap.String("name", pt.name), zap.String("id", id), zap.String("pi", pi.ID.Pretty()))
}

func (pt *ProviderTest) BootstrapPeer(ctx context.Context, bootstrapAddr string) error {
	if bootstrapAddr == "" {
		return nil
	}

	iaddr, err := ipfsaddr.ParseString(bootstrapAddr)
	if err != nil {
		return err
	}

	pinfo, err := pstore.InfoFromP2pAddr(iaddr.Multiaddr())
	if err != nil {
		return err
	} else if err = pt.host.Connect(ctx, *pinfo); err != nil {
		return err
	}

	// absorb addresses into peerstore
	pt.host.Peerstore().AddAddrs(pinfo.ID, pinfo.Addrs, pstore.PermanentAddrTTL)
	return nil
}

func setupProviderTest(name string, bootstrap ...string) (*ProviderTest, error) {
	host, err := libp2p.New(
		context.Background(),
		libp2p.RandomIdentity,
		libp2p.DefaultPeerstore,
		libp2p.DefaultMuxers,
		libp2p.DefaultTransports,
		libp2p.ListenAddrStrings("/ip4/127.0.0.1/tcp/0"),
	)

	if err != nil {
		return nil, err
	}

	pt := &ProviderTest{}

	pt.name = name
	pt.host = host

	provider, err := New(context.Background(), pt.host, pt.handler)
	if err != nil {
		host.Close()
		return nil, err
	}

	pt.provider = provider

	for _, bs := range bootstrap {
		if err = pt.BootstrapPeer(context.Background(), bs); err != nil {
			return nil, err
		}
	}

	logger().Debug("Creating host", zap.String("name", name), zap.String("ID", host.ID().Pretty()))
	return pt, nil
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
		homer, lisa, roger, bart *ProviderTest
		err                      error
	)

	// setupTestLogging()
	// log.SetDebugLogging()

	hs := []*ProviderTest{homer, lisa, roger, bart}
	defer func() {
		for _, h := range hs {
			if h != nil {
				go func(_h *ProviderTest) {
					if err := _h.host.Close(); err != nil {
						logger().Warn("error while closing", zap.Error(err))
					}
				}(h)
			}
		}
	}()

	Convey("provider test", t, FailureHalts, func() {
		Convey("setup test", FailureHalts, func() {
			homer, err = setupProviderTest("homer")
			So(err, ShouldBeNil)

			b := getBoostrap(homer)

			lisa, err = setupProviderTest("lisa", b...)
			So(err, ShouldBeNil)

			roger, err = setupProviderTest("roger", b...)
			So(err, ShouldBeNil)

			bart, err = setupProviderTest("bart", b...)
			So(err, ShouldBeNil)

			peers := homer.host.Peerstore().Peers()
			So(len(peers), ShouldEqual, len(hs))
		})

		Convey("Roger lookup for Lisa via homer", FailureHalts, func(c C) {
			ctx, cancel := context.WithTimeout(context.Background(), time.Second*4)
			defer cancel()

			topic := "lisa"

			err := lisa.provider.Subscribe(ctx, topic)
			So(err, ShouldBeNil)

			ps, err := roger.provider.AnnounceAndWait(ctx, topic)
			So(err, ShouldBeNil)
			So(ps, ShouldNotBeNil)
		})

		Convey("Roger get lisa with cached informations", FailureHalts, func(c C) {
			topic := "lisa"
			ps, err := roger.provider.GetPeersForProvider(topic)
			So(err, ShouldBeNil)
			So(ps, ShouldNotBeNil)
		})

	})
}
