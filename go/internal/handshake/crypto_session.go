package handshake

import (
	"encoding/binary"

	"berty.tech/berty/v2/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/box"
)

const SupportedKeyType = p2pcrypto.Ed25519

type handshakeSession struct {
	ownAccountSK      p2pcrypto.PrivKey
	selfBoxPrivateKey *[32]byte
	selfBoxPublicKey  *[32]byte
	otherBoxPK        *[32]byte
	nonce             uint16
	ownSignSK         p2pcrypto.PrivKey
	otherSignPK       p2pcrypto.PubKey
	otherAccountPK    p2pcrypto.PubKey
}

func (h *handshakeSession) SetOtherKeys(sign p2pcrypto.PubKey, box []byte) error {
	keyArr, err := bytesSliceToArray(box)
	if err != nil {
		return err
	}

	if sign.Type() != SupportedKeyType {
		return errcode.ErrHandshakeInvalidKeyType
	}

	h.otherSignPK = sign
	h.otherBoxPK = keyArr

	return nil
}

func (h *handshakeSession) setAccountKeyToProve(key p2pcrypto.PubKey) {
	h.otherAccountPK = key
}

func (h *handshakeSession) GetPublicKeys() (sign p2pcrypto.PubKey, box []byte) {
	return h.ownSignSK.GetPublic(), b32Slice(h.selfBoxPublicKey)
}

func computeValueToProvePubKey(keyToProve p2pcrypto.PubKey, receiverSigKey *[32]byte) ([]byte, error) {
	if keyToProve == nil || receiverSigKey == nil {
		return nil, errcode.ErrHandshakeParams
	}

	keyToProveBytes, err := keyToProve.Raw()
	if err != nil {
		return nil, err
	}

	signedValue := append(keyToProveBytes, b32Slice(receiverSigKey)...)

	return signedValue, nil
}

func computeValueToProveAccountPK(tempKey *[32]byte, pk p2pcrypto.PubKey) ([]byte, error) {
	if tempKey == nil || pk == nil {
		return nil, errcode.ErrHandshakeParams
	}

	pkBytes, err := p2pcrypto.MarshalPublicKey(pk)
	if err != nil {
		return nil, err
	}

	signedValue := append(pkBytes, b32Slice(tempKey)...)

	return signedValue, nil
}

func (h *handshakeSession) ProveOtherKey() ([]byte, error) {
	// Step 3a (out) : sig_a(B·b)
	if h.otherAccountPK == nil {
		return nil, errcode.ErrHandshakeSessionInvalid
	}

	signedValue, err := computeValueToProvePubKey(h.otherAccountPK, h.otherBoxPK)

	if err != nil {
		return nil, err
	}

	sig, err := h.ownSignSK.Sign(signedValue)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOwnKeyProof(sig []byte) error {
	// Step 3a (in) : ensure sig_a(B·b) is valid
	signedValue, err := computeValueToProvePubKey(h.ownAccountSK.GetPublic(), h.selfBoxPublicKey)
	if err != nil {
		return err
	}

	ok, err := h.otherSignPK.Verify(signedValue, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errcode.ErrHandshakeInvalidSignature
	}

	return nil
}

func (h *handshakeSession) ProveOwnAccountKey() ([]byte, error) {
	// Step 4a : sig_B(a)
	signedValue, err := computeValueToProveAccountPK(h.otherBoxPK, h.ownAccountSK.GetPublic())
	if err != nil {
		return nil, err
	}

	sig, err := h.ownAccountSK.Sign(signedValue)
	if err != nil {
		return nil, err
	}

	return sig, nil
}

func (h *handshakeSession) CheckOtherKeyProof(sig []byte, pk p2pcrypto.PubKey) error {
	// Step 4a : ensure sig_B(a) is valid
	signedValue, err := computeValueToProveAccountPK(h.selfBoxPublicKey, pk)
	if err != nil {
		return err
	}

	ok, err := pk.Verify(signedValue, sig)

	if err != nil {
		return err
	}

	if !ok {
		return errcode.ErrHandshakeInvalidSignature
	}

	return nil
}

func (h *handshakeSession) Encrypt(data []byte) ([]byte, error) {
	if h.otherBoxPK == nil || h.selfBoxPrivateKey == nil {
		return nil, errcode.ErrHandshakeSessionInvalid
	}

	nonce := h.getNonce()

	out := box.Seal(nil, data, &nonce, h.otherBoxPK, h.selfBoxPrivateKey)

	h.incrementNonce()

	return out, nil
}

func (h *handshakeSession) Decrypt(data []byte) ([]byte, error) {
	if h.otherBoxPK == nil || h.selfBoxPrivateKey == nil {
		return nil, errcode.ErrHandshakeSessionInvalid
	}

	nonce := h.getNonce()

	out, ok := box.Open(nil, data, &nonce, h.otherBoxPK, h.selfBoxPrivateKey)
	if !ok {
		return nil, errcode.ErrHandshakeDecrypt
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
