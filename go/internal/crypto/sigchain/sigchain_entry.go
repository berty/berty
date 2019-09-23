package sigchain

import (
	"berty.tech/go/pkg/iface"
	"github.com/libp2p/go-libp2p-core/crypto"
	mh "github.com/multiformats/go-multihash"
)

type wrappedSigChainEntry struct {
	*SigChainEntry
	sigChain iface.SigChain
}

func (s *wrappedSigChainEntry) Sign(key crypto.PrivKey) error {
	entryToSign := &SigChainEntry{
		EntryTypeCode:         s.EntryTypeCode,
		ParentEntryHash:       s.ParentEntryHash,
		CreatedAt:             s.CreatedAt,
		ExpiringAt:            s.ExpiringAt,
		SignerPublicKeyBytes:  s.SignerPublicKeyBytes,
		SubjectPublicKeyBytes: s.SubjectPublicKeyBytes,
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

	s.EntryHash = entryHash
	s.Signature = sig

	return nil
}

func (s *wrappedSigChainEntry) GetSigChain() iface.SigChain {
	return s.sigChain
}

func (s *wrappedSigChainEntry) GetEntryType() iface.SigChainEntryType {
	return iface.SigChainEntryType(s.EntryTypeCode)
}

func (s *wrappedSigChainEntry) GetSignedBy() (crypto.PubKey, error) {
	pubKey, err := crypto.UnmarshalPublicKey(s.SignerPublicKeyBytes)
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (s *wrappedSigChainEntry) GetSubject() (crypto.PubKey, error) {
	pubKey, err := crypto.UnmarshalPublicKey(s.SubjectPublicKeyBytes)
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (s *wrappedSigChainEntry) Check() error {
	// TODO: implement me

	// TODO: Check parent present in sigchain and valid (except 1st item)
	// TODO: Check signer pubkey valid
	// TODO: Check subject pubkey valid
	// TODO: Check signature valid
	// TODO: Check not self signed (except 1st item)
	// TODO: Check signer not previously revoked

	return nil
}

func NewWrappedSigChainEntry(chain iface.SigChain, entry *SigChainEntry) iface.SigChainEntry {
	return &wrappedSigChainEntry{
		SigChainEntry: entry,
		sigChain:      chain,
	}
}

var _ iface.SigChainEntry = (*wrappedSigChainEntry)(nil)
