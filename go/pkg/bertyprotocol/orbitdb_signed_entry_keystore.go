package bertyprotocol

import (
	"encoding/hex"
	"sync"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type BertySignedKeyStore struct {
	sync.Map
}

func (s *BertySignedKeyStore) SetKey(pk crypto.PrivKey) error {
	pubKeyBytes, err := pk.GetPublic().Raw()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	keyID := hex.EncodeToString(pubKeyBytes)

	s.Store(keyID, pk)

	return nil
}

func (s *BertySignedKeyStore) HasKey(id string) (bool, error) {
	_, ok := s.Load(id)

	return ok, nil
}

func (s *BertySignedKeyStore) CreateKey(id string) (crypto.PrivKey, error) {
	return s.GetKey(id)
}

func (s *BertySignedKeyStore) GetKey(id string) (crypto.PrivKey, error) {
	if privKey, ok := s.Load(id); ok {
		if pk, ok := privKey.(crypto.PrivKey); ok {
			return pk, nil
		}
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

func (s *BertySignedKeyStore) getIdentityProvider() *bertySignedIdentityProvider {
	return &bertySignedIdentityProvider{
		keyStore: s,
	}
}

var _ keystore.Interface = (*BertySignedKeyStore)(nil)
