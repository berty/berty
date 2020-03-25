package handshake

import (
	"crypto/rand"

	"berty.tech/berty/v2/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/box"
)

func bytesSliceToArray(slice []byte) (*[32]byte, error) {
	var arr [32]byte

	if len(slice) != 32 {
		return nil, errcode.ErrHandshakeInvalidKeyType
	}

	for i, c := range slice {
		arr[i] = c
	}

	return &arr, nil
}

func b32Slice(arr *[32]byte) []byte {
	var ret = make([]byte, 32)
	for i, c := range arr {
		ret[i] = c
	}

	return ret
}

func initHandshake(sk p2pcrypto.PrivKey) (*handshakeSession, error) {
	// TODO: make sure to generate the right type of private key
	boxPub, boxPriv, err := box.GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}

	signPriv, _, err := p2pcrypto.GenerateEd25519Key(rand.Reader)

	if err != nil {
		return nil, err
	}

	hs := &handshakeSession{
		ownAccountSK:      sk,
		selfBoxPublicKey:  boxPub,
		selfBoxPrivateKey: boxPriv,
		ownSignSK:         signPriv,
		nonce:             0,
	}

	return hs, nil
}

func newCryptoRequest(sk p2pcrypto.PrivKey, pk p2pcrypto.PubKey) (*handshakeSession, error) {
	session, err := initHandshake(sk)
	if err != nil {
		return nil, err
	}

	session.setAccountKeyToProve(pk)

	return session, nil
}

func newCryptoResponse(sk p2pcrypto.PrivKey) (*handshakeSession, error) {
	session, err := initHandshake(sk)
	if err != nil {
		return nil, err
	}

	return session, nil
}
