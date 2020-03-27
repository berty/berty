package handshake

import (
	"errors"

	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"

	ggio "github.com/gogo/protobuf/io"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	p2phelpers "github.com/libp2p/go-libp2p-core/helpers"
	p2pnetwork "github.com/libp2p/go-libp2p-core/network"
)

// Request init a handshake with the responder
func Request(stream p2pnetwork.Stream, ownAccountID p2pcrypto.PrivKey, peerAccountID p2pcrypto.PubKey) error {
	defer p2phelpers.FullClose(stream)

	hc := &handshakeContext{
		reader:          ggio.NewDelimitedReader(stream, 2048),
		writer:          ggio.NewDelimitedWriter(stream),
		ownAccountID:    ownAccountID,
		peerAccountID:   peerAccountID,
		sharedEphemeral: &[cryptoutil.KeySize]byte{},
	}

	// Handshake steps on requester side (see comments below)
	if err := hc.sendRequesterHello(); err != nil {
		return errcode.ErrHandshakeRequesterHello.Wrap(err)
	}
	if err := hc.receiveResponderHello(); err != nil {
		return errcode.ErrHandshakeResponderHello.Wrap(err)
	}
	if err := hc.sendRequesterAuthenticate(); err != nil {
		return errcode.ErrHandshakeRequesterAuthenticate.Wrap(err)
	}
	if err := hc.receiveResponderAccept(); err != nil {
		return errcode.ErrHandshakeResponderAccept.Wrap(err)
	}
	if err := hc.sendRequesterAcknowledge(); err != nil {
		return errcode.ErrHandshakeRequesterAcknowledge.Wrap(err)
	}

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
	var acknowledge = &RequesterAcknowledgePayload{Success: true}

	// Send Acknowledge to responder
	if err := hc.writer.WriteMsg(acknowledge); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	return nil
}
