package tinder

import (
	"context"
	"testing"
	"time"

	libp2p_rp "github.com/libp2p/go-libp2p-rendezvous"
	libp2p_rpdb "github.com/libp2p/go-libp2p-rendezvous/db/sqlite"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTinderPoint(t *testing.T) {
	cases := []struct {
		Name     string
		NDrivers int
	}{
		{"1 drivers", 1},
		{"10 drivers", 10},
		{"50 drivers", 100},
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			mn := libp2p_mocknet.New(ctx)

			// gen root peer
			rpeer, err := mn.GenPeer()
			require.NoError(t, err)
			rinfo := rpeer.Peerstore().PeerInfo(rpeer.ID())

			db, err := libp2p_rpdb.OpenDB(ctx, ":memory:")
			require.NoError(t, err)
			defer db.Close()

			// create rdv service
			_ = libp2p_rp.NewRendezvousService(rpeer, db)

			// create TinderPoint clients
			drivers := make([]Driver, tc.NDrivers)
			for i := range drivers {
				peer, err := mn.GenPeer()
				require.NoError(t, err)
				peer.Connect(ctx, rinfo)

				drivers[i] = NewRendezvousDiscovery(peer, rpeer.ID())
			}

			// link all peers between them
			err = mn.LinkAll()
			require.NoError(t, err)

			testSimpleAdvertise(ctx, t, &caseSimpleAdvertise{
				Key:     "simplekey",
				Drivers: drivers,
			})

			// // ttl success test
			testTTLAdvertise(ctx, t, &caseTTLAdvertise{
				Name:                  "ttl:2s wait:1s should success",
				Key:                   "testTTLSuccess",
				Drivers:               drivers,
				Ttl:                   time.Second * 2,
				Wait:                  time.Second,
				ExpectedNumberOfPeers: len(drivers),
				Assertion:             assert.Equal,
			})

			testTTLAdvertise(ctx, t, &caseTTLAdvertise{
				Name:                  "ttl:1s wait:2s should fail",
				Key:                   "testTTLFail",
				Drivers:               drivers,
				Ttl:                   time.Second,
				Wait:                  time.Second * 2,
				ExpectedNumberOfPeers: 0,
				Assertion:             assert.Equal,
			})
		})
	}

}
