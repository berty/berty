package tinder

import (
	"testing"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_mock "github.com/libp2p/go-libp2p/p2p/net/mock"

	"github.com/stretchr/testify/require"
)

func testingPeers(t *testing.T, mn p2p_mock.Mocknet, n int) []p2p_host.Host {
	t.Helper()

	hs := make([]p2p_host.Host, n)

	var err error
	for i := range hs {
		hs[i], err = mn.GenPeer()
		require.NoError(t, err)

		// link with previously made peer
		for j := 0; j < i; j++ {
			if i != j {
				_, err = mn.LinkPeers(hs[i].ID(), hs[j].ID())
				require.NoError(t, err)
			}
		}
	}

	return hs
}

func testingMockedDriverClients(t *testing.T, s *MockDriverServer, hs ...p2p_host.Host) []Driver {
	t.Helper()

	drivers := make([]Driver, len(hs))
	for i := range drivers {
		drivers[i] = NewMockedDriverClient(hs[i], s)
	}

	return drivers
}

func testingDiscoveryOptions(opts ...p2p_discovery.Option) []p2p_discovery.Option {
	return opts
}

// type cleanFunc func()

// func testingRendezVousServer(ctx context.Context, t *testing.T, h p2p_host.Host, smaddrs ...ma.Multiaddr) (*Server, cleanFunc) {
// 	t.Helper()
// 	db, err := p2p_rpdb.OpenDB(ctx, ":memory:")
// 	require.NoError(t, err)

// 	s, err := NewRendezVousServer(ctx, h, db, smaddrs...)
// 	require.NoError(t, err)
// 	return s, func() { db.Close() }
// }
