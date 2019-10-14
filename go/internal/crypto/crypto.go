package crypto

import (
	"context"

	"github.com/pkg/errors"

	"go.uber.org/zap"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type crypto struct {
	privKey  p2pcrypto.PrivKey
	sigChain SigChainManager
	logger   *zap.Logger
	opts     *Opts
}

func (c *crypto) GetDevicePublicKey() p2pcrypto.PubKey {
	return c.privKey.GetPublic()
}

func (c *crypto) GetAccountPublicKey() (p2pcrypto.PubKey, error) {
	initialEntry, err := c.sigChain.GetInitialEntry()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get initial sig chain entry")
	}

	pubKey, err := initialEntry.GetSubject()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get entry subject")
	}

	return pubKey, nil
}

func (c *crypto) GetSigChain() SigChainManager {
	return c.sigChain
}

func (c *crypto) Sign(data []byte) ([]byte, error) {
	return c.privKey.Sign(data)
}

func (c *crypto) AddDeviceToOwnSigChain(ctx context.Context, key p2pcrypto.PubKey) error {
	_, err := c.sigChain.AddEntry(c.privKey, key, c.opts)
	return errors.Wrap(err, "unable to add device to sig chain")
}

func (c *crypto) Close() error {
	return nil
}

func NewCrypto(privKey p2pcrypto.PrivKey, sigChain SigChainManager, opts *Opts) Manager {
	if opts == nil {
		opts = &Opts{}
	}

	c := &crypto{
		logger:   zap.NewNop(),
		privKey:  privKey,
		sigChain: sigChain,
		opts:     opts,
	}

	if opts.Logger != nil {
		c.logger = opts.Logger
	}

	return c
}

var _ Manager = (*crypto)(nil)
