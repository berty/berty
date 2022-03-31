package handshake

import (
	"context"
	"errors"

	ggio "github.com/gogo/protobuf/io"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/tyber"
)

// RequestUsingReaderWriter init a handshake with the responder, using provided ggio reader and writer
func RequestUsingReaderWriter(ctx context.Context, logger *zap.Logger, reader ggio.Reader, writer ggio.Writer, ownAccountID p2pcrypto.PrivKey, peerAccountID p2pcrypto.PubKey) error {
	hc := &handshakeContext{
		reader:          reader,
		writer:          writer,
		ownAccountID:    ownAccountID,
		peerAccountID:   peerAccountID,
		sharedEphemeral: &[cryptoutil.KeySize]byte{},
	}

	// Handshake steps on requester side (see comments below)
	if err := hc.sendRequesterHello(); err != nil {
		return errcode.ErrHandshakeRequesterHello.Wrap(err)
	}
	tyber.LogStep(ctx, logger, "Sent hello", hc.toTyberStepMutator())
	if err := hc.receiveResponderHello(); err != nil {
		return errcode.ErrHandshakeResponderHello.Wrap(err)
	}
	tyber.LogStep(ctx, logger, "Received hello", hc.toTyberStepMutator())
	if err := hc.sendRequesterAuthenticate(); err != nil {
		return errcode.ErrHandshakeRequesterAuthenticate.Wrap(err)
	}
	tyber.LogStep(ctx, logger, "Sent authenticate", hc.toTyberStepMutator())
	if err := hc.receiveResponderAccept(); err != nil {
		return errcode.ErrHandshakeResponderAccept.Wrap(err)
	}
	tyber.LogStep(ctx, logger, "Received accept", hc.toTyberStepMutator())
	if err := hc.sendRequesterAcknowledge(); err != nil {
		return errcode.ErrHandshakeRequesterAcknowledge.Wrap(err)
	}
	tyber.LogStep(ctx, logger, "Sent acknowledge", hc.toTyberStepMutator())

	return nil
}

// 1st step - Requester sends: a
func (hc *handshakeContext) sendRequesterHello() error {
	if err := hc.generateOwnEphemeralAndSendPubKey(); err != nil {
		return errcode.ErrHandshakeOwnEphemeralKeyGenSend.Wrap(err)
	}

	return nil
}

// 2nd step - Requester receives: b
func (hc *handshakeContext) receiveResponderHello() error {
	if err := hc.receivePeerEphemeralPubKey(); err != nil {
		return errcode.ErrHandshakePeerEphemeralKeyRecv.Wrap(err)
	}

	// Compute shared key from Ephemeral keys
	box.Precompute(hc.sharedEphemeral, hc.peerEphemeral, hc.ownEphemeral)

	return nil
}

// 3rd step - Requester sends: box[a.b|a.B](A,sig[A](a.b))
func (hc *handshakeContext) sendRequesterAuthenticate() error {
	var (
		request RequesterAuthenticatePayload
		err     error
	)

	// Set own AccountID pub key and proof (shared_a_b signed by own AccountID)
	// in RequesterAuthenticatePayload message before marshaling it
	request.RequesterAccountId, err = p2pcrypto.MarshalPublicKey(hc.ownAccountID.GetPublic())
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}
	request.RequesterAccountSig, err = hc.ownAccountID.Sign(hc.sharedEphemeral[:])
	if err != nil {
		return errcode.ErrCryptoSignature.Wrap(err)
	}
	requestBytes, err := request.Marshal()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	// Compute box key and seal marshaled RequesterAuthenticatePayload using
	// constant nonce (see handshake.go)
	boxKey, err := hc.computeRequesterAuthenticateBoxKey(true)
	if err != nil {
		return errcode.ErrHandshakeRequesterAuthenticateBoxKeyGen.Wrap(err)
	}
	boxContent := box.SealAfterPrecomputation(
		nil,
		requestBytes,
		&nonceRequesterAuthenticate,
		boxKey,
	)

	// Send BoxEnvelope to responder
	if err = hc.writer.WriteMsg(&BoxEnvelope{Box: boxContent}); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	return nil
}

// 4th step - Requester receives: box[a.b|A.B](sig[B](a.b))
func (hc *handshakeContext) receiveResponderAccept() error {
	var (
		boxEnvelope BoxEnvelope
		response    ResponderAcceptPayload
	)

	// Receive BoxEnvelope from responder
	if err := hc.reader.ReadMsg(&boxEnvelope); err != nil {
		return errcode.ErrStreamRead.Wrap(err)
	}

	// Compute box key and open marshaled RequesterAuthenticatePayload using
	// constant nonce (see handshake.go)
	boxKey, err := hc.computeResponderAcceptBoxKey()
	if err != nil {
		return errcode.ErrHandshakeResponderAcceptBoxKeyGen.Wrap(err)
	}

	respBytes, _ := box.OpenAfterPrecomputation(
		nil,
		boxEnvelope.Box,
		&nonceResponderAccept,
		boxKey,
	)
	if respBytes == nil {
		err := errors.New("box opening failed")
		return errcode.ErrCryptoDecrypt.Wrap(err)
	}

	// Unmarshal ResponderAcceptPayload
	err = response.Unmarshal(respBytes)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	// Verify proof (shared_a_b signed by peer's AccountID)
	valid, err := hc.peerAccountID.Verify(
		hc.sharedEphemeral[:],
		response.ResponderAccountSig,
	)
	if err != nil {
		return errcode.ErrCryptoSignatureVerification.Wrap(err)
	} else if !valid {
		return errcode.ErrCryptoSignatureVerification
	}

	return nil
}

// 5th step - Requester sends: ok
func (hc *handshakeContext) sendRequesterAcknowledge() error {
	acknowledge := &RequesterAcknowledgePayload{Success: true}

	// Send Acknowledge to responder
	if err := hc.writer.WriteMsg(acknowledge); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	return nil
}
