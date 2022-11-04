package tinder

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	p2putil "github.com/libp2p/go-libp2p-netutil"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	dbrdvp "github.com/libp2p/go-libp2p-rendezvous/db/sqlite"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/stretchr/testify/require"
)

var (
	ErrChannelNotEmpty = fmt.Errorf("channel not empty")
	ErrChannelTimeout  = fmt.Errorf("waiting for channel: timeout")
)

func makeRendezvousService(t *testing.T, mn mocknet.Mocknet) (target peer.ID, svc *rendezvous.RendezvousService) {
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)

	peer, err := mn.GenPeer()
	require.NoError(t, err)

	pubsubsync, err := rendezvous.NewSyncInMemProvider(peer)
	require.NoError(t, err)

	dbi, err := dbrdvp.OpenDB(ctx, ":memory:")
	require.NoError(t, err)
	t.Cleanup(func() { _ = dbi.Close() })

	return peer.ID(), rendezvous.NewRendezvousService(peer, dbi, pubsubsync)
}

func testWaitForPeers(t *testing.T, out <-chan peer.AddrInfo, timeout time.Duration) (*peer.AddrInfo, error) {
	t.Helper()

	select {
	case p := <-out:
		return &p, nil
	case <-time.After(timeout):
		return nil, fmt.Errorf("timeout while waiting for peer")
	}
}

func testDrainChannel(t *testing.T, out <-chan peer.AddrInfo, timeout time.Duration) error {
	t.Helper()

	for {
		select {
		case _, ok := <-out:
			if !ok {
				return nil // ok
			}

			return fmt.Errorf("channel wasn't empty")
		case <-time.After(timeout):
			return fmt.Errorf("timeout while waiting for peer")
		}
	}
}

func testPeersChanToSlice(t *testing.T, out <-chan peer.AddrInfo) (peers []*peer.AddrInfo) {
	t.Helper()
	peers = []*peer.AddrInfo{}

	for p := range out {
		peers = append(peers, &p)
	}

	return
}

func genLocalPeer(t *testing.T, mn mocknet.Mocknet) host.Host {
	sk, err := p2putil.RandTestBogusPrivateKey()
	require.NoError(t, err)

	a, err := ma.NewMultiaddr("/ip4/127.0.0.1/tcp/0")
	require.NoError(t, err)

	h, err := mn.AddPeer(sk, a)
	require.NoError(t, err)

	return h
}
