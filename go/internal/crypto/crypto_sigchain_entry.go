package crypto

import (
	"berty.tech/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	mh "github.com/multiformats/go-multihash"
)

func (m *SigChainEntry) Sign(key p2pcrypto.PrivKey) error {
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
		return errcode.ProtocolTODO.Wrap(err)
	}

	h, err := mh.Sum(entryBytes, mh.SHA2_256, -1)
	if err != nil {
		return errcode.ProtocolTODO.Wrap(err)
	}

	entryHash := []byte(h.B58String())

	sig, err := key.Sign(entryHash)
	if err != nil {
		return errcode.ProtocolTODO.Wrap(err)
	}

	m.EntryHash = entryHash
	m.Signature = sig

	return nil
}

func (m *SigChainEntry) GetSignedBy() (p2pcrypto.PubKey, error) {
	pubKey, err := p2pcrypto.UnmarshalPublicKey(m.SignerPublicKeyBytes)
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return pubKey, nil
}

func (m *SigChainEntry) GetSubject() (p2pcrypto.PubKey, error) {
	pubKey, err := p2pcrypto.UnmarshalPublicKey(m.SubjectPublicKeyBytes)
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return pubKey, nil
}

func (m *SigChainEntry) Check() error {
	// ProtocolTODO: implement me

	// ProtocolTODO: Check parent present in sigchain and valid (except 1st item)
	// ProtocolTODO: Check signer pubkey valid
	// ProtocolTODO: Check subject pubkey valid
	// ProtocolTODO: Check signature valid
	// ProtocolTODO: Check not self signed (except 1st item)
	// ProtocolTODO: Check signer not previously revoked

	return nil
}

var _ *SigChainEntry = (*SigChainEntry)(nil)
