package host

import (
	"bytes"
	"context"
	"io"
	"testing"
	"time"

	host "github.com/libp2p/go-libp2p-host"
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
	return New(ctx,
		WithMDNSService(),
		WithListeners(
			"/ip4/127.0.0.1/tcp/0",
			"/ip4/127.0.0.1/udp/0/quic",
		),
	)
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

			// Wait all conn to be ready
			// time.Sleep(time.Second * 2)
		})

		Convey("test stream", FailureHalts, func(c C) {
			pid := protocol.ID("/test/host")
			testSend := "test_send"

			cok := make(chan struct{}, 1)
			nodeB.SetStreamHandler(pid, func(s inet.Stream) {
				rbuf := make([]byte, len(testSend))
				// @TODO: try to fix this test
				// p := DescribeMultiaddr(s.Conn().RemoteMultiaddr())
				// c.So(p, ShouldEqual, "ip4/udp/quic")

				_, err := io.ReadFull(s, rbuf)
				c.So(err, ShouldBeNil)

				ok := bytes.Equal([]byte(testSend), rbuf)
				c.So(ok, ShouldBeTrue)

				inet.AwaitEOF(s)
				cok <- struct{}{}
			})

			s, err := nodeA.NewStream(ctx, nodeB.ID(), pid)
			So(err, ShouldBeNil)

			buf := []byte(testSend)
			_, err = s.Write(buf)

			s.Close()

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
