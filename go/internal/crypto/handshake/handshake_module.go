package handshake

import (
	"errors"

	"berty.tech/go/pkg/iface"
	p2pCrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type module struct {
	crypto iface.Crypto
}

func (m *module) Crypto() iface.Crypto {
	return m.crypto
}

func (m *module) Init() (iface.HandshakeSession, error) {
	// TODO: make sure to generate the right type of private key

	priv, err := m.crypto.GeneratePrivateKey()
	if err != nil {
		return nil, err
	}

	return &handshakeSession{
		crypto:         m.crypto,
		selfPrivateKey: priv,
		selfPublicKey:  priv.GetPublic(),
		nonce:          0,
	}, nil
}

func (m *module) Join(sigPubKey p2pCrypto.PubKey) (iface.HandshakeSession, error) {
	// TODO: include cipher suite to allow protocol updates?
	// TODO: ensure sigPubKey is supported

	session, err := m.Init()
	if err != nil {
		return nil, err
	}

	session.SetOtherPubKey(sigPubKey)

	rawSession, ok := session.(*handshakeSession)
	if !ok {
		return nil, errors.New("unable to cast session")
	}

	rawSession.incrementNonce()

	return session, nil
}

func NewHandshakeModule(crypto iface.Crypto) iface.CryptoHandshakeModule {
	return &module{crypto: crypto}
}

var _ iface.CryptoHandshakeModule = (*module)(nil)
