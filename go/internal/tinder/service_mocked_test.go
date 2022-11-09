package tinder

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/testutil"
)

func TestMockedServiceSubscribeMultipleDriver(t *testing.T) {
	const nPeers = 100
	const topic = "test_topic"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	mn := mocknet.New()
	defer mn.Close()

	cases := []struct {
		NDriver, NPeersPerDriver int
	}{
		{1, 1},
		{1, 10},
		{1, 100},
		{100, 1},
		{10, 10},
	}

	for _, tc := range cases {
		name := fmt.Sprintf("%d_dirvers-%d_peer_per_driver", tc.NDriver, tc.NPeersPerDriver)
		t.Run(name, func(t *testing.T) {
			rootp, err := mn.GenPeer()
			require.NoError(t, err)

			clients := make([]IDriver, tc.NDriver*tc.NPeersPerDriver)
			drivers := make([]IDriver, tc.NDriver)
			for i := 0; i < tc.NDriver; i++ {
				srv := NewMockDriverServer()
				drivers[i] = srv.Client(rootp)
				for j := 0; j < tc.NPeersPerDriver; j++ {
					p, err := mn.GenPeer()
					require.NoError(t, err)
					index := tc.NPeersPerDriver*i + j
					clients[index] = srv.Client(p)
				}
			}

			service, err := NewService(rootp, zap.NewNop(), drivers...)
			require.NoError(t, err)

			for _, client := range clients {
				_, err := client.Advertise(ctx, topic)
				assert.NoError(t, err)
			}

			sub := service.Subscribe(topic)
			defer sub.Close()

			err = sub.Pull()
			require.NoError(t, err)

			seen := make(map[peer.ID]struct{})
			var count int
			for count = 0; count < len(clients); count++ {
				select {
				case p := <-sub.Out():
					if _, ok := seen[p.ID]; ok {
						require.FailNow(t, "should only receive a peer once, received")
					}
					seen[p.ID] = struct{}{}

				case <-time.After(time.Second):
					require.FailNow(t, "timeout while waiting for peer", "received: %d", count)
				}
			}

			assert.Equal(t, tc.NDriver*tc.NPeersPerDriver, count)
		})
	}
}

func TestMockedServiceSubscribePull(t *testing.T) {
	const topic = "test_topic"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	mn := mocknet.New()
	defer mn.Close()

	srv := NewMockDriverServer()

	t.Run("with pull", func(t *testing.T) {
		const topic = "test_topic_1"
		p1, s1 := newTestMockedService(t, logger, mn, srv)
		_, s2 := newTestMockedService(t, logger, mn, srv)

		err := s1.StartAdvertises(ctx, topic)
		require.NoError(t, err)

		err = srv.WaitForPeer(topic, p1.ID(), time.Second)
		require.NoError(t, err)

		sub := s2.Subscribe(topic)
		defer sub.Close()

		err = sub.Pull()
		require.NoError(t, err)

		select {
		case p := <-sub.Out():
			assert.Equal(t, p1.ID(), p.ID)
			assert.Equal(t, p1.Addrs(), p.Addrs)
		case <-time.After(time.Second * 2):
			require.FailNow(t, "timeout while waiting for peer")
		}
	})

	t.Run("no pull", func(t *testing.T) {
		const topic = "test_topic_2"

		p1, s1 := newTestMockedService(t, logger, mn, srv)
		_, s2 := newTestMockedService(t, logger, mn, srv)

		err := s1.StartAdvertises(ctx, topic)
		require.NoError(t, err)

		err = srv.WaitForPeer(topic, p1.ID(), time.Second)
		require.NoError(t, err)

		sub := s2.Subscribe(topic)
		defer sub.Close()

		select {
		case <-sub.Out():
			require.FailNow(t, "do no expect peers")
		case <-time.After(time.Millisecond * 500):
		}
	})
}

func TestMockedServiceSubscribeDuplicatePeer(t *testing.T) {
	const topic = "test_topic"
	const NServers = 10

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	mn := mocknet.New()
	defer mn.Close()

	servers := make([]*MockDriverServer, NServers)
	for i := range servers {
		servers[i] = NewMockDriverServer()
	}

	p1, s1 := newTestMockedService(t, logger, mn, servers...)
	_, s2 := newTestMockedService(t, logger, mn, servers...)

	err := s1.StartAdvertises(ctx, topic)
	require.NoError(t, err)

	for _, s := range servers {
		err := s.WaitForPeer(topic, p1.ID(), time.Second)
		require.NoError(t, err)
	}

	sub := s2.Subscribe(topic)
	defer sub.Close()

	err = sub.Pull()
	require.NoError(t, err)

	var count int
	for {
		select {
		case p := <-sub.Out():
			assert.Equal(t, p1.ID(), p.ID)
			assert.Equal(t, p1.Addrs(), p.Addrs)
			count++
		case <-time.After(time.Millisecond * 500):
			require.Equal(t, 1, count)
			return
		}
	}
}

func newTestMockedService(t *testing.T, logger *zap.Logger, mn mocknet.Mocknet, srvs ...*MockDriverServer) (host.Host, *Service) {
	t.Helper()

	h, err := mn.GenPeer()
	require.NoError(t, err)

	drivers := make([]IDriver, len(srvs))
	for i, srv := range srvs {
		drivers[i] = srv.Client(h)
	}

	s, err := NewService(h, logger, drivers...)
	require.NoError(t, err)

	return h, s
}
