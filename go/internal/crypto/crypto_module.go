package crypto

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"errors"
	"time"

	sigchain "berty.tech/go/internal/cryptosigchain"
	"berty.tech/go/pkg/iface"
	sign "github.com/libp2p/go-libp2p-core/crypto"
)

func InitNewIdentity(ctx context.Context, store interface{}) (iface.Crypto, sign.PrivKey, error) {
	if store == nil {
		return nil, nil, errors.New("no datastore defined")
	}

	privKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, nil, err
	}

	sigChain, err := InitSigChain(privKey)
	if err != nil {
		return nil, nil, err
	}

	return NewCrypto(store, privKey, sigChain), privKey, nil
}

func InitFromOtherDeviceIdentity(ctx context.Context, store interface{} /* other params */) (iface.Crypto, sign.PrivKey, error) {
	// TODO:
	panic("implement me")
}

func OpenIdentity(ctx context.Context, store interface{}, key sign.PrivKey, chain iface.SigChain) (iface.Crypto, error) {
	return NewCrypto(store, key, chain), nil
}

func InitSigChain(key sign.PrivKey) (iface.SigChain, error) {
	accountKey, err := GeneratePrivateKey()
	if err != nil {
		return nil, err
	}

	sigChain := sigchain.NewSigChain()

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

func GeneratePrivateKey() (sign.PrivKey, error) {
	key, _, err := sign.GenerateEd25519Key(rand.Reader)
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

func VerifySig(data []byte, sig []byte, key sign.PubKey) error {
	ok, err := key.Verify(data, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("unable to verify signature")
	}

	return nil
}
