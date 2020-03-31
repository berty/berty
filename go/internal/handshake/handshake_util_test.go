package handshake

import (
	"context"
	crand "crypto/rand"
	"fmt"
	"sync"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/errcode"

	ggio "github.com/gogo/protobuf/io"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	p2pnetwork "github.com/libp2p/go-libp2p-core/network"
	p2ppeer "github.com/libp2p/go-libp2p-core/peer"
	p2pmocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
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

func newMockedPeer(t *testing.T, ctx context.Context, mockNet p2pmocknet.Mocknet) *mockedPeer {
	t.Helper()

	accountID, _, err := p2pcrypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err, "can't create new identity")

	coreAPI := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, mockNet)

	peerInfo := coreAPI.MockNode().Peerstore.PeerInfo(coreAPI.MockNode().Identity)

	return &mockedPeer{
		accountID: accountID,
		coreAPI:   coreAPI,
		peerInfo:  peerInfo,
	}
}

func newMockedHandshake(t *testing.T, ctx context.Context) *mockedHandshake {
	t.Helper()

	mockNet := p2pmocknet.New(ctx)
	requester := newMockedPeer(t, ctx, mockNet)
	responder := newMockedPeer(t, ctx, mockNet)

	_, err := mockNet.LinkPeers(
		requester.peerInfo.ID,
		responder.peerInfo.ID,
	)
	if err != nil {
		require.NoError(t, err, "can't link peers")
	}

	err = requester.coreAPI.Swarm().Connect(ctx, responder.peerInfo)
	if err != nil {
		require.NoError(t, err, "can't connect peers")
	}

	return &mockedHandshake{
		requester: requester,
		responder: responder,
	}
}

func (mh *mockedHandshake) close(t *testing.T) {
	t.Helper()

	mh.requester.coreAPI.Close()
	mh.responder.coreAPI.Close()
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

func requireEqualErrcode(t *testing.T, kind string, expected errcode.ErrCode, actual int32) {
	message := fmt.Sprintf(
		"Wrong %s error code: expected(%s) / actual(%s)",
		kind,
		errcode.ErrCode_name[int32(expected)],
		errcode.ErrCode_name[actual],
	)

	require.EqualValues(t, int32(expected), actual, message)
}

func requireEqualFirstErrcode(t *testing.T, expected errcode.ErrCode, actual error) {
	requireEqualErrcode(t, "first", expected, errcode.FirstCode(actual))
}

func requireEqualLastErrcode(t *testing.T, expected errcode.ErrCode, actual error) {
	requireEqualErrcode(t, "last", expected, errcode.LastCode(actual))
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
