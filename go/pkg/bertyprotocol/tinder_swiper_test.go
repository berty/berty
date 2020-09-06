package bertyprotocol

import (
	"context"
	"encoding/hex"
	"fmt"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"github.com/libp2p/go-libp2p-core/peer"
	p2pmocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRoundTimePeriod_Next(t *testing.T) {
	cases := []struct {
		time   time.Time
		period time.Duration
		out    time.Time
		next   time.Time
	}{
		{
			time:   time.Date(2020, 04, 10, 12, 00, 00, 0, time.UTC),
			period: time.Hour,
			out:    time.Date(2020, 04, 10, 12, 00, 00, 0, time.UTC),
			next:   time.Date(2020, 04, 10, 13, 00, 00, 0, time.UTC),
		},
		{
			time:   time.Date(2020, 04, 10, 12, 00, 00, 0, time.UTC),
			period: -time.Hour,
			out:    time.Date(2020, 04, 10, 12, 00, 00, 0, time.UTC),
			next:   time.Date(2020, 04, 10, 13, 00, 00, 0, time.UTC),
		},
		{
			time:   time.Date(2020, 04, 10, 12, 34, 56, 0, time.UTC),
			period: time.Hour,
			out:    time.Date(2020, 04, 10, 12, 00, 00, 0, time.UTC),
			next:   time.Date(2020, 04, 10, 13, 00, 00, 0, time.UTC),
		},
	}

	for i, tc := range cases {
		t.Run(fmt.Sprintf("tc: %d", i), func(t *testing.T) {
			rounded := roundTimePeriod(tc.time, tc.period)
			require.Equal(t, tc.out, rounded)

			next := nextTimePeriod(tc.time, tc.period)
			require.Equal(t, tc.next, next)
		})
	}
}

func TestGenerateRendezvousPointForPeriod(t *testing.T) {
	baseTimeA := time.Date(2020, 04, 10, 12, 00, 00, 0, time.UTC)
	baseTimeB := time.Date(2020, 04, 10, 13, 00, 00, 0, time.UTC)

	cases := []struct {
		topic    []byte
		seed     []byte
		expected string // as hex string
		time     time.Time
	}{
		{
			topic:    []byte("topicA"),
			seed:     []byte("seedA"),
			expected: "8b7fdc831ca90f78995f32d8b9cf7bc8682a7fc250fe13a9b7c5c0851a3b8cbc",
			time:     baseTimeA,
		},
		{
			topic:    []byte("topicA"),
			seed:     []byte("seedA"),
			expected: "ec86e0cb471195733ebbeb04277aafcfc60a19c09195cf04e60b50857465c27f",
			time:     baseTimeB,
		},
		{
			topic:    []byte("topicA"),
			seed:     []byte("seedB"),
			expected: "f87f5dfc4e8a68be75d6008ab3aa0a4295b6049e9ec21f03d0c1410895171683",
			time:     baseTimeA,
		},
		{
			topic:    []byte("topicB"),
			seed:     []byte("seedA"),
			expected: "6350bd507198a9acb816dcadae8c5c6ff6c96ee6c9606c8ebe15c1f645ac4c4e",
			time:     baseTimeA,
		},
	}

	for i, tc := range cases {
		t.Run(fmt.Sprintf("tc: %d", i), func(t *testing.T) {
			point := generateRendezvousPointForPeriod(tc.topic, tc.seed, tc.time)
			require.Equal(t, tc.expected, hex.EncodeToString(point))
		})
	}
}

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

			swiperA := NewSwiper(opts.Logger, apiA.PubSub(), time.Hour)
			swiperB := NewSwiper(opts.Logger, apiB.PubSub(), time.Hour)

			swiperA.Announce(ctx, tc.topicA, tc.seedA)

			time.Sleep(time.Millisecond * 100)

			ch := make(chan peer.AddrInfo)
			doneFn := func() {}
			go swiperB.WatchTopic(ctx, tc.topicB, tc.seedB, ch, doneFn)

			var foundPeers int
			for foundPeers = 0; foundPeers < tc.expectedPeersFound; foundPeers++ {
				select {
				case <-ctx.Done():
					break
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
