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
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

// Request init a handshake with the responder
func Request(stream p2pnetwork.Stream, ownAccountID p2pcrypto.PrivKey, peerAccountID p2pcrypto.PubKey) error {
	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	return RequestUsingReaderWriter(context.TODO(), zap.NewNop(), reader, writer, ownAccountID, peerAccountID)
}

// Response handle the handshake inited by the requester
func Response(stream p2pnetwork.Stream, ownAccountID p2pcrypto.PrivKey) (p2pcrypto.PubKey, error) {
	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	return ResponseUsingReaderWriter(context.TODO(), zap.NewNop(), reader, writer, ownAccountID)
}

func TestValidHandshake(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	var requesterTest requesterTestFunc = func(
		t *testing.T,
		stream p2pnetwork.Stream,
		mh *mockedHandshake,
	) {
		defer ipfsutil.FullClose(stream)

		err := Request(
			stream,
			mh.requester.accountID,
			mh.responder.accountID.GetPublic(),
		)
		require.NoError(t, err, "handshake request failed")
	}

	var responderTest responderTestFunc = func(
		t *testing.T,
		stream p2pnetwork.Stream,
		mh *mockedHandshake,
		wg *sync.WaitGroup,
	) {
		defer wg.Done()
		defer ipfsutil.FullClose(stream)

		peerAccountID, err := Response(stream, mh.responder.accountID)
		require.NoError(t, err, "handshake response failed")

		require.True(
			t,
			peerAccountID.Equals(mh.requester.accountID.GetPublic()),
			"received peerAccountID by responder != requester's AccountID",
		)
	}

	runHandshakeTest(t, requesterTest, responderTest)
}

func TestInvalidRequesterHello(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	t.Log("Requester interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			_ *testing.T,
			stream p2pnetwork.Stream,
			_ *mockedHandshake,
		) {
			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Contains(t, errcode.Codes(err), errcode.ErrHandshakeRequesterHello)
			require.Contains(t, errcode.Codes(err), errcode.ErrStreamRead)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidResponderHello(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	t.Log("Responder interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderHello, errcode.ErrHandshakePeerEphemeralKeyRecv, errcode.ErrStreamRead})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidRequesterAuthenticate(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	t.Log("Requester interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			// Interrupt step by closing stream
			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.requester.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrStreamRead})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester sends invalid AccountID")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			var request RequesterAuthenticatePayload

			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			// Send invalid AccountID
			request.RequesterAccountId = []byte("NotAKey")
			request.RequesterAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			requestBytes, err := request.Marshal()
			require.NoError(t, err, "request marshaling failed")

			boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
			require.NoError(t, err, "Requester Authenticate box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				&nonceRequesterAuthenticate,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrDeserialization})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester sends another AccountID")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			var request RequesterAuthenticatePayload

			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			// Send another AccountID
			_, wrongAccountIDPub, err := p2pcrypto.GenerateEd25519Key(crand.Reader)
			require.NoError(t, err, "wrongAccountID generation failed")

			request.RequesterAccountId, err = p2pcrypto.MarshalPublicKey(wrongAccountIDPub)
			require.NoError(t, err, "wrongAccountID marshaling failed")

			request.RequesterAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			requestBytes, err := request.Marshal()
			require.NoError(t, err, "request marshaling failed")

			boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
			require.NoError(t, err, "Requester Authenticate box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				&nonceRequesterAuthenticate,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrCryptoSignatureVerification})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester signs with another AccountID")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			var request RequesterAuthenticatePayload

			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			request.RequesterAccountId, err = p2pcrypto.MarshalPublicKey(hc.ownAccountID.GetPublic())
			require.NoError(t, err, "ownAccountID marshaling failed")

			// Sign with another AccountID
			wrongAccountID, _, err := p2pcrypto.GenerateEd25519Key(crand.Reader)
			require.NoError(t, err, "wrongAccountID generation failed")

			request.RequesterAccountSig, err = wrongAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			requestBytes, err := request.Marshal()
			require.NoError(t, err, "request marshaling failed")

			boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
			require.NoError(t, err, "Requester Authenticate box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				&nonceRequesterAuthenticate,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrCryptoSignatureVerification})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester signs invalid proof")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			var request RequesterAuthenticatePayload

			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			request.RequesterAccountId, err = p2pcrypto.MarshalPublicKey(hc.ownAccountID.GetPublic())
			require.NoError(t, err, "ownAccountID marshaling failed")

			// Sign invalid proof
			request.RequesterAccountSig, err = hc.ownAccountID.Sign([]byte("WrongProof"))
			require.NoError(t, err, "sharedEphemeral signing failed")

			requestBytes, err := request.Marshal()
			require.NoError(t, err, "request marshaling failed")

			boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
			require.NoError(t, err, "Requester Authenticate box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				&nonceRequesterAuthenticate,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrCryptoSignatureVerification})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester sends invalid request content")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			// Send invalid request content
			requestBytes := []byte("WrongRequestContent")

			boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
			require.NoError(t, err, "Requester Authenticate box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				&nonceRequesterAuthenticate,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrDeserialization})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester seals box using another key")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			var request RequesterAuthenticatePayload

			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			request.RequesterAccountId, err = p2pcrypto.MarshalPublicKey(hc.ownAccountID.GetPublic())
			require.NoError(t, err, "ownAccountID marshaling failed")

			request.RequesterAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			requestBytes, err := request.Marshal()
			require.NoError(t, err, "request marshaling failed")

			// Seal box using another key
			wrongBoxKey := &[32]byte{}
			crand.Read(wrongBoxKey[:])

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				&nonceRequesterAuthenticate,
				wrongBoxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrCryptoDecrypt})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester seals using another nonce")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			var request RequesterAuthenticatePayload

			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			request.RequesterAccountId, err = p2pcrypto.MarshalPublicKey(hc.ownAccountID.GetPublic())
			require.NoError(t, err, "ownAccountID marshaling failed")

			request.RequesterAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			requestBytes, err := request.Marshal()
			require.NoError(t, err, "request marshaling failed")

			boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
			require.NoError(t, err, "Requester Authenticate box key gen failed")

			// Seals using another nonce
			wrongNonce, err := cryptoutil.GenerateNonce()
			require.NoError(t, err, "nonce generation failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				requestBytes,
				wrongNonce,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrCryptoDecrypt})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester sends invalid box content")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			// Send invalid box content
			hc.writer.WriteMsg(&BoxEnvelope{Box: []byte("WrongBoxContent")})

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAuthenticate, errcode.ErrCryptoDecrypt})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidResponderAccept(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	t.Log("Responder interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrStreamRead})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Responder signs with another AccountID")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrCryptoSignatureVerification})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			var response ResponderAcceptPayload

			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			// Sign with another AccountID
			wrongAccountID, _, err := p2pcrypto.GenerateEd25519Key(crand.Reader)
			require.NoError(t, err, "wrongAccountID generation failed")

			response.ResponderAccountSig, err = wrongAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			responseBytes, err := response.Marshal()
			require.NoError(t, err, "response marshaling failed")

			boxKey, err := hc.computeResponderAcceptBoxKey()
			require.NoError(t, err, "ResponderAccept Accept box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				responseBytes,
				&nonceResponderAccept,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Responder signs invalid proof")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrCryptoSignatureVerification})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			var response ResponderAcceptPayload

			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			// Sign invalid proof
			response.ResponderAccountSig, err = hc.ownAccountID.Sign([]byte("WrongProof"))
			require.NoError(t, err, "sharedEphemeral signing failed")

			responseBytes, err := response.Marshal()
			require.NoError(t, err, "response marshaling failed")

			boxKey, err := hc.computeResponderAcceptBoxKey()
			require.NoError(t, err, "ResponderAccept Accept box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				responseBytes,
				&nonceResponderAccept,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Responder sends invalid response content")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrDeserialization})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			// Send invalid response content
			responseBytes := []byte("WrongResponseContent")

			boxKey, err := hc.computeResponderAcceptBoxKey()
			require.NoError(t, err, "ResponderAccept Accept box key gen failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				responseBytes,
				&nonceResponderAccept,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Responder seals box using another key")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrCryptoDecrypt})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			var response ResponderAcceptPayload

			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			response.ResponderAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			responseBytes, err := response.Marshal()
			require.NoError(t, err, "response marshaling failed")

			// Seal box using another key
			wrongBoxKey := &[32]byte{}
			crand.Read(wrongBoxKey[:])

			boxContent := box.SealAfterPrecomputation(
				nil,
				responseBytes,
				&nonceResponderAccept,
				wrongBoxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Responder seals using another nonce")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrCryptoDecrypt})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			var response ResponderAcceptPayload

			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			response.ResponderAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
			require.NoError(t, err, "sharedEphemeral signing failed")

			responseBytes, err := response.Marshal()
			require.NoError(t, err, "response marshaling failed")

			boxKey, err := hc.computeResponderAcceptBoxKey()
			require.NoError(t, err, "ResponderAccept Accept box key gen failed")

			// Seals using another nonce
			wrongNonce, err := cryptoutil.GenerateNonce()
			require.NoError(t, err, "nonce generation failed")

			boxContent := box.SealAfterPrecomputation(
				nil,
				responseBytes,
				wrongNonce,
				boxKey,
			)

			hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent})

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Responder sends invalid box content")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			defer ipfsutil.FullClose(stream)

			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeResponderAccept, errcode.ErrCryptoDecrypt})
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			hc := newTestHandshakeContext(stream, mh.responder.accountID, nil)

			err := hc.receiveRequesterHello()
			require.NoError(t, err, "receive RequesterHello failed")

			err = hc.sendResponderHello()
			require.NoError(t, err, "send ResponderHello failed")

			err = hc.receiveRequesterAuthenticate()
			require.NoError(t, err, "receive RequesterAuthenticate failed")

			// Send wrong boxContent
			hc.writer.WriteMsg(&BoxEnvelope{Box: []byte("WrongBoxContent")})

			ipfsutil.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidResponderAcceptAck(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	t.Log("Requester interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			err = hc.sendRequesterAuthenticate()
			require.NoError(t, err, "send RequesterAuthenticate failed")

			err = hc.receiveResponderAccept()
			require.NoError(t, err, "receive ResponderAccept failed")

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAcknowledge, errcode.ErrStreamRead})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}

	t.Log("Requester sends acknowledge with: success == false")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			hc := newTestHandshakeContext(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)

			err := hc.sendRequesterHello()
			require.NoError(t, err, "send RequesterHello failed")

			err = hc.receiveResponderHello()
			require.NoError(t, err, "receive ResponderHello failed")

			err = hc.sendRequesterAuthenticate()
			require.NoError(t, err, "send RequesterAuthenticate failed")

			err = hc.receiveResponderAccept()
			require.NoError(t, err, "receive ResponderAccept failed")

			acknowledge := &RequesterAcknowledgePayload{Success: false}
			hc.writer.WriteMsg(acknowledge)

			ipfsutil.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()
			defer ipfsutil.FullClose(stream)

			_, err := Response(stream, mh.responder.accountID)
			require.Equal(t, errcode.Codes(err), []errcode.ErrCode{errcode.ErrHandshakeRequesterAcknowledge, errcode.ErrInvalidInput})
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}
