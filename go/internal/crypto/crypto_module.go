package crypto

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"time"

	"berty.tech/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
)

type Opts struct {
	Logger *zap.Logger
}

func InitNewIdentity(ctx context.Context, opts *Opts) (Manager, p2pcrypto.PrivKey, error) {
	privKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, nil, errcode.ProtocolTODO.Wrap(err)
	}

	sigChain, err := InitSigChain(privKey, opts)
	if err != nil {
		return nil, nil, errcode.ProtocolTODO.Wrap(err)
	}

	return NewCrypto(privKey, sigChain, opts), privKey, nil
}

func InitFromOtherDeviceIdentity(ctx context.Context, opts *Opts /* other params */) (Manager, p2pcrypto.PrivKey, error) {
	// ProtocolTODO:
	panic("implement me")
}

func OpenIdentity(ctx context.Context, key p2pcrypto.PrivKey, chain SigChainManager, opts *Opts) (Manager, error) {
	return NewCrypto(key, chain, opts), nil
}

func InitSigChain(key p2pcrypto.PrivKey, opts *Opts) (SigChainManager, error) {
	accountKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	sigChain := NewSigChain(opts)

	_, err = sigChain.Init(accountKey)
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	_, err = sigChain.AddEntry(accountKey, key.GetPublic(), opts)
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return sigChain, nil
}

func GeneratePrivateKey() (p2pcrypto.PrivKey, error) {
	key, _, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
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
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	sum := mac.Sum(nil)

	rendezvousPoint := sha256.Sum256(append(id, sum...))

	return rendezvousPoint[:], nil
}
