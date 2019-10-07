package handshake

import (
	"crypto/rand"
	"errors"

	"github.com/libp2p/go-libp2p-core/crypto"
	sign "github.com/libp2p/go-libp2p-core/crypto"

	"golang.org/x/crypto/nacl/box"

	"berty.tech/go/pkg/iface"
)

func bytesSliceToArray(slice []byte) (*[32]byte, error) {
	var arr [32]byte

	if len(slice) != 32 {
		return nil, errors.New("invalid key size")
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

func initHandshake(ownDevicePrivateKey sign.PrivKey, ownSigChain iface.SigChain) (*handshakeSession, error) {
	// TODO: make sure to generate the right type of private key
	boxPub, boxPriv, err := box.GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}

	signPriv, _, err := sign.GenerateEd25519Key(rand.Reader)

	if err != nil {
		return nil, err
	}

	return &handshakeSession{
		ownDevicePrivateKey:   ownDevicePrivateKey,
		ownSigChain:           ownSigChain,
		selfBoxPublicKey:      boxPub,
		selfBoxPrivateKey:     boxPriv,
		selfSigningPrivateKey: signPriv,
		nonce:                 0,
	}, nil
}

func newCryptoRequest(ownDevicePrivateKey crypto.PrivKey, ownSigChain iface.SigChain, accountToReach crypto.PubKey) (*handshakeSession, error) {
	session, err := initHandshake(ownDevicePrivateKey, ownSigChain)
	if err != nil {
		return nil, err
	}

	session.setAccountKeyToProve(accountToReach)

	return session, nil
}

func newCryptoResponse(ownDevicePrivateKey crypto.PrivKey, ownSigChain iface.SigChain) (*handshakeSession, error) {
	session, err := initHandshake(ownDevicePrivateKey, ownSigChain)
	if err != nil {
		return nil, err
	}

	return session, nil
}
