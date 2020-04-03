package handshake

import (
	crand "crypto/rand"
	"sync"
	"testing"
	"time"

	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	p2phelpers "github.com/libp2p/go-libp2p-core/helpers"
	p2pnetwork "github.com/libp2p/go-libp2p-core/network"
	"github.com/stretchr/testify/require"
)

func TestValidHandshake(t *testing.T) {
	var requesterTest requesterTestFunc = func(
		t *testing.T,
		stream p2pnetwork.Stream,
		mh *mockedHandshake,
	) {
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
	t.Log("Requester interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			_ *testing.T,
			stream p2pnetwork.Stream,
			_ *mockedHandshake,
		) {
			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(t, errcode.ErrHandshakeRequesterHello, err)
			requireEqualLastErrcode(t, errcode.ErrStreamRead, err)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidResponderHello(t *testing.T) {
	t.Log("Responder interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(t, errcode.ErrHandshakeResponderHello, err)
			requireEqualLastErrcode(t, errcode.ErrStreamRead, err)
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

			p2phelpers.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidRequesterAuthenticate(t *testing.T) {
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
			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.requester.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrStreamRead, err)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrDeserialization, err)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(
				t,
				errcode.ErrCryptoSignatureVerification,
				err,
			)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(
				t,
				errcode.ErrCryptoSignatureVerification,
				err,
			)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(
				t,
				errcode.ErrCryptoSignatureVerification,
				err,
			)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrDeserialization, err)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrCryptoDecrypt, err)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrCryptoDecrypt, err)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAuthenticate,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrCryptoDecrypt, err)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidResponderAccept(t *testing.T) {
	t.Log("Responder interrupts by closing stream")
	{
		start := time.Now()

		var requesterTest requesterTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
		) {
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrStreamRead, err)
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

			p2phelpers.FullClose(stream)
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
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(
				t,
				errcode.ErrCryptoSignatureVerification,
				err,
			)
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

			p2phelpers.FullClose(stream)
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
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(
				t,
				errcode.ErrCryptoSignatureVerification,
				err,
			)
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

			p2phelpers.FullClose(stream)
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
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrDeserialization, err)
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

			p2phelpers.FullClose(stream)
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
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrCryptoDecrypt, err)
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

			p2phelpers.FullClose(stream)
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
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrCryptoDecrypt, err)
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

			p2phelpers.FullClose(stream)
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
			err := Request(
				stream,
				mh.requester.accountID,
				mh.responder.accountID.GetPublic(),
			)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeResponderAccept,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrCryptoDecrypt, err)
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

			p2phelpers.FullClose(stream)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}

func TestInvalidResponderAcceptAck(t *testing.T) {
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAcknowledge,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrStreamRead, err)
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

			p2phelpers.FullClose(stream)
		}

		var responderTest responderTestFunc = func(
			t *testing.T,
			stream p2pnetwork.Stream,
			mh *mockedHandshake,
			wg *sync.WaitGroup,
		) {
			defer wg.Done()

			_, err := Response(stream, mh.responder.accountID)
			requireEqualFirstErrcode(
				t,
				errcode.ErrHandshakeRequesterAcknowledge,
				err,
			)
			requireEqualLastErrcode(t, errcode.ErrInvalidInput, err)
		}

		runHandshakeTest(t, requesterTest, responderTest)
		t.Logf("\tduration: %s", time.Since(start))
	}
}
