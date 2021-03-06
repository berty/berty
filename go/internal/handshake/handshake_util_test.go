package handshake

import (
	"context"
	crand "crypto/rand"
	"sync"
	"testing"
	"time"

	ggio "github.com/gogo/protobuf/io"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	p2pnetwork "github.com/libp2p/go-libp2p-core/network"
	p2ppeer "github.com/libp2p/go-libp2p-core/peer"
	p2pmocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/ipfsutil"
)

const testProtocolID = "/berty/handshake_test/1.0.0"

type mockedPeer struct {
	accountID p2pcrypto.PrivKey
	coreAPI   ipfsutil.CoreAPIMock
	peerInfo  p2ppeer.AddrInfo
}

type mockedHandshake struct {
	requester *mockedPeer
	responder *mockedPeer

	cleanup func()
}

type requesterTestFunc func(
	t *testing.T,
	stream p2pnetwork.Stream,
	mh *mockedHandshake,
)

type responderTestFunc func(
	t *testing.T,
	stream p2pnetwork.Stream,
	mh *mockedHandshake,
	wg *sync.WaitGroup,
)

func newMockedPeer(t *testing.T, ctx context.Context, ipfsOpts *ipfsutil.TestingAPIOpts) (*mockedPeer, func()) {
	accountID, _, err := p2pcrypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err, "can't create new identity")

	coreAPI, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts)
	peerInfo := coreAPI.MockNode().Peerstore.PeerInfo(coreAPI.MockNode().Identity)

	return &mockedPeer{
		accountID: accountID,
		coreAPI:   coreAPI,
		peerInfo:  peerInfo,
	}, cleanup
}

func newMockedHandshake(t *testing.T, ctx context.Context) *mockedHandshake {
	t.Helper()

	mn := p2pmocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	_, rdv_cleanup := ipfsutil.TestingRDVP(ctx, t, rdvp)

	opts := &ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	}
	requester, req_cleanup := newMockedPeer(t, ctx, opts)
	responder, res_cleanup := newMockedPeer(t, ctx, opts)

	// link responder & requester
	err = opts.Mocknet.LinkAll()
	require.NoError(t, err, "can't link peers")

	// connect responder & requester
	err = opts.Mocknet.ConnectAllButSelf()
	require.NoError(t, err, "can't connect peers")

	cleanup := func() {
		res_cleanup()
		req_cleanup()
		rdv_cleanup()
		rdvp.Close()
	}

	return &mockedHandshake{
		requester: requester,
		responder: responder,
		cleanup:   cleanup,
	}
}

func (mh *mockedHandshake) close(t *testing.T) {
	t.Helper()

	mh.requester.coreAPI.Close()
	mh.responder.coreAPI.Close()
	mh.cleanup()
}

func newTestHandshakeContext(stream p2pnetwork.Stream, ownAccountID p2pcrypto.PrivKey, peerAccountID p2pcrypto.PubKey) *handshakeContext {
	return &handshakeContext{
		reader:          ggio.NewDelimitedReader(stream, 2048),
		writer:          ggio.NewDelimitedWriter(stream),
		ownAccountID:    ownAccountID,
		peerAccountID:   peerAccountID,
		sharedEphemeral: &[32]byte{},
	}
}

func runHandshakeTest(t *testing.T, requesterTest requesterTestFunc, responderTest responderTestFunc) {
	t.Helper()

	var wg sync.WaitGroup

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mh := newMockedHandshake(t, ctx)
	defer mh.close(t)

	mh.responder.coreAPI.MockNode().PeerHost.SetStreamHandler(
		testProtocolID,
		func(stream p2pnetwork.Stream) {
			wg.Add(1)
			responderTest(t, stream, mh, &wg)
		},
	)

	stream, err := mh.requester.coreAPI.MockNode().PeerHost.NewStream(
		ctx,
		mh.responder.peerInfo.ID,
		testProtocolID,
	)
	require.NoError(t, err, "requester can't dial responder")
	requesterTest(t, stream, mh)

	wg.Wait()
}
