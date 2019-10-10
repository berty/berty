package crypto

import (
	"context"

	"berty.tech/go/pkg/iface"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type crypto struct {
	privKey  p2pcrypto.PrivKey
	sigChain iface.SigChain
}

func (c *crypto) GetDevicePublicKey() p2pcrypto.PubKey {
	return c.privKey.GetPublic()
}

func (c *crypto) GetAccountPublicKey() (p2pcrypto.PubKey, error) {
	initialEntry, err := c.sigChain.GetInitialEntry()
	if err != nil {
		return nil, err
	}

	pubKey, err := initialEntry.GetSubject()
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (c *crypto) GetSigChain() iface.SigChain {
	return c.sigChain
}

func (c *crypto) Sign(data []byte) ([]byte, error) {
	return c.privKey.Sign(data)
}

func (c *crypto) AddDeviceToOwnSigChain(ctx context.Context, key p2pcrypto.PubKey) error {
	_, err := c.sigChain.AddEntry(c.privKey, key)
	return err
}

func (c *crypto) Close() error {
	return nil
}

func NewCrypto(privKey p2pcrypto.PrivKey, sigChain iface.SigChain) iface.CryptoManager {
	c := &crypto{
		privKey:  privKey,
		sigChain: sigChain,
	}

	return c
}

var _ iface.CryptoManager = (*crypto)(nil)
