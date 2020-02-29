package tinder

import (
	"context"
	"testing"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_disc "github.com/libp2p/go-libp2p-discovery"
	p2p_mock "github.com/libp2p/go-libp2p/p2p/net/mock"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMultiDriver_Advertise(t *testing.T) {
	cases := []struct {
		Name  string
		NMock int
		Opts  []p2p_discovery.Option
		Wait  time.Duration
	}{
		{"1 drivers",
			1,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Minute)},
			time.Millisecond * 200,
		},
		{"5 drivers",
			5,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Minute)},
			time.Millisecond * 200,
		},
		{"2 drivers/100ms ttl/500ms wait",
			2,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Millisecond * 100)},
			time.Millisecond * 500,
		},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ms := NewMockedDriverServer()
	mn := p2p_mock.New(ctx)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			defer ms.Reset() // reset server on each iteration

			var opts p2p_discovery.Options
			err := opts.Apply(tc.Opts...)
			require.NoError(t, err)

			peers := testingPeers(t, mn, tc.NMock)
			drivers := testingMockedDriverClients(t, ms, peers...)
			md := NewMultiDriver(drivers...)

			const testKey = "testkey"

			ttl, err := md.Advertise(ctx, testKey, tc.Opts...)
			assert.NoError(t, err)
			assert.Equal(t, opts.Ttl, ttl)

			time.Sleep(time.Millisecond * 200)
			for i, peer := range peers {
				ok := ms.HasPeerRecord(testKey, peer.ID())
				assert.Equalf(t, true, ok, "peer `%d` hasn't been registered on the server", i)
			}
		})
	}

}

func TestMultiDriver_FindPeers(t *testing.T) {
	cases := []struct {
		Name             string
		NMock            int
		Opts             []p2p_discovery.Option
		assertPeersFound assert.ComparisonAssertionFunc
	}{
		{"1 drivers",
			1,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Minute)},
			assert.Contains,
		},
		{"1 drivers/0 ttl",
			1,
			[]p2p_discovery.Option{p2p_discovery.TTL(0)},
			assert.NotContains,
		},
		{"5 drivers",
			5,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Minute)},
			assert.Contains,
		},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ms := NewMockedDriverServer()
	mn := p2p_mock.New(ctx)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			defer ms.Reset() // reset server on each iteration

			var opts p2p_discovery.Options
			err := opts.Apply(tc.Opts...)
			require.NoError(t, err)

			peers := testingPeers(t, mn, tc.NMock)
			drivers := testingMockedDriverClients(t, ms, peers...)
			md := NewMultiDriver(drivers...)

			const testKey = "testkey"
			_, err = md.Advertise(ctx, testKey, tc.Opts...)
			require.NoError(t, err)

			time.Sleep(time.Millisecond * 100)

			ps, err := p2p_disc.FindPeers(ctx, md, testKey, tc.Opts...)
			assert.NoError(t, err)

			for _, peer := range peers {
				pi := p2p_host.InfoFromHost(peer)
				tc.assertPeersFound(t, ps, *pi)
			}
		})
	}
}

func TestMultiDriver_Unregister(t *testing.T) {
	cases := []struct {
		Name  string
		NMock int
		Opts  []p2p_discovery.Option
	}{
		{"1 drivers, 1min ttl",
			1,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Minute)},
		},
		{"5 drivers, 1min ttl",
			5,
			[]p2p_discovery.Option{p2p_discovery.TTL(time.Minute)},
		},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	ms := NewMockedDriverServer()
	mn := p2p_mock.New(ctx)

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			defer ms.Reset()

			peers := testingPeers(t, mn, tc.NMock)
			drivers := testingMockedDriverClients(t, ms, peers...)
			md := NewMultiDriver(drivers...)

			const testKey = "testkey"
			_, err := md.Advertise(ctx, testKey, tc.Opts...)
			require.NoError(t, err)

			time.Sleep(time.Millisecond * 100)

			md.Unregister(ctx, testKey)

			for i, peer := range peers {
				ok := ms.HasPeerRecord(testKey, peer.ID())
				assert.Equalf(t, false, ok, "peer `%d` still registered on the server", i)
			}
		})
	}
}
