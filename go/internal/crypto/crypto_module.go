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

func InitNewIdentity(ctx context.Context, logger *zap.Logger) (Manager, p2pcrypto.PrivKey, error) {
	privKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to generate a private key")
	}

	sigChain, err := InitSigChain(logger, privKey)
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to get initial sig chain entry")
	}

	return NewCrypto(logger, privKey, sigChain), privKey, nil
}

func InitFromOtherDeviceIdentity(ctx context.Context /* other params */) (Manager, p2pcrypto.PrivKey, error) {
	// TODO:
	panic("implement me")
}

func OpenIdentity(ctx context.Context, logger *zap.Logger, key p2pcrypto.PrivKey, chain *SigChain) (Manager, error) {
	return NewCrypto(logger, key, chain), nil
}

func InitSigChain(logger *zap.Logger, key p2pcrypto.PrivKey) (*SigChain, error) {
	accountKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get generate a private key")
	}

	sigChain := NewSigChain()

	_, err = sigChain.Init(accountKey)
	if err != nil {
		return nil, errors.Wrap(err, "unable to initiate sig chain")
	}

	_, err = sigChain.AddEntry(logger, accountKey, key.GetPublic())
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
