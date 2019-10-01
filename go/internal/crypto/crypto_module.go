package crypto

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"errors"
	"time"

	"berty.tech/go/internal/crypto/sigchain"
	"berty.tech/go/pkg/iface"
	sign "github.com/libp2p/go-libp2p-core/crypto"
)

type module struct{}

func (m *module) InitNewIdentity(ctx context.Context, store iface.DataStore) (iface.Crypto, sign.PrivKey, error) {
	if store == nil {
		return nil, nil, errors.New("no datastore defined")
	}

	privKey, err := m.GeneratePrivateKey()
	if err != nil {
		return nil, nil, err
	}

	sigChain, err := m.InitSigChain(privKey)

	return NewCrypto(m, store, privKey, sigChain), privKey, nil
}

func (m *module) InitFromOtherDeviceIdentity(ctx context.Context, store iface.DataStore /* other params */) (iface.Crypto, sign.PrivKey, error) {
	// TODO:
	panic("implement me")
}

func (m *module) OpenIdentity(ctx context.Context, store iface.DataStore, key sign.PrivKey, chain iface.SigChain) (iface.Crypto, error) {
	return NewCrypto(m, store, key, chain), nil
}

func (m *module) InitSigChain(key sign.PrivKey) (iface.SigChain, error) {
	accountKey, err := m.GeneratePrivateKey()
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

func (m *module) GeneratePrivateKey() (sign.PrivKey, error) {
	key, _, err := sign.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, err
	}

	return key, nil
}

func (m *module) GetCurrentRendezvousPoint(id, seed []byte) ([]byte, error) {
	// FIXME: Disabling rendezvous point rotation for now

	return m.GetRendezvousPointForTime(id, seed, time.Unix(0, 0))
	// return m.GetRendezvousPointForTime(id, seed, time.Now())
}

func (m *module) GetRendezvousPointForTime(id, seed []byte, date time.Time) ([]byte, error) {
	buf := make([]byte, 32)
	mac := hmac.New(sha256.New, seed)
	binary.BigEndian.PutUint64(buf, uint64(date.Unix()))

	mac.Write(buf)
	sum := mac.Sum(nil)

	rendezvousPoint := sha256.Sum256(append(id, sum...))

	return rendezvousPoint[:], nil
}

func (m *module) VerifySig(data []byte, sig []byte, key sign.PubKey) error {
	ok, err := key.Verify(data, sig)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("unable to verify signature")
	}

	return nil
}

func CryptoModule() iface.CryptoModule {
	if instance == nil {
		instance = &module{}
	}

	return instance
}

var instance iface.CryptoModule = (*module)(nil)
