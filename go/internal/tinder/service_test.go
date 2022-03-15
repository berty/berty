package tinder

import (
	"context"
	"fmt"
	"math/rand"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	idisc "github.com/libp2p/go-libp2p-discovery"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/testutil"
)

type mockedService struct {
	Server  *MockDriverServer
	Drivers []*Driver
	Host    host.Host
	Service Service
}

var fixedSecondBackoff = &BackoffOpts{
	StratFactory: idisc.NewFixedBackoff(time.Second),
}

var veryLongBackoff = &BackoffOpts{
	StratFactory: idisc.NewFixedBackoff(time.Hour),
}

func TestNewService(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	m := mocknet.New(ctx)

	h, err := m.GenPeer()
	require.NoError(t, err)

	s, err := NewService(&Opts{}, h)
	require.NoError(t, err)
	require.NotNil(t, s)

	err = s.Close()
	require.NoError(t, err)
}

func TestFlappyAdvertiseWatchdogs(t *testing.T) {
	testutil.FilterStability(t, testutil.Flappy)
	const advertisekey = "test_key"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	l, cleanup := testutil.Logger(t)
	defer cleanup()

	tick := 200 * time.Millisecond

	m := mocknet.New(ctx)
	opts := &Opts{
		Logger: l,
		// should expired after 4 ticks
		AdvertiseResetInterval: tick * 5,
		AdvertiseGracePeriod:   0,
	}

	ms, mc := testingMockedService(t, opts, m, 1)
	client := mc[0]

	ttl, err := client.Service.Advertise(ctx, advertisekey, discovery.TTL(tick))
	require.NoError(t, err)
	assert.Equal(t, opts.AdvertiseResetInterval, ttl)

	// wait for advertise
	<-ms.WaitForAdvertise(advertisekey, client.Host.ID())

	// should still be advertise after 2 tick
	time.Sleep(tick * 2)
	ok := ms.HasPeerRecord(advertisekey, client.Host.ID())
	require.True(t, ok)

	// should be expired after 6 ticks
	time.Sleep(tick * 6)
	ok = ms.HasPeerRecord(advertisekey, client.Host.ID())
	require.False(t, ok)
}

func TestAdvertiseWatchdogsExpired(t *testing.T) {
	const advertisekey = "test_key"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	l, cleanup := testutil.Logger(t)
	defer cleanup()

	m := mocknet.New(ctx)
	opts := &Opts{
		Logger:                 l,
		AdvertiseResetInterval: time.Millisecond * 250,
		AdvertiseGracePeriod:   time.Millisecond * 250,
	}

	ms, mc := testingMockedService(t, opts, m, 1)
	client := mc[0]

	for i := 0; i < 5; i++ {
		ttl, err := client.Service.Advertise(ctx, advertisekey, discovery.TTL(opts.AdvertiseResetInterval))
		require.NoError(t, err)
		assert.Equal(t, opts.AdvertiseResetInterval, ttl)

		<-ms.WaitForAdvertise(advertisekey, client.Host.ID())

		ok := ms.HasPeerRecord(advertisekey, client.Host.ID())
		// @gfanton: if this failed increase AdvertiseResetInterval, and it should fix the issue
		// this should be due a context timeout that take too much time
		require.True(t, ok)

		// wait reset interval
		time.Sleep(ttl)
	}

	// wait reset interval + grace period, the watchdog should be expired
	time.Sleep(opts.AdvertiseResetInterval + opts.AdvertiseGracePeriod)

	// since watchdog has expired and
	ok := ms.HasPeerRecord("test", client.Host.ID())
	require.False(t, ok)
}

func TestAdvertiseNetworkWakeUp(t *testing.T) {
	const advertisekey = "test_key"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	l, cleanup := testutil.Logger(t)
	defer cleanup()

	m := mocknet.New(ctx)
	opts := &Opts{
		Logger: l,
		// should expired after 4 ticks
		AdvertiseResetInterval: time.Minute,
	}

	ms, mc := testingMockedService(t, opts, m, 1)
	client := mc[0]

	emitter, err := client.Host.EventBus().Emitter(new(event.EvtLocalAddressesUpdated))
	require.NoError(t, err)

	defer emitter.Close()

	ttl, err := client.Service.Advertise(ctx, advertisekey, discovery.TTL(time.Minute))
	require.NoError(t, err)
	assert.Equal(t, opts.AdvertiseResetInterval, ttl)

	<-ms.WaitForAdvertise(advertisekey, client.Host.ID())

	ok := ms.HasPeerRecord(advertisekey, client.Host.ID())
	require.True(t, ok)

	ms.Unregister(advertisekey, client.Host.ID())

	ok = ms.HasPeerRecord(advertisekey, client.Host.ID())
	require.False(t, ok)

	// craft a fake event then emit it in the event bus
	err = emitter.Emit(event.EvtLocalAddressesUpdated{
		Diffs:   true,
		Current: []event.UpdatedAddress{},
	})
	require.NoError(t, err)

	ctx, cancel = context.WithTimeout(ctx, time.Second)
	defer cancel()

	select {
	case <-ms.WaitForAdvertise(advertisekey, client.Host.ID()):
	case <-ctx.Done():
		assert.NoError(t, ctx.Err())
	}

	ok = ms.HasPeerRecord(advertisekey, client.Host.ID())
	require.True(t, ok)
}

func TestFindPeersCache(t *testing.T) {
	const advertisekey = "test_key"
	const nDriver = 10

	cases := []struct {
		name          string
		ndriver       int
		foundExpected int
		backoffStrat  *BackoffOpts
	}{
		{name: "1 driver/no cache", ndriver: 1, foundExpected: 1},
		{name: "10 driver/no cache", ndriver: 10, foundExpected: 10},
		{name: "100 driver/no cache", ndriver: 100, foundExpected: 100},
		{name: "1 driver/with cache", ndriver: 1, foundExpected: 1, backoffStrat: veryLongBackoff},
		{name: "10 driver/with cache", ndriver: 10, foundExpected: 1, backoffStrat: veryLongBackoff},
		{name: "100 driver/with cache", ndriver: 100, foundExpected: 1, backoffStrat: veryLongBackoff},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	l, cleanup := testutil.Logger(t)
	defer cleanup()

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			m := mocknet.New(ctx)
			server := NewMockedDriverServer()

			driverh, err := m.GenPeer()
			require.NoError(t, err)

			drivers := make([]*Driver, tc.ndriver)
			for i := range drivers {
				drivers[i] = NewMockedDriverClient("MockedDriver", driverh, server)
			}

			// client host should be different than the driver so he wont be skipped
			clienth, err := m.GenPeer()
			require.NoError(t, err)

			// test with cache enable
			opts := &Opts{
				BackoffStrategy:        tc.backoffStrat,
				Logger:                 l,
				AdvertiseResetInterval: time.Minute,
			}
			client, err := NewService(opts, clienth, drivers...)
			require.NoError(t, err)
			defer client.Close()

			_, err = client.Advertise(ctx, advertisekey, discovery.TTL(time.Minute))
			require.NoError(t, err)

			// wait for at last one advertise to succeed. we dont care to wait for
			// each driver here, since they share the same host
			<-server.WaitForAdvertise(advertisekey, driverh.ID())

			cc, err := client.FindPeers(ctx, advertisekey)
			require.NoError(t, err)

			count := 0
			for p := range cc {
				assert.Equal(t, driverh.ID(), p.ID)
				count++
			}

			assert.Equal(t, tc.foundExpected, count)
		})
	}
}

func TestFindPeers(t *testing.T) {
	const advertisekey = "test_key"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	l, cleanup := testutil.Logger(t)
	defer cleanup()

	cases := []struct {
		name         string
		driver       int
		brokenDriver int
	}{
		{name: "with 1 driver", driver: 1},
		{name: "with 10 driver", driver: 10},
		// {name: "with 100 driver", driver: 100}, // FIXME(gfanton): race: limit on 8128 simultaneously alive goroutines is exceeded
		{name: "with 10 driver & 1 broken driver", driver: 10, brokenDriver: 1},
		{name: "with 1 driver & 10 broken driver", driver: 1, brokenDriver: 10},
		{name: "with 10 broken driver", brokenDriver: 10},
	}

	rand.Seed(time.Now().UnixNano())
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			m := mocknet.New(ctx)

			server := NewMockedDriverServer()

			okDrivers := make([]*Driver, tc.driver)
			for i := range okDrivers {
				// use custom host for each driver, this way we
				// should have different peer register on the
				// server
				h, err := m.GenPeer()
				require.NoError(t, err)

				okDrivers[i] = NewMockedDriverClient(fmt.Sprintf("MockedDriver #%d", i), h, server)
			}

			brokenDrivers := make([]*Driver, tc.brokenDriver)
			for i := range brokenDrivers {
				brokenDrivers[i] = &Driver{
					Name: fmt.Sprintf("BrokenDriver #%d", i),
					// broken driver, is a driver with no-op discovery
				}
			}

			// merge and shuffle drivers
			drivers := append(okDrivers, brokenDrivers...)
			rand.Shuffle(len(drivers), func(i, j int) { drivers[i], drivers[j] = drivers[j], drivers[i] })

			hcl, err := m.GenPeer()
			require.NoError(t, err)

			err = m.LinkAll()
			require.NoError(t, err)

			err = m.ConnectAllButSelf()
			require.NoError(t, err)

			opts := &Opts{
				BackoffStrategy:        veryLongBackoff,
				Logger:                 l,
				AdvertiseResetInterval: time.Minute,
			}

			client, err := NewService(opts, hcl, drivers...)
			require.NoError(t, err)

			defer client.Close()

			_, err = client.Advertise(ctx, advertisekey, discovery.TTL(time.Minute))
			require.NoError(t, err)

			// wait for all driver to be advertise
			hosts := m.Hosts()
			for _, h := range hosts {
				if h.ID() != hcl.ID() {
					<-server.WaitForAdvertise(advertisekey, h.ID())
				}
			}

			cc, err := client.FindPeers(ctx, advertisekey)
			require.NoError(t, err)

			count := 0
			for p := range cc {
				links := m.LinksBetweenPeers(hcl.ID(), p.ID)
				assert.Len(t, links, 2)

				err := m.UnlinkPeers(hcl.ID(), p.ID)
				require.NoError(t, err)

				count++
			}

			assert.Equal(t, len(okDrivers), count)
		})
	}
}

func TestFindPeersMultipleDriver(t *testing.T) {
	const advertisekey = "test_key"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	l, cleanup := testutil.Logger(t)
	defer cleanup()

	cases := []struct {
		name   string
		npeers int
	}{
		{name: "no peers", npeers: 0},
		{name: "find peers 1 peers", npeers: 1},
		{name: "find peers 10 peers", npeers: 10},
		// {name: "find peers 100 peers", npeers: 100}, // FIXME(gfanton): race: limit on 8128 simultaneously alive goroutines is exceeded
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			m := mocknet.New(ctx)
			opts := &Opts{
				Logger:                 l,
				AdvertiseResetInterval: time.Minute,
			}

			ms, mc := testingMockedService(t, opts, m, tc.npeers+1)

			err := m.LinkAll()
			require.NoError(t, err)

			err = m.ConnectAllButSelf()
			require.NoError(t, err)

			client := mc[0]
			for i, m := range mc {
				if i == 0 { // skip client
					continue
				}

				_, err := m.Service.Advertise(ctx, advertisekey, discovery.TTL(time.Minute))
				require.NoError(t, err)

				<-ms.WaitForAdvertise(advertisekey, m.Host.ID())
			}

			cc, err := client.Service.FindPeers(ctx, advertisekey)
			require.NoError(t, err)

			count := 0
			for p := range cc {
				links := m.LinksBetweenPeers(client.Host.ID(), p.ID)
				assert.Len(t, links, 2)

				err := m.UnlinkPeers(client.Host.ID(), p.ID)
				require.NoError(t, err)

				count++
			}

			assert.Equal(t, tc.npeers, count)
		})
	}
}

func TestingService(t *testing.T, opts *Opts, h host.Host, drivers ...*Driver) Service {
	t.Helper()

	s, err := NewService(opts, h, drivers...)
	require.NoError(t, err)

	return s
}

func testingMockedService(t *testing.T, opts *Opts, m mocknet.Mocknet, n int) (*MockDriverServer, []*mockedService) {
	t.Helper()

	srv := NewMockedDriverServer()
	ms := make([]*mockedService, n)
	for i := range ms {
		h, err := m.GenPeer()
		require.NoError(t, err)

		mc := NewMockedDriverClient(fmt.Sprintf("MockedDriver #%d", i), h, srv)
		service := TestingService(t, opts, h, mc)
		t.Cleanup(func() { service.Close() })

		ms[i] = &mockedService{
			Server:  srv,
			Drivers: []*Driver{mc},
			Host:    h,
			Service: service,
		}
	}

	return srv, ms
}
