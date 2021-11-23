package rendezvous_test

import (
	"encoding/hex"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/rendezvous"
)

func TestRoundTimePeriod_Next(t *testing.T) {
	cases := []struct {
		time   time.Time
		period time.Duration
		out    time.Time
		next   time.Time
	}{
		{
			time:   time.Date(2020, 4, 10, 12, 0, 0, 0, time.UTC),
			period: time.Hour,
			out:    time.Date(2020, 4, 10, 12, 0, 0, 0, time.UTC),
			next:   time.Date(2020, 4, 10, 13, 0, 0, 0, time.UTC),
		},
		{
			time:   time.Date(2020, 4, 10, 12, 0, 0, 0, time.UTC),
			period: -time.Hour,
			out:    time.Date(2020, 4, 10, 12, 0, 0, 0, time.UTC),
			next:   time.Date(2020, 4, 10, 13, 0, 0, 0, time.UTC),
		},
		{
			time:   time.Date(2020, 4, 10, 12, 34, 56, 0, time.UTC),
			period: time.Hour,
			out:    time.Date(2020, 4, 10, 12, 0, 0, 0, time.UTC),
			next:   time.Date(2020, 4, 10, 13, 0, 0, 0, time.UTC),
		},
	}

	for i, tc := range cases {
		t.Run(fmt.Sprintf("tc: %d", i), func(t *testing.T) {
			rounded := rendezvous.RoundTimePeriod(tc.time, tc.period)
			require.Equal(t, tc.out, rounded)

			next := rendezvous.NextTimePeriod(tc.time, tc.period)
			require.Equal(t, tc.next, next)
		})
	}
}

func TestGenerateRendezvousPointForPeriod(t *testing.T) {
	baseTimeA := time.Date(2020, 4, 10, 12, 0, 0, 0, time.UTC)
	baseTimeB := time.Date(2020, 4, 10, 13, 0, 0, 0, time.UTC)

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
			point := rendezvous.GenerateRendezvousPointForPeriod(tc.topic, tc.seed, tc.time)
			require.Equal(t, tc.expected, hex.EncodeToString(point))
		})
	}
}
