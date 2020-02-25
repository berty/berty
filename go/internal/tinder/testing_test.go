package tinder

import (
	"context"
	"testing"
	"time"

	libp2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// type cleanFunc func()

// func testingRendezVousServer(ctx context.Context, t *testing.T, h libp2p_host.Host, smaddrs ...ma.Multiaddr) (*Server, cleanFunc) {
// 	t.Helper()
// 	db, err := libp2p_rpdb.OpenDB(ctx, ":memory:")
// 	require.NoError(t, err)

// 	s, err := NewRendezVousServer(ctx, h, db, smaddrs...)
// 	require.NoError(t, err)
// 	return s, func() { db.Close() }
// }

type caseSimpleAdvertise struct {
	Key     string
	Drivers []Driver
}

func testSimpleAdvertise(ctx context.Context, t *testing.T, tc *caseSimpleAdvertise) {
	t.Run("simple advertise", func(t *testing.T) {
		const optTTL = time.Minute

		optN := len(tc.Drivers)

		// provide the same id
		for _, driver := range tc.Drivers {
			ttl, err := driver.Advertise(ctx, tc.Key, libp2p_discovery.TTL(optTTL))
			require.NoError(t, err)
			assert.Equal(t, optTTL, ttl)
		}

		// each driver should be able to find the same amount of peers
		for _, driver := range tc.Drivers {
			cpeers, err := driver.FindPeers(ctx, tc.Key)
			assert.NoError(t, err)

			peers := make([]libp2p_peer.AddrInfo, 0)
			for peer := range cpeers {
				peers = append(peers, peer)
			}

			assert.Equal(t, optN, len(peers))
		}
	})
}

type caseAsyncAdvertise struct {
	Key     string
	Drivers []Driver
}

func testAsyncAdvertise(ctx context.Context, t *testing.T, tc *caseSimpleAdvertise) {
	t.Run("async advertise", func(t *testing.T) {
		const optTTL = time.Minute

		optN := len(tc.Drivers)

		if len(tc.Drivers) == 0 {
			assert.FailNow(t, "Cannot run this test without any drivers")
		}

		rootDriver := tc.Drivers[0]

		// each driver should be able to find the same amount of peers
		cpeers, err := rootDriver.FindPeers(ctx, tc.Key)
		assert.NoError(t, err)

		// dont be to fast
		time.Sleep(time.Millisecond * 500)

		// provide the same id
		for _, driver := range tc.Drivers {
			ttl, err := driver.Advertise(ctx, tc.Key, libp2p_discovery.TTL(optTTL))
			assert.NoError(t, err)
			assert.Equal(t, optTTL, ttl)
		}

		peers := make([]libp2p_peer.AddrInfo, 0)
		for peer := range cpeers {
			peers = append(peers, peer)
		}

		assert.Equal(t, optN, len(peers))
	})
}

type caseTTLAdvertise struct {
	Name                  string
	Key                   string
	Drivers               []Driver
	Ttl                   time.Duration
	Wait                  time.Duration
	ExpectedNumberOfPeers int
	Assertion             assert.ComparisonAssertionFunc
}

func testTTLAdvertise(ctx context.Context, t *testing.T, tc *caseTTLAdvertise) {
	t.Run("ttl advertise "+tc.Name, func(t *testing.T) {
		if len(tc.Drivers) == 0 {
			assert.FailNow(t, "Cannot run this test without any drivers")
		}

		rootDriver := tc.Drivers[0]

		// provide the same id
		for _, driver := range tc.Drivers {
			ttl, err := driver.Advertise(ctx, tc.Key, libp2p_discovery.TTL(tc.Ttl))
			assert.NoError(t, err)
			assert.Equal(t, tc.Ttl, ttl)
		}

		time.Sleep(tc.Wait)

		// each driver should be able to find the same amount of peers
		cpeers, err := rootDriver.FindPeers(ctx, tc.Key)
		assert.NoError(t, err)

		peers := make([]libp2p_peer.AddrInfo, 0)
		for peer := range cpeers {
			peers = append(peers, peer)
		}

		tc.Assertion(t, tc.ExpectedNumberOfPeers, len(peers))
	})
}
