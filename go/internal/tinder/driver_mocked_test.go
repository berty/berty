package tinder

import (
	"context"
	"testing"
	"time"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMockedDriver_Advertise(t *testing.T) {
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

			factory := NewMockedDriverFactory()
			drivers := make([]Driver, tc.NDrivers)
			for i := range drivers {
				peer, err := mn.GenPeer()
				require.NoError(t, err)
				drivers[i] = factory.NewMockedDriver(peer)
			}

			testSimpleAdvertise(ctx, t, &caseSimpleAdvertise{
				Key:     "simplekey",
				Drivers: drivers,
			})

			testTTLAdvertise(ctx, t, &caseTTLAdvertise{
				Name:                  "ttl:500ms wait:1s should fail",
				Key:                   "testTTLFail",
				Drivers:               drivers,
				Ttl:                   time.Second,
				Wait:                  time.Second * 2,
				ExpectedNumberOfPeers: 0,
				Assertion:             assert.Equal,
			})

			testTTLAdvertise(ctx, t, &caseTTLAdvertise{
				Name:                  "ttl:1ms wait:500ms should success",
				Key:                   "testTTLSuccess",
				Drivers:               drivers,
				Ttl:                   time.Second * 2,
				Wait:                  time.Second,
				ExpectedNumberOfPeers: len(drivers),
				Assertion:             assert.Equal,
			})

		})
	}
}
