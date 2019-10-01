package cryptohandshake

import (
	"encoding/binary"
	"errors"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/go/pkg/iface"
	"golang.org/x/crypto/nacl/box"
)

const SupportedKeyType = crypto.Ed25519

type handshakeSession struct {
	ownSigChain           iface.SigChain
	ownDevicePrivateKey   crypto.PrivKey
	selfBoxPrivateKey     *[32]byte
	selfBoxPublicKey      *[32]byte
	otherBoxPublicKey     *[32]byte
	nonce                 uint16
	selfSigningPrivateKey crypto.PrivKey
	otherSigningPublicKey crypto.PubKey
	accountKeyToProve     crypto.PubKey
}

func (h *handshakeSession) SetOtherKeys(sign crypto.PubKey, box []byte) error {
	keyArr, err := bytesSliceToArray(box)
	if err != nil {
		return err
	}

	if sign.Type() != SupportedKeyType {
		return errors.New("invalid key type")
	}

	h.otherSigningPublicKey = sign
	h.otherBoxPublicKey = keyArr

	return nil
}

func (h *handshakeSession) setAccountKeyToProve(key crypto.PubKey) {
	h.accountKeyToProve = key
}

func (h *handshakeSession) GetPublicKeys() (sign crypto.PubKey, box []byte) {
	return h.selfSigningPrivateKey.GetPublic(), b32Slice(h.selfBoxPublicKey)
}

//func (h *handshakeSession) Crypto() iface.Crypto {
//	return h.crypto
//}

func computeValueToProvePubKey(keyToProve crypto.PubKey, receiverSigKey *[32]byte) ([]byte, error) {
	if keyToProve == nil || receiverSigKey == nil {
		return nil, errors.New("missing a key")
	}

	keyToProveBytes, err := keyToProve.Raw()
	if err != nil {
		return nil, err
	}

	signedValue := append(keyToProveBytes, b32Slice(receiverSigKey)...)

	return signedValue, nil
}

func computeValueToProveDevicePubKeyAndSigChain(keyToProve *[32]byte, chain iface.SigChain) ([]byte, error) {
	if keyToProve == nil || chain == nil {
		return nil, errors.New("missing a key or sig chain")
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
		return nil, errors.New("missing a key to prove")
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
	accountPubKey, err := h.ownSigChain.GetInitialEntry().GetSubject()
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
		return errors.New("signature is not valid")
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

func (h *handshakeSession) CheckOtherKeyProof(sig []byte, chain iface.SigChain, deviceKey crypto.PubKey) error {
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
		return errors.New("signature is not valid")
	}

	entries := chain.ListCurrentPubKeys()
	for _, e := range entries {
		if e.Equals(deviceKey) {
			return nil
		}
	}

	return errors.New("key not found in sig chain")
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

func (h *handshakeSession) CheckOwnKnownAccountProof(attemptedDeviceKey crypto.PubKey, sig []byte) error {
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
		return errors.New("signature is not valid")
	}

	return nil
}

func (h *handshakeSession) Encrypt(data []byte) ([]byte, error) {
	if h.otherBoxPublicKey == nil || h.selfBoxPrivateKey == nil {
		return nil, errors.New("handshake session has not been properly initialized")
	}

	nonce := h.getNonce()

	out := box.Seal(nil, data, &nonce, h.otherBoxPublicKey, h.selfBoxPrivateKey)

	h.incrementNonce()

	return out, nil
}

func (h *handshakeSession) Decrypt(data []byte) ([]byte, error) {
	if h.otherBoxPublicKey == nil || h.selfBoxPrivateKey == nil {
		return nil, errors.New("handshake session has not been properly initialized")
	}

	nonce := h.getNonce()

	out, ok := box.Open(nil, data, &nonce, h.otherBoxPublicKey, h.selfBoxPrivateKey)
	if !ok {
		return nil, errors.New("unable to decrypt data")
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

var _ iface.HandshakeSession = (*handshakeSession)(nil)
