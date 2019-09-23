package handshake

import (
	"encoding/binary"
	"errors"

	"berty.tech/go/pkg/iface"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/box"
)

type handshakeSession struct {
	crypto         iface.Crypto
	selfPrivateKey crypto.PrivKey
	selfPublicKey  crypto.PubKey
	otherPublicKey crypto.PubKey
	nonce          uint16
}

func (h *handshakeSession) SetOtherPubKey(key crypto.PubKey) {
	h.otherPublicKey = key
}

func (h *handshakeSession) Crypto() iface.Crypto {
	return h.crypto
}

func computeValueToProvePubKey(keyToProve, signerKey crypto.PubKey) ([]byte, error) {
	if keyToProve == nil || signerKey == nil {
		return nil, errors.New("missing a key")
	}

	otherPubKeyBytes, err := keyToProve.Raw()
	if err != nil {
		return nil, err
	}

	selfPubKeyBytes, err := signerKey.Raw()
	if err != nil {
		return nil, err
	}

	signedValue := append(otherPubKeyBytes, selfPubKeyBytes...)

	return signedValue, nil
}

func computeValueToProveDevicePubKeyAndSigChain(keyToProve crypto.PubKey, chain iface.SigChain) ([]byte, error) {
	if keyToProve == nil || chain == nil {
		return nil, errors.New("missing a key or sig chain")
	}

	deviceKeyBytes, err := keyToProve.Raw()
	if err != nil {
		return nil, err
	}

	sigChainBytes, err := chain.Marshal()
	if err != nil {
		return nil, err
	}

	signedValue := append(sigChainBytes, deviceKeyBytes...)

	return signedValue, nil
}

func (h *handshakeSession) ProveOtherKey(key crypto.PubKey) ([]byte, error) {
	if key == nil {
		return nil, errors.New("missing a key to prove")
	}

	// Step 3a
	signedValue, err := computeValueToProvePubKey(key, h.selfPublicKey)
	if err != nil {
		return nil, err
	}

	sig, err := h.selfPrivateKey.Sign(signedValue)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOwnKeyProof(sig []byte) error {
	// Step 3a
	signedValue, err := computeValueToProvePubKey(h.selfPublicKey, h.otherPublicKey)
	if err != nil {
		return err
	}

	ok, err := h.otherPublicKey.Verify(signedValue, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("signature is not valid")
	}

	return nil
}

func (h *handshakeSession) ProveOwnDeviceKey() ([]byte, error) {
	// sigB1(BsigChain·a1)
	signedValue, err := computeValueToProveDevicePubKeyAndSigChain(h.otherPublicKey, h.crypto.GetSigChain())
	if err != nil {
		return nil, err
	}

	sig, err := h.selfPrivateKey.Sign(signedValue)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOtherKeyProof(sig []byte, chain iface.SigChain, deviceKey crypto.PubKey) error {
	signedValue, err := computeValueToProveDevicePubKeyAndSigChain(h.selfPublicKey, chain)
	if err != nil {
		return err
	}

	ok, err := deviceKey.Verify(signedValue, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("signature is not valid")
	}

	return nil
}

func (h *handshakeSession) ProveOtherKnownAccount() ([]byte, error) {
	if h.otherPublicKey == nil {
		return nil, errors.New("handshake session has not been properly initialized")
	}

	pubKeyBytes, err := h.otherPublicKey.Raw()
	if err != nil {
		return nil, err
	}

	sig, err := h.crypto.Sign(pubKeyBytes)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOwnKnownAccountProof(attemptedDeviceKey crypto.PubKey, sig []byte) error {
	pubKeyBytes, err := h.crypto.GetPublicKey().Raw()
	if err != nil {
		return err
	}

	ok, err := attemptedDeviceKey.Verify(pubKeyBytes, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("signature is not valid")
	}

	return nil
}

func (h *handshakeSession) getBoxKeys() ([32]byte, [32]byte, error) {
	var pubKeyBytes [32]byte
	var privateKeyBytes [32]byte

	if h.otherPublicKey == nil || h.selfPrivateKey == nil {
		return pubKeyBytes, privateKeyBytes, errors.New("handshake session has not been properly initialized")
	}

	pubKeySlice, err := h.otherPublicKey.Raw()
	if err != nil {
		return pubKeyBytes, privateKeyBytes, err
	}
	copy(pubKeySlice[:], pubKeyBytes[:32])

	privKeySlice, err := h.selfPrivateKey.Raw()
	if err != nil {
		return pubKeyBytes, privateKeyBytes, err
	}
	copy(privKeySlice[:], privateKeyBytes[:32])

	return pubKeyBytes, privateKeyBytes, nil
}

func (h *handshakeSession) incrementNonce() {
	h.nonce++
}

func (h *handshakeSession) Encrypt(data []byte) ([]byte, error) {
	nonce := h.getNonce()

	pubKeyBytes, privateKeyBytes, err := h.getBoxKeys()
	if err != nil {
		return nil, err
	}

	out := box.Seal(nil, data, &nonce, &pubKeyBytes, &privateKeyBytes)

	h.incrementNonce()

	return out, nil
}

func (h *handshakeSession) Decrypt(data []byte) ([]byte, error) {
	nonce := h.getNonce()

	pubKeyBytes, privateKeyBytes, err := h.getBoxKeys()
	if err != nil {
		return nil, err
	}

	out, ok := box.Open(nil, data, &nonce, &pubKeyBytes, &privateKeyBytes)
	if !ok {
		return nil, errors.New("unable to decrypt data")
	}

	h.incrementNonce()

	return out, nil
}

func (h *handshakeSession) getNonce() [24]byte {
	var out [24]byte
	var nonce = make([]byte, 24)

	binary.BigEndian.PutUint16(nonce, h.nonce)

	copy(out[:], nonce)

	return out
}

func (h *handshakeSession) Close() error {
	return nil
}

var _ iface.HandshakeSession = (*handshakeSession)(nil)
