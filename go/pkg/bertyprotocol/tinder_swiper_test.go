package bertyprotocol

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
	p2pmocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/internal/testutil"
)

func TestAnnounceWatchForPeriod(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)
	cases := []struct {
		expectedPeersFound int
		topicA             []byte
		topicB             []byte
		seedA              []byte
		seedB              []byte
	}{
		{
			expectedPeersFound: 0,
			topicA:             []byte("topicA"),
			topicB:             []byte("topicB"),
			seedA:              []byte("seedA"),
			seedB:              []byte("seedA"),
		},
		{
			expectedPeersFound: 1,
			topicA:             []byte("topicA"),
			topicB:             []byte("topicA"),
			seedA:              []byte("seedA"),
			seedB:              []byte("seedA"),
		},
	}

	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	for i, tc := range cases {
		t.Run(fmt.Sprintf("tc: %d", i), func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			mn := p2pmocknet.New(ctx)
			rdvp, err := mn.GenPeer()
			require.NoError(t, err, "failed to generate mocked peer")

			defer rdvp.Close()

			_, rdv_cleanup := ipfsutil.TestingRDVP(ctx, t, rdvp)
			defer rdv_cleanup()

			opts := &ipfsutil.TestingAPIOpts{
				Logger:  logger,
				Mocknet: mn,
				RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
			}

			apiA, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, opts)
			defer cleanup()

			apiB, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, opts)
			defer cleanup()

			err = mn.LinkAll()
			require.NoError(t, err)
			err = mn.ConnectAllButSelf()
			require.NoError(t, err)

			rpA := rendezvous.NewRotationInterval(time.Hour)
			rpB := rendezvous.NewRotationInterval(time.Hour)

			swiperA := NewSwiper(opts.Logger, apiA.Tinder(), rpA)
			swiperB := NewSwiper(opts.Logger, apiB.Tinder(), rpB)

			swiperA.Announce(ctx, tc.topicA, tc.seedA)

			time.Sleep(time.Millisecond * 100)

			ch := make(chan peer.AddrInfo)
			doneFn := func() {}
			go swiperB.WatchTopic(ctx, tc.topicB, tc.seedB, ch, doneFn)

			var foundPeers int

		loop:
			for foundPeers = 0; foundPeers < tc.expectedPeersFound; foundPeers++ {
				select {
				case <-ctx.Done():
					break loop
				case <-ch:
				}
			}

			assert.Equal(t, len(ch), 0)
			assert.Equal(t, tc.expectedPeersFound, foundPeers)
		})
	}
}

func TestAnnounceForPeriod(t *testing.T) {
}
