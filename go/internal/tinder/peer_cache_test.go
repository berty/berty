package tinder

import (
	"context"
	"runtime"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p/core/peer"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPeerCacheUpdatePeer(t *testing.T) {
	const topic = "test_topic"

	if runtime.GOOS == "windows" {
		t.Skip("unittest not consistent on windows, skipping.")
	}

	peer := peer.AddrInfo{
		ID: "hello",
		Addrs: []ma.Multiaddr{
			ma.StringCast("/ip6/::/tcp/1234"),
		},
	}

	pc := newPeerCache()
	t.Run("add new peer", func(t *testing.T) {
		pc.UpdatePeer(topic, peer)

		tu, ok := pc.topics[topic]
		require.True(t, ok)
		require.NotNil(t, tu)

		ti, ok := tu.peerUpdate[peer.ID]
		require.True(t, ok)
		assert.True(t, time.Now().After(ti))

		speer, ok := pc.peers[peer.ID]
		require.True(t, ok)
		assert.Equal(t, peer, speer)
	})

	t.Run("edit peer multiaddrs", func(t *testing.T) {
		peer.Addrs = []ma.Multiaddr{ma.StringCast("/ip4/1.2.3.4/tcp/1234")}
		pc.UpdatePeer(topic, peer)

		speer, ok := pc.peers[peer.ID]
		require.True(t, ok)
		assert.Len(t, speer.Addrs, 2)
	})
}

func TestPeerCacheWaitForUpdate(t *testing.T) {
	const topic = "test_topic"

	pc := newPeerCache()
	pu := make(PeersUpdate)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	out := make(chan []peer.ID)
	go func() {
		defer cancel()

		for {
			updated, ok := pc.WaitForPeerUpdate(ctx, topic, pu)
			if !ok {
				return
			}

			out <- updated
		}
	}()

	t.Run("should not update on start", func(t *testing.T) {
		select {
		case <-out:
			require.FailNow(t, "should not have received an update")
		case <-ctx.Done():
			require.FailNow(t, "context should not be expired")
		case <-time.After(time.Millisecond * 100):
		}
	})

	p1 := peer.AddrInfo{
		ID:    "peer1",
		Addrs: []ma.Multiaddr{ma.StringCast("/ip4/1.2.3.4/tcp/1234")},
	}

	t.Run("should correctly update", func(t *testing.T) {
		pc.UpdatePeer(topic, p1)

		var updated []peer.ID
		select {
		case <-ctx.Done():
			require.NoError(t, ctx.Err())
		case updated = <-out:
			require.Len(t, updated, 1)
		}

		ps := pc.GetPeers(updated...)
		require.Len(t, ps, 1)
		assert.Equal(t, p1, ps[0])
	})

	t.Run("should not update on same peer", func(t *testing.T) {
		pc.UpdatePeer(topic, p1)

		select {
		case <-out:
			require.FailNow(t, "should not have received an update")
		case <-ctx.Done():
			require.NoError(t, ctx.Err())
		case <-time.After(time.Millisecond * 100):
		}
	})

	p2 := peer.AddrInfo{
		ID:    "peer2",
		Addrs: []ma.Multiaddr{ma.StringCast("/ip6/::/tcp/1234")},
	}

	t.Run("should update on new peer", func(t *testing.T) {
		pc.UpdatePeer(topic, p2)

		var updated []peer.ID
		select {
		case <-ctx.Done():
			require.NoError(t, ctx.Err())
		case updated = <-out:
			require.Len(t, updated, 1)
		}

		ps := pc.GetPeersForTopics(topic)
		require.Len(t, ps, 2)
	})
}
