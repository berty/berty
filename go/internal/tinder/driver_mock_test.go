package tinder

import (
	"context"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMockAdvertise(t *testing.T) {
	const topic = "test_topic'"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New(ctx)

	p1, err := mn.GenPeer()
	require.NoError(t, err)

	server := NewMockDriverServer()
	client := server.Client(p1)

	info1 := p1.Peerstore().PeerInfo(p1.ID())

	require.False(t, server.Exist(topic, info1.ID))

	ttl, err := client.Advertise(ctx, topic)
	require.NoError(t, err)
	require.Greater(t, ttl, time.Duration(0))
	require.True(t, server.Exist(topic, info1.ID))
}

func TestMockFindPeers(t *testing.T) {
	const topic = "test_topic'"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New(ctx)

	p1, err := mn.GenPeer()
	require.NoError(t, err)

	p2, err := mn.GenPeer()
	require.NoError(t, err)

	server := NewMockDriverServer()
	client1 := server.Client(p1)
	client2 := server.Client(p2)

	info1 := p1.Peerstore().PeerInfo(p1.ID())
	server.Advertise(topic, info1, time.Minute)

	for _, client := range []IDriver{client1, client2} {
		out, err := client.FindPeers(ctx, topic)
		require.NoError(t, err)

		var peers []peer.AddrInfo
		for p := range out {
			peers = append(peers, p)
		}

		require.Len(t, peers, 1)
		assert.Equal(t, info1, peers[0])
	}

	info2 := p2.Peerstore().PeerInfo(p2.ID())
	server.Advertise(topic, info2, time.Minute)

	for _, client := range []IDriver{client1, client2} {
		out, err := client.FindPeers(ctx, topic)
		require.NoError(t, err)

		var peers []peer.AddrInfo
		for p := range out {
			peers = append(peers, p)
		}
		require.Len(t, peers, 2)
	}
}

func TestMockSubscribe(t *testing.T) {
	const topic = "test_topic'"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New(ctx)

	p1, err := mn.GenPeer()
	require.NoError(t, err)

	p2, err := mn.GenPeer()
	require.NoError(t, err)
	info2 := p1.Peerstore().PeerInfo(p2.ID())

	p3, err := mn.GenPeer()
	require.NoError(t, err)
	info3 := p1.Peerstore().PeerInfo(p3.ID())

	server := NewMockDriverServer()
	client1 := server.Client(p1)

	{
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		out, err := client1.Subscribe(ctx, topic, MockBufferSize(2))
		require.NoError(t, err)

		server.Advertise(topic, info2, time.Minute)
		server.Advertise(topic, info3, time.Minute)

		peers := map[peer.ID]peer.AddrInfo{}
		for i := 0; i < 2; i++ {
			peer := <-out
			peers[peer.ID] = peer
		}

		p2, ok := peers[info2.ID]
		require.True(t, ok)
		require.Equal(t, info2, p2)

		p3, ok := peers[info3.ID]
		require.True(t, ok)
		require.Equal(t, info3, p3)

		cancel()
		// should be close if context expire
		require.Eventually(t, func() bool {
			select {
			case <-out:
				return true
			default:
				return false
			}
		}, time.Second, time.Millisecond*10)

	}
}

func TestMockUnregister(t *testing.T) {
	const topic = "test_topic'"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New(ctx)

	p1, err := mn.GenPeer()
	require.NoError(t, err)

	server := NewMockDriverServer()
	client := server.Client(p1)

	info1 := p1.Peerstore().PeerInfo(p1.ID())

	server.Advertise(topic, info1, time.Minute)
	require.True(t, server.Exist(topic, info1.ID))

	err = client.Unregister(ctx, topic)
	require.NoError(t, err)
	require.False(t, server.Exist(topic, info1.ID))
}
