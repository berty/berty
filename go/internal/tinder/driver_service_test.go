package tinder

import (
	"context"
	"fmt"
	"math/rand"
	"testing"
	"time"

	rendezvous "github.com/berty/go-libp2p-rendezvous"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"

	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/testutil"
)

type testMakeDriver = func(t *testing.T, logger *zap.Logger, p host.Host) IDriver

func TestMultipleDriversSubscribe(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

	targetRdvp, _ := makeRendezvousService(t, mn)

	cases := []struct {
		Name  string
		Makes []testMakeDriver
	}{
		{"mocked driver", []testMakeDriver{
			testMakeMockedDriverFactory(NewMockDriverServer()),
		}},
		{"localdisc driver", []testMakeDriver{
			testMakeLocalDiscoveryDriver,
		}},
		{"rendezvous driver", []testMakeDriver{
			testMakeRendezVousFactory(targetRdvp),
		}},
		{"mocked+rendezvous driver", []testMakeDriver{
			testMakeMockedDriverFactory(NewMockDriverServer()),
			testMakeRendezVousFactory(targetRdvp),
		}},
		{"localdisc+mocked+rendezvous driver", []testMakeDriver{
			testMakeLocalDiscoveryDriver,
			testMakeMockedDriverFactory(NewMockDriverServer()),
			testMakeRendezVousFactory(targetRdvp),
		}},
	}

	for i, tc := range cases {
		topic := fmt.Sprintf("test_topic_%d", i)
		t.Run(tc.Name, func(t *testing.T) {
			testMultipleDriversSubscribe(t, ctx, mn, topic, tc.Makes...)
		})
	}
}

func testMultipleDriversSubscribe(t *testing.T, ctx context.Context, mn mocknet.Mocknet, topic string, makers ...testMakeDriver) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	var err error
	var p1, p2 host.Host
	var s1, s2 *Service

	{
		p1 = genLocalPeer(t, mn)
		drivers := []IDriver{}
		for _, maker := range makers {
			drivers = append(drivers, maker(t, logger, p1))
		}
		s1, err = NewService(p1, logger, drivers...)
		require.NoError(t, err)
	}

	{
		p2 = genLocalPeer(t, mn)
		drivers := []IDriver{}
		for _, maker := range makers {
			drivers = append(drivers, maker(t, logger, p2))
		}
		s2, err = NewService(p2, logger, drivers...)
		require.NoError(t, err)
	}

	err = mn.LinkAll()
	require.NoError(t, err)
	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	// try a first lookup, should find nothing
	{
		out := s2.FindPeers(ctx, topic)
		peers := testPeersChanToSlice(t, out)
		require.Len(t, peers, 0, "no peer should be available")
	}

	// subscribe...
	sub := s2.Subscribe(topic)
	require.NoError(t, err)

	// ...then advertise
	err = s1.StartAdvertises(ctx, topic)
	require.NoError(t, err)

	{
		// should find exactly one peer
		p, err := testWaitForPeers(t, sub.Out(), time.Second*5)
		require.NoError(t, err)
		require.Equal(t, p1.ID(), p.ID)
		require.Equal(t, p1.Addrs(), p.Addrs)
	}

	{
		// should not have any peers left in the queue
		p, err := testWaitForPeers(t, sub.Out(), time.Millisecond*100)
		require.Nil(t, p)
		require.Error(t, err)
	}

	// try a lookup again, this time we should have some peers
	{
		out := s2.FindPeers(ctx, topic)
		p, err := testWaitForPeers(t, out, time.Second*5)

		require.NoError(t, err)
		require.Equal(t, p1.ID(), p.ID)
		require.Equal(t, p1.Addrs(), p.Addrs)

		// empty the channel, should not any peers left
		err = testDrainChannel(t, out, time.Second*5)
		require.NoError(t, err)
	}
}

func testMakeRendezVousFactory(target peer.ID) testMakeDriver {
	rng := rand.New(rand.NewSource(rand.Int63()))
	return func(t *testing.T, logger *zap.Logger, p host.Host) IDriver {
		t.Helper()

		syncClient := rendezvous.NewSyncInMemClient(context.Background(), p)
		return NewRendezvousDiscovery(logger, p, target, PrivateAddrsOnlyFactory, rng, syncClient)
	}
}

func testMakeMockedDriverFactory(srv *MockDriverServer) testMakeDriver {
	return func(t *testing.T, logger *zap.Logger, p host.Host) IDriver {
		return srv.Client(p)
	}
}

func testMakeDHTDriver(t *testing.T, logger *zap.Logger, p host.Host) IDriver {
	t.Helper()

	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)

	d, err := dht.New(ctx, p)
	require.NoError(t, err)
	t.Cleanup(func() { d.Close() })

	return NewRoutingDiscoveryDriver("dht", d)
}

func testMakeLocalDiscoveryDriver(t *testing.T, logger *zap.Logger, p host.Host) IDriver {
	t.Helper()

	driver, err := NewLocalDiscovery(logger, p, rand.New(rand.NewSource(rand.Int63())))
	require.NoError(t, err, "unable to make local discovery driver")
	return driver
}
