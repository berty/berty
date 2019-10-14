package crypto

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"time"

	"go.uber.org/zap"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
)

type Opts struct {
	Logger *zap.Logger
}

func InitNewIdentity(ctx context.Context, opts *Opts) (Manager, p2pcrypto.PrivKey, error) {
	privKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to generate a private key")
	}

	sigChain, err := InitSigChain(privKey, opts)
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to get initial sig chain entry")
	}

	return NewCrypto(privKey, sigChain, opts), privKey, nil
}

func InitFromOtherDeviceIdentity(ctx context.Context, opts *Opts /* other params */) (Manager, p2pcrypto.PrivKey, error) {
	// TODO:
	panic("implement me")
}

func OpenIdentity(ctx context.Context, key p2pcrypto.PrivKey, chain SigChainManager, opts *Opts) (Manager, error) {
	return NewCrypto(key, chain, opts), nil
}

func InitSigChain(key p2pcrypto.PrivKey, opts *Opts) (SigChainManager, error) {
	accountKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get generate a private key")
	}

	sigChain := NewSigChain(opts)

	_, err = sigChain.Init(accountKey)
	if err != nil {
		return nil, errors.Wrap(err, "unable to initiate sig chain")
	}

	_, err = sigChain.AddEntry(accountKey, key.GetPublic(), opts)
	if err != nil {
		return nil, errors.Wrap(err, "unable to add a sig chain entry")
	}

	return sigChain, nil
}

func GeneratePrivateKey() (p2pcrypto.PrivKey, error) {
	key, _, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errors.Wrap(err, "unable to generate a key pair")
	}

	return key, nil
}

func GetCurrentRendezvousPoint(id, seed []byte) ([]byte, error) {
	// FIXME: Disabling rendezvous point rotation for now

	return GetRendezvousPointForTime(id, seed, time.Unix(0, 0))
	// return m.GetRendezvousPointForTime(id, seed, time.Now())
}

func GetRendezvousPointForTime(id, seed []byte, date time.Time) ([]byte, error) {
	buf := make([]byte, 32)
	mac := hmac.New(sha256.New, seed)
	binary.BigEndian.PutUint64(buf, uint64(date.Unix()))

	if _, err := mac.Write(buf); err != nil {
		return nil, errors.Wrap(err, "unable to write to buffer")
	}

	sum := mac.Sum(nil)

	rendezvousPoint := sha256.Sum256(append(id, sum...))

	return rendezvousPoint[:], nil
}
