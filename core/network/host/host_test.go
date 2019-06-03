package host

import (
	"bytes"
	"context"
	"io"
	"testing"
	"time"

	"berty.tech/core/network/metric"
	none_routing "github.com/ipfs/go-ipfs-routing/none"
	libp2p "github.com/libp2p/go-libp2p"
	discovery "github.com/libp2p/go-libp2p-discovery"
	host "github.com/libp2p/go-libp2p-host"
	libp2p_metrics "github.com/libp2p/go-libp2p-metrics"
	inet "github.com/libp2p/go-libp2p-net"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	protocol "github.com/libp2p/go-libp2p-protocol"
	. "github.com/smartystreets/goconvey/convey"
	"go.uber.org/zap"
)

func nodeClose(hs ...host.Host) {
	for _, h := range hs {
		if h != nil {
			if err := h.Close(); err != nil {
				logger().Warn("error while closing host", zap.Error(err))
			}
		}
	}
}

func setupHost(ctx context.Context) (*BertyHost, error) {
	h, err := libp2p.New(ctx, libp2p.ListenAddrStrings("/ip4/127.0.0.1/tcp/0", "/ip6/::/tcp/0"))
	if err != nil {
		return nil, err
	}

	ping := NewPingService(h)

	rep := libp2p_metrics.NewBandwidthCounter()
	metric := metric.NewBertyMetric(ctx, h, rep, ping)

	// @TODO: We should test this as well, for the skip routing/discovery since
	// it's not use in tests
	crouter, _ := none_routing.ConstructNilRouting(ctx, nil, nil, nil)
	discovery := discovery.NewRoutingDiscovery(crouter)

	opts := &BertyHostOptions{
		Discovery: discovery,
		Routing:   crouter,
		Metric:    metric,
		Ping:      ping,
	}

	return NewBertyHost(ctx, h, opts)
}

func TestHost(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var (
		nodeA, nodeB *BertyHost
		err          error
	)

	Convey("test host", t, FailureHalts, func() {
		Convey("test setup", FailureHalts, func() {
			nodeA, err = setupHost(ctx)
			So(nodeA, ShouldNotBeNil)
			So(err, ShouldBeNil)

			nodeB, err = setupHost(ctx)
			So(nodeB, ShouldNotBeNil)
			So(err, ShouldBeNil)

			pib := pstore.PeerInfo{
				ID:    nodeB.ID(),
				Addrs: nodeB.Addrs(),
			}

			err = nodeA.Connect(ctx, pib)
			So(err, ShouldBeNil)
		})

		Convey("test ping", FailureHalts, func(c C) {
			conns := nodeA.Network().ConnsToPeer(nodeB.ID())
			So(len(conns), ShouldEqual, 1)

			for _, c := range conns {
				tc, err := nodeA.Metric.PingConn(ctx, c)
				So(err, ShouldBeNil)
				So(tc, ShouldBeLessThan, time.Second*4)
			}
		})

		Convey("test stream", FailureHalts, func(c C) {
			pid := protocol.ID("/test/host")
			testSend := "test_send"

			cok := make(chan struct{}, 1)
			nodeB.SetStreamHandler(pid, func(s inet.Stream) {
				rbuf := make([]byte, len(testSend))

				_, err := io.ReadFull(s, rbuf)
				c.So(err, ShouldBeNil)

				ok := bytes.Equal([]byte(testSend), rbuf)
				c.So(ok, ShouldBeTrue)

				cok <- struct{}{}
			})

			s, err := nodeA.NewStream(ctx, nodeB.ID(), pid)
			So(err, ShouldBeNil)

			buf := []byte(testSend)
			_, err = s.Write(buf)

			select {
			case <-ctx.Done():
				err = ctx.Err()
			case <-cok:
			}

			So(err, ShouldBeNil)
		})
	})

	nodeClose(nodeA, nodeB)
}
