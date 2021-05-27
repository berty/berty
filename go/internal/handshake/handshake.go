package handshake

import (
	crand "crypto/rand"
	"encoding/base64"

	ggio "github.com/gogo/protobuf/io"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/tyber"
)

// Constant nonces
var (
	nonceRequesterAuthenticate = [cryptoutil.NonceSize]byte{1}
	nonceResponderAccept       = [cryptoutil.NonceSize]byte{2}
)

// Common struct and methods
type handshakeContext struct {
	reader          ggio.Reader
	writer          ggio.Writer
	ownAccountID    p2pcrypto.PrivKey
	peerAccountID   p2pcrypto.PubKey
	ownEphemeral    *[cryptoutil.KeySize]byte
	peerEphemeral   *[cryptoutil.KeySize]byte
	sharedEphemeral *[cryptoutil.KeySize]byte
}

func (hc *handshakeContext) toTyberStepMutator() tyber.StepMutator {
	return func(s tyber.Step) tyber.Step {
		if hc == nil {
			return s
		}
		if hc.peerAccountID != nil {
			if cpkb, err := hc.peerAccountID.Raw(); err == nil {
				s.Details = append(s.Details, tyber.Detail{Name: "ContactPublicKey", Description: base64.RawURLEncoding.EncodeToString(cpkb)})
			}
		}
		for key, val := range map[string]*[cryptoutil.KeySize]byte{
			"OwnEphemeral":    hc.ownEphemeral,
			"PeerEphemeral":   hc.peerEphemeral,
			"SharedEphemeral": hc.sharedEphemeral,
		} {
			if val != nil {
				s.Details = append(s.Details, tyber.Detail{
					Name:        key,
					Description: base64.RawURLEncoding.EncodeToString(val[:]),
				})
			}
		}
		return s
	}
}

// Generates own Ephemeral key pair and send pub key to peer
func (hc *handshakeContext) generateOwnEphemeralAndSendPubKey() error {
	// Generate own Ephemeral key pair
	ownEphemeralPub, ownEphemeralPriv, err := box.GenerateKey(crand.Reader)
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	// Set own Ephemeral priv key in Handshake Context
	hc.ownEphemeral = ownEphemeralPriv

	// Send own Ephemeral pub key to peer
	hello := HelloPayload{EphemeralPubKey: ownEphemeralPub[:]}
	if err := hc.writer.WriteMsg(&hello); err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	return nil
}

// Receives peer's Ephemeral pub key
func (hc *handshakeContext) receivePeerEphemeralPubKey() error {
	var err error

	// Receive peer's Ephemeral pub key
	hello := HelloPayload{}
	if err := hc.reader.ReadMsg(&hello); err != nil {
		return errcode.ErrStreamRead.Wrap(err)
	}

	// Set peer's Ephemeral pub key in Handshake Context
	hc.peerEphemeral, err = cryptoutil.KeySliceToArray(hello.EphemeralPubKey)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	return nil
}

// Computes box key for step 3 (Requester Authenticate): box[a.b|a.B]
func (hc *handshakeContext) computeRequesterAuthenticateBoxKey(asRequester bool) (*[cryptoutil.KeySize]byte, error) {
	var sharedReqEphemeralRespAccountID [cryptoutil.KeySize]byte

	// If this function was called by the requester
	if asRequester {
		// Convert Ed25519 peer's AccountID key to X25519 key
		mongPeerAccountID, err := cryptoutil.EdwardsToMontgomeryPub(hc.peerAccountID)
		if err != nil {
			return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
		}

		// Compute shared key from own Ephemeral key and peer's AccountID key
		box.Precompute(
			&sharedReqEphemeralRespAccountID,
			mongPeerAccountID,
			hc.ownEphemeral,
		)
	} else {
		// Convert Ed25519 own AccountID key to X25519 key
		mongOwnAccountID, err := cryptoutil.EdwardsToMontgomeryPriv(hc.ownAccountID)
		if err != nil {
			return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
		}

		// Compute shared key from peer's Ephemeral key and own AccountID key
		box.Precompute(
			&sharedReqEphemeralRespAccountID,
			hc.peerEphemeral,
			mongOwnAccountID,
		)
	}

	// Concatenate both shared keys and hash them using sha256
	boxKey := cryptoutil.ConcatAndHashSha256(
		hc.sharedEphemeral[:],
		sharedReqEphemeralRespAccountID[:],
	)

	return boxKey, nil
}

// Computes box key for step 4 (Responder Accept): box[a.b|A.B]
func (hc *handshakeContext) computeResponderAcceptBoxKey() (*[cryptoutil.KeySize]byte, error) {
	var sharedAccountID [cryptoutil.KeySize]byte

	// Convert Ed25519 AccountID keys to X25519 keys
	mongOwnAccountID, mongPeerAccountID, err := cryptoutil.EdwardsToMontgomery(
		hc.ownAccountID,
		hc.peerAccountID,
	)
	if err != nil {
		return nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	// Compute shared key from AccountID keys (X25519 converted)
	box.Precompute(&sharedAccountID, mongPeerAccountID, mongOwnAccountID)

	// Concatenate both shared keys and hash them using sha256
	boxKey := cryptoutil.ConcatAndHashSha256(
		hc.sharedEphemeral[:],
		sharedAccountID[:],
	)

	return boxKey, nil
}
