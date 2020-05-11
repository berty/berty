package bertyprotocol

import (
	"encoding/hex"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"context"

	"io"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"github.com/libp2p/go-libp2p-core/peer"
	p2pmocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
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
	testutil.SkipSlow(t)

	defaultTime := time.Now()

	cases := []struct {
		expectedPeersFound int64
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

	logger := testutil.Logger(t)
	for i, tc := range cases {
		t.Run(fmt.Sprintf("tc: %d", i), func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())

			mn := p2pmocknet.New(ctx)
			rdvp, err := mn.GenPeer()
			require.NoError(t, err, "failed to generate mocked peer")

			_, rdv_cleanup := ipfsutil.TestingRDVP(ctx, t, rdvp)
			defer rdv_cleanup()

			opts := &ipfsutil.TestingAPIOpts{
				Logger:  logger,
				Mocknet: mn,
				RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
			}
			ctx, cancel = context.WithTimeout(context.Background(), 5000*time.Millisecond)
			defer cancel()

			apiA, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, opts)
			defer cleanup()

			apiB, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, opts)
			defer cleanup()

			err = mn.LinkAll()
			require.NoError(t, err)
			err = mn.ConnectAllButSelf()
			require.NoError(t, err)

			swiperA := newSwiper(apiA.Tinder(), zap.NewNop(), time.Hour)
			swiperB := newSwiper(apiB.Tinder(), zap.NewNop(), time.Hour)
			var foundPeers int64 = 0
			wg := sync.WaitGroup{}
			wg.Add(1)

			announcesA, errsA := swiperA.announceForPeriod(ctx, tc.topicA, tc.seedA, defaultTime)

			func() {
				select {
				case <-announcesA:
					return

				case err := <-errsA:
					if err == io.EOF {
						require.NoError(t, err, "unexpected EOF")
						return
					}

					require.NoError(t, err)
				}
			}()

			time.Sleep(time.Millisecond * 100)
			var ch chan peer.AddrInfo
			ch, errB := swiperB.watchForPeriod(ctx, tc.topicB, tc.seedB, defaultTime)

			require.NoError(t, errB)

			go func() {
				for range ch {
					atomic.AddInt64(&foundPeers, 1)
				}

				wg.Done()
			}()

			<-ctx.Done()
			wg.Wait()

			require.Equal(t, tc.expectedPeersFound, foundPeers)
		})
	}
}

func TestAnnounceForPeriod(t *testing.T) {

}
