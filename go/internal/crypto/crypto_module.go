package crypto

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"errors"
	"time"

	"berty.tech/go/pkg/iface"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

func InitNewIdentity(ctx context.Context) (iface.CryptoManager, p2pcrypto.PrivKey, error) {
	privKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, nil, err
	}

	sigChain, err := InitSigChain(privKey)
	if err != nil {
		return nil, nil, err
	}

	return NewCrypto(privKey, sigChain), privKey, nil
}

func InitFromOtherDeviceIdentity(ctx context.Context /* other params */) (iface.CryptoManager, p2pcrypto.PrivKey, error) {
	// TODO:
	panic("implement me")
}

func OpenIdentity(ctx context.Context, key p2pcrypto.PrivKey, chain iface.SigChain) (iface.CryptoManager, error) {
	return NewCrypto(key, chain), nil
}

func InitSigChain(key p2pcrypto.PrivKey) (iface.SigChain, error) {
	accountKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, err
	}

	sigChain := NewSigChain()

	_, err = sigChain.Init(accountKey)
	if err != nil {
		return nil, err
	}

	_, err = sigChain.AddEntry(accountKey, key.GetPublic())
	if err != nil {
		return nil, err
	}

	return sigChain, nil
}

func GeneratePrivateKey() (p2pcrypto.PrivKey, error) {
	key, _, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, err
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
		return nil, err
	}

	sum := mac.Sum(nil)

	rendezvousPoint := sha256.Sum256(append(id, sum...))

	return rendezvousPoint[:], nil
}

func VerifySig(data []byte, sig []byte, key p2pcrypto.PubKey) error {
	ok, err := key.Verify(data, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("unable to verify signature")
	}

	return nil
}
