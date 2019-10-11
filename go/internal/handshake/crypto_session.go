package handshake

import (
	"encoding/binary"

	"go.uber.org/zap"

	"berty.tech/go/internal/crypto"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"

	"golang.org/x/crypto/nacl/box"
)

const SupportedKeyType = p2pcrypto.Ed25519

type handshakeSession struct {
	ownSigChain           *crypto.SigChain
	ownDevicePrivateKey   p2pcrypto.PrivKey
	selfBoxPrivateKey     *[32]byte
	selfBoxPublicKey      *[32]byte
	otherBoxPublicKey     *[32]byte
	nonce                 uint16
	selfSigningPrivateKey p2pcrypto.PrivKey
	otherSigningPublicKey p2pcrypto.PubKey
	accountKeyToProve     p2pcrypto.PubKey
}

func (h *handshakeSession) SetOtherKeys(sign p2pcrypto.PubKey, box []byte) error {
	keyArr, err := bytesSliceToArray(box)
	if err != nil {
		return err
	}

	if sign.Type() != SupportedKeyType {
		return ErrInvalidKeyType
	}

	h.otherSigningPublicKey = sign
	h.otherBoxPublicKey = keyArr

	return nil
}

func (h *handshakeSession) setAccountKeyToProve(key p2pcrypto.PubKey) {
	h.accountKeyToProve = key
}

func (h *handshakeSession) GetPublicKeys() (sign p2pcrypto.PubKey, box []byte) {
	return h.selfSigningPrivateKey.GetPublic(), b32Slice(h.selfBoxPublicKey)
}

func computeValueToProvePubKey(keyToProve p2pcrypto.PubKey, receiverSigKey *[32]byte) ([]byte, error) {
	if keyToProve == nil || receiverSigKey == nil {
		return nil, ErrParams
	}

	keyToProveBytes, err := keyToProve.Raw()
	if err != nil {
		return nil, err
	}

	signedValue := append(keyToProveBytes, b32Slice(receiverSigKey)...)

	return signedValue, nil
}

func computeValueToProveDevicePubKeyAndSigChain(keyToProve *[32]byte, chain *crypto.SigChain) ([]byte, error) {
	if keyToProve == nil || chain == nil {
		return nil, ErrParams
	}

	sigChainBytes, err := chain.Marshal()
	if err != nil {
		return nil, err
	}

	signedValue := append(sigChainBytes, b32Slice(keyToProve)...)

	return signedValue, nil
}

func (h *handshakeSession) ProveOtherKey() ([]byte, error) {
	// Step 3a (out) : sig_a1(B·b1)
	if h.accountKeyToProve == nil {
		return nil, ErrSessionInvalid
	}

	signedValue, err := computeValueToProvePubKey(h.accountKeyToProve, h.otherBoxPublicKey)

	if err != nil {
		return nil, err
	}

	sig, err := h.selfSigningPrivateKey.Sign(signedValue)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOwnKeyProof(sig []byte) error {
	// Step 3a (in) : ensure sig_a1(B·b1) is valid
	initEntry, err := h.ownSigChain.GetInitialEntry()
	if err != nil {
		return err
	}

	accountPubKey, err := initEntry.GetSubject()
	if err != nil {
		return err
	}

	signedValue, err := computeValueToProvePubKey(accountPubKey, h.selfBoxPublicKey)
	if err != nil {
		return err
	}

	ok, err := h.otherSigningPublicKey.Verify(signedValue, sig)
	if err != nil {
		return err
	}

	if !ok {
		return ErrInvalidSignature
	}

	return nil
}

func (h *handshakeSession) ProveOwnDeviceKey() ([]byte, error) {
	// Step 4a : sig_B1(BsigChain·a1)
	signedValue, err := computeValueToProveDevicePubKeyAndSigChain(h.otherBoxPublicKey, h.ownSigChain)
	if err != nil {
		return nil, err
	}

	sig, err := h.ownDevicePrivateKey.Sign(signedValue)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOtherKeyProof(logger *zap.Logger, sig []byte, chain *crypto.SigChain, deviceKey p2pcrypto.PubKey) error {
	// Step 4a : ensure sig_B1(BsigChain·a1) is valid
	signedValue, err := computeValueToProveDevicePubKeyAndSigChain(h.selfBoxPublicKey, chain)
	if err != nil {
		return err
	}

	ok, err := deviceKey.Verify(signedValue, sig)

	if err != nil {
		return err
	}

	if !ok {
		return ErrInvalidSignature
	}

	entries := chain.ListCurrentPubKeys(logger)
	for _, e := range entries {
		if e.Equals(deviceKey) {
			return nil
		}
	}

	return ErrKeyNotInSigChain
}

func (h *handshakeSession) ProveOtherKnownAccount() ([]byte, error) {
	// Step 3b : sigA1(b1)
	pubKeyBytes, err := h.otherSigningPublicKey.Raw()
	if err != nil {
		return nil, err
	}

	sig, err := h.ownDevicePrivateKey.Sign(pubKeyBytes)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOwnKnownAccountProof(attemptedDeviceKey p2pcrypto.PubKey, sig []byte) error {
	// Step 3b : Ensure sigA1(b1) is valid
	pubKeyBytes, err := h.selfSigningPrivateKey.GetPublic().Raw()
	if err != nil {
		return err
	}

	ok, err := attemptedDeviceKey.Verify(pubKeyBytes, sig)
	if err != nil {
		return err
	}

	if !ok {
		return ErrInvalidSignature
	}

	return nil
}

func (h *handshakeSession) Encrypt(data []byte) ([]byte, error) {
	if h.otherBoxPublicKey == nil || h.selfBoxPrivateKey == nil {
		return nil, ErrSessionInvalid
	}

	nonce := h.getNonce()

	out := box.Seal(nil, data, &nonce, h.otherBoxPublicKey, h.selfBoxPrivateKey)

	h.incrementNonce()

	return out, nil
}

func (h *handshakeSession) Decrypt(data []byte) ([]byte, error) {
	if h.otherBoxPublicKey == nil || h.selfBoxPrivateKey == nil {
		return nil, ErrSessionInvalid
	}

	nonce := h.getNonce()

	out, ok := box.Open(nil, data, &nonce, h.otherBoxPublicKey, h.selfBoxPrivateKey)
	if !ok {
		return nil, ErrDecrypt
	}

	h.incrementNonce()

	return out, nil
}

func (h *handshakeSession) incrementNonce() {
	h.nonce++
}

func (h *handshakeSession) getNonce() [24]byte {
	var out [24]byte
	var nonce = make([]byte, 24)

	binary.BigEndian.PutUint16(nonce, h.nonce)

	for i, c := range nonce {
		out[i] = c
	}

	return out
}

func (h *handshakeSession) Close() error {
	return nil
}
