package bertyprotocol

import (
	"berty.tech/go/pkg/iface"
	"github.com/libp2p/go-libp2p-core/crypto"
	mh "github.com/multiformats/go-multihash"
)

func (m *SigChainEntry) Sign(key crypto.PrivKey) error {
	entryToSign := &SigChainEntry{
		EntryTypeCode:         m.EntryTypeCode,
		ParentEntryHash:       m.ParentEntryHash,
		CreatedAt:             m.CreatedAt,
		ExpiringAt:            m.ExpiringAt,
		SignerPublicKeyBytes:  m.SignerPublicKeyBytes,
		SubjectPublicKeyBytes: m.SubjectPublicKeyBytes,
	}

	entryBytes, err := entryToSign.Marshal()
	if err != nil {
		return err
	}

	h, err := mh.Sum(entryBytes, mh.SHA2_256, -1)
	if err != nil {
		return err
	}

	entryHash := []byte(h.B58String())

	sig, err := key.Sign(entryHash)
	if err != nil {
		return err
	}

	m.EntryHash = entryHash
	m.Signature = sig

	return nil
}

func (m *SigChainEntry) GetSignedBy() (crypto.PubKey, error) {
	pubKey, err := crypto.UnmarshalPublicKey(m.SignerPublicKeyBytes)
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (m *SigChainEntry) GetSubject() (crypto.PubKey, error) {
	pubKey, err := crypto.UnmarshalPublicKey(m.SubjectPublicKeyBytes)
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (m *SigChainEntry) Check() error {
	// TODO: implement me

	// TODO: Check parent present in sigchain and valid (except 1st item)
	// TODO: Check signer pubkey valid
	// TODO: Check subject pubkey valid
	// TODO: Check signature valid
	// TODO: Check not self signed (except 1st item)
	// TODO: Check signer not previously revoked

	return nil
}

var _ iface.SigChainEntry = (*SigChainEntry)(nil)
