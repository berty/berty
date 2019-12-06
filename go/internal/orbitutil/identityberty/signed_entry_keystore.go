package identityberty

import (
	"encoding/hex"
	"sync"

	"berty.tech/go-ipfs-log/keystore"

	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type BertySignedKeyStore struct {
	keys map[string]crypto.PrivKey
	lock sync.RWMutex
}

func (s *BertySignedKeyStore) SetKey(pk crypto.PrivKey) error {
	pubKeyBytes, err := pk.GetPublic().Raw()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	keyID := hex.EncodeToString(pubKeyBytes)

	s.lock.Lock()
	s.keys[keyID] = pk
	s.lock.Unlock()

	return nil
}

func (s *BertySignedKeyStore) HasKey(id string) (bool, error) {
	s.lock.RLock()
	_, ok := s.keys[id]
	s.lock.RUnlock()

	return ok, nil
}

func (s *BertySignedKeyStore) CreateKey(id string) (crypto.PrivKey, error) {
	return s.GetKey(id)
}

func (s *BertySignedKeyStore) GetKey(id string) (crypto.PrivKey, error) {
	s.lock.RLock()
	defer s.lock.RUnlock()
	if privKey, ok := s.keys[id]; ok {
		return privKey, nil
	}

	return nil, errcode.ErrGroupMemberUnknownGroupID
}

func (s *BertySignedKeyStore) Sign(privKey crypto.PrivKey, bytes []byte) ([]byte, error) {
	return privKey.Sign(bytes)
}

func (s *BertySignedKeyStore) Verify(signature []byte, publicKey crypto.PubKey, data []byte) error {
	ok, err := publicKey.Verify(data, signature)
	if err != nil {
		return err
	}

	if !ok {
		return errcode.ErrGroupMemberLogEventSignature
	}

	return nil
}

func NewBertySignedKeyStore() *BertySignedKeyStore {
	ks := &BertySignedKeyStore{
		keys: map[string]crypto.PrivKey{},
	}

	return ks
}

func (s *BertySignedKeyStore) GetIdentityProvider() *BertySignedIdentityProvider {
	return &BertySignedIdentityProvider{
		keyStore: s,
	}
}

var _ keystore.Interface = (*BertySignedKeyStore)(nil)
