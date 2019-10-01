package crypto

import (
	"context"
	"errors"

	"berty.tech/go/pkg/iface"
	sign "github.com/libp2p/go-libp2p-core/crypto"
)

type crypto struct {
	privKey  sign.PrivKey
	sigChain iface.SigChain
	store    interface{}
}

func (c *crypto) GetSigChainForAccount(accountID []byte) (iface.SigChain, error) {
	// TODO:
	panic("implement me")
}

func (c *crypto) GetDevicePublicKey() sign.PubKey {
	return c.privKey.GetPublic()
}

func (c *crypto) GetAccountPublicKey() (sign.PubKey, error) {
	initialEntry := c.sigChain.GetInitialEntry()

	if initialEntry.GetEntryType() != iface.SigChainEntryType_INIT_CHAIN {
		return nil, errors.New("first sig chain node is invalid")
	}

	pubKey, err := initialEntry.GetSubject()
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (c *crypto) GetPublicRendezvousSeed(ctx context.Context) ([]byte, error) {
	// TODO:
	panic("implement me")
}

func (c *crypto) GetSigChain() iface.SigChain {
	return c.sigChain
}

func (c *crypto) Sign(data []byte) ([]byte, error) {
	return c.privKey.Sign(data)
}

func (c *crypto) AddDeviceToOwnSigChain(ctx context.Context, key sign.PubKey) error {
	_, err := c.sigChain.AddEntry(c.privKey, key)
	return err
}

func (c *crypto) SaveContactSigChain(ctx context.Context, chain iface.SigChain) error {
	// TODO:
	panic("implement me")
}

func (c *crypto) ResetPublicRendezvousSeed(ctx context.Context) ([]byte, error) {
	// TODO:
	panic("implement me")
}

func (c *crypto) SetDerivationStatusForGroupMember(ctx context.Context, member iface.CryptoGroupMember, key []byte, counter uint64) error {
	// TODO
	panic("implement me")
}

func (c *crypto) RegisterEventHandler(ctx context.Context) (chan<- iface.CryptoEvent, error) {
	// TODO:
	panic("implement me")
}

func (c *crypto) Close() error {
	return nil
}

func NewCrypto(store interface{}, privKey sign.PrivKey, sigChain iface.SigChain) iface.Crypto {
	c := &crypto{
		privKey:  privKey,
		sigChain: sigChain,
		store:    store,
	}

	// TODO:
	// c.groups = group.NewGroupsModule(c)

	return c
}

var _ iface.Crypto = (*crypto)(nil)
