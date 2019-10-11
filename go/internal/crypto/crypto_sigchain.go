package crypto

import (
	"time"

	"go.uber.org/zap"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
)

var theFuture = time.Date(2199, time.December, 31, 0, 0, 0, 0, time.UTC)

func (m *SigChain) GetInitialEntry() (*SigChainEntry, error) {
	entries := m.ListEntries()
	if len(entries) == 0 {
		return nil, ErrSigChainNoEntries
	}

	e := entries[0]

	if e.EntryTypeCode != SigChainEntry_SigChainEntryTypeInitChain {
		return nil, ErrSigChainInvalidEntryType
	}

	return e, nil
}

func (m *SigChain) GetLastEntry() *SigChainEntry {
	entries := m.ListEntries()

	if len(entries) == 0 {
		return nil
	}

	return entries[len(entries)-1]
}

func (m *SigChain) ListEntries() []*SigChainEntry {
	entries := make([]*SigChainEntry, len(m.Entries))
	for i, e := range m.Entries {
		entries[i] = e
	}

	return entries
}

func (m *SigChain) ListCurrentPubKeys(logger *zap.Logger) []p2pcrypto.PubKey {
	pubKeys := map[string][]byte{}
	var pubKeysSlice []p2pcrypto.PubKey

	for _, e := range m.Entries {
		if e.EntryTypeCode == SigChainEntry_SigChainEntryTypeUndefined {
			continue
		} else if e.EntryTypeCode == SigChainEntry_SigChainEntryTypeRemoveKey {
			delete(pubKeys, string(e.SubjectPublicKeyBytes))
		} else {
			pubKeys[string(e.SubjectPublicKeyBytes)] = e.SubjectPublicKeyBytes
		}
	}

	for _, p := range pubKeys {
		pubKey, err := p2pcrypto.UnmarshalPublicKey(p)
		if err != nil {
			logger.Warn("unable to unmarshal public key")
			continue
		}

		pubKeysSlice = append(pubKeysSlice, pubKey)
	}

	return pubKeysSlice
}

func (m *SigChain) Init(privKey p2pcrypto.PrivKey) (*SigChainEntry, error) {
	if len(m.Entries) > 0 {
		return nil, ErrSigChainAlreadyInitialized
	}

	subjectKeyBytes, err := privKey.GetPublic().Bytes()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get subject key bytes")
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeInitChain,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *SigChain) AddEntry(logger *zap.Logger, privKey p2pcrypto.PrivKey, pubKey p2pcrypto.PubKey) (*SigChainEntry, error) {
	if !m.isKeyCurrentlyPresent(logger, privKey.GetPublic()) {
		return nil, ErrSigChainPermission
	}

	if m.isKeyCurrentlyPresent(logger, pubKey) {
		return nil, ErrSigChainOperationAlreadyDone
	}

	subjectKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get subject key bytes")
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeAddKey,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *SigChain) RemoveEntry(logger *zap.Logger, privKey p2pcrypto.PrivKey, pubKey p2pcrypto.PubKey) (*SigChainEntry, error) {
	if !m.isKeyCurrentlyPresent(logger, privKey.GetPublic()) {
		return nil, ErrSigChainPermission
	}

	if !m.isKeyCurrentlyPresent(logger, pubKey) {
		return nil, ErrSigChainOperationAlreadyDone
	}

	subjectKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get subject key bytes")
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeRemoveKey,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *SigChain) isKeyCurrentlyPresent(logger *zap.Logger, pubKey p2pcrypto.PubKey) bool {
	for _, allowedPubKey := range m.ListCurrentPubKeys(logger) {
		if allowedPubKey.Equals(pubKey) {
			return true
		}
	}

	return false
}

func (m *SigChain) appendEntry(privKey p2pcrypto.PrivKey, entry *SigChainEntry) (*SigChainEntry, error) {
	lastEntry := m.GetLastEntry()
	if lastEntry != nil {
		entry.ParentEntryHash = lastEntry.GetEntryHash()
	}

	signerPubKeyBytes, err := privKey.GetPublic().Bytes()
	if err != nil {
		return nil, errors.Wrap(err, "unable to get signer key bytes")
	}

	entry.CreatedAt = time.Now()
	entry.ExpiringAt = theFuture
	entry.SignerPublicKeyBytes = signerPubKeyBytes

	err = entry.Sign(privKey)
	if err != nil {
		return nil, errors.Wrap(err, "unable to sign entry")
	}

	m.Entries = append(m.Entries, entry)

	return entry, nil
}

func (m *SigChain) Check() error {
	// TODO: implement me

	return nil
}

func NewSigChain() *SigChain {
	return &SigChain{}
}

var _ *SigChain = (*SigChain)(nil)
