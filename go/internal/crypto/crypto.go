package crypto

import (
	"context"

	"berty.tech/go/internal/crypto/group"

	"berty.tech/go/internal/crypto/handshake"
	"berty.tech/go/pkg/iface"
	p2pCrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type crypto struct {
	iface.CryptoModule

	groups    iface.CryptoGroupsModule
	handshake iface.CryptoHandshakeModule

	privKey  p2pCrypto.PrivKey
	sigChain iface.SigChain
	store    iface.CryptoDataStore
}

func (c *crypto) GetSigChainForAccount(accountID []byte) (iface.SigChain, error) {
	panic("implement me")
}

func (c *crypto) GetPublicKey() p2pCrypto.PubKey {
	return c.privKey.GetPublic()
}

func (c *crypto) GetPublicRendezvousSeed(ctx context.Context) ([]byte, error) {
	return c.store.Config().GetPublicRendezvousPointSeed(ctx)
}

func (c *crypto) GetSigChain() iface.SigChain {
	return c.sigChain
}

func (c *crypto) Sign(data []byte) ([]byte, error) {
	return c.privKey.Sign(data)
}

func (c *crypto) AddDeviceToOwnSigChain(ctx context.Context, key p2pCrypto.PubKey) error {
	_, err := c.sigChain.AddEntry(c.privKey, key)
	return err
}

func (c *crypto) SaveContactSigChain(ctx context.Context, chain iface.SigChain) error {
	// TODO:
	panic("implement me")
}

func (c *crypto) ResetPublicRendezvousSeed(ctx context.Context) ([]byte, error) {
	return c.store.Config().ResetPublicRendezvousPointSeed(ctx)
}

func (c *crypto) SetDerivationStatusForGroupMember(ctx context.Context, member iface.CryptoGroupMember, key []byte, counter uint64) error {
	// TODO
	panic("implement me")
}

func (c *crypto) Handshake() iface.CryptoHandshakeModule {
	return c.handshake
}

func (c *crypto) Groups() iface.CryptoGroupsModule {
	return c.groups
}

func (c *crypto) RegisterEventHandler(ctx context.Context) (chan<- iface.CryptoEvent, error) {
	// TODO:
	panic("implement me")
}

func (c *crypto) Close() error {
	return nil
}

func NewCrypto(module iface.CryptoModule, store iface.CryptoDataStore, privKey p2pCrypto.PrivKey, sigChain iface.SigChain) iface.Crypto {
	c := &crypto{
		CryptoModule: module,
		privKey:      privKey,
		sigChain:     sigChain,
		store:        store,
	}

	c.handshake = handshake.NewHandshakeModule(c)
	c.groups = group.NewGroupsModule(c)

	return c
}

var _ iface.Crypto = (*crypto)(nil)
