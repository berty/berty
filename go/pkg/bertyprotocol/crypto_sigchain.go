package bertyprotocol

import (
	"errors"
	"time"

	"berty.tech/go/pkg/iface"
	"github.com/libp2p/go-libp2p-core/crypto"
)

var theFuture = time.Date(2199, time.December, 31, 0, 0, 0, 0, time.UTC)

func (m *SigChain) GetInitialEntry() (iface.SigChainEntry, error) {
	entries := m.ListEntries()
	if len(entries) == 0 {
		return nil, errors.New("unable to find first entry")
	}

	e, ok := entries[0].(*SigChainEntry)
	if !ok {
		return nil, errors.New("unable to cast first entry")
	}

	if e.EntryTypeCode != SigChainEntry_SigChainEntryTypeInitChain {
		return nil, errors.New("invalid type for first entry")
	}

	return e, nil
}

func (m *SigChain) GetLastEntry() iface.SigChainEntry {
	entries := m.ListEntries()

	if len(entries) == 0 {
		return nil
	}

	return entries[len(entries)-1]
}

func (m *SigChain) ListEntries() []iface.SigChainEntry {
	entries := make([]iface.SigChainEntry, len(m.Entries))
	for i, e := range m.Entries {
		entries[i] = e
	}

	return entries
}

func (m *SigChain) ListCurrentPubKeys() []crypto.PubKey {
	pubKeys := map[string][]byte{}
	var pubKeysSlice []crypto.PubKey

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
		pubKey, err := crypto.UnmarshalPublicKey(p)
		if err != nil {
			continue
		}

		pubKeysSlice = append(pubKeysSlice, pubKey)
	}

	return pubKeysSlice
}

func (m *SigChain) Init(privKey crypto.PrivKey) (iface.SigChainEntry, error) {
	if len(m.Entries) > 0 {
		return nil, errors.New("sig chain already initialized")
	}

	subjectKeyBytes, err := privKey.GetPublic().Bytes()
	if err != nil {
		return nil, err
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeInitChain,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *SigChain) AddEntry(privKey crypto.PrivKey, pubKey crypto.PubKey) (iface.SigChainEntry, error) {
	if !m.isKeyCurrentlyPresent(privKey.GetPublic()) {
		return nil, errors.New("not allowed to add entry")
	}

	if m.isKeyCurrentlyPresent(pubKey) {
		return nil, errors.New("pub key is already listed in the sig chain")
	}

	subjectKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, err
	}

	if len(m.Entries) == 0 {
		return nil, errors.New("sig chain has not been initialized yet")
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeAddKey,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *SigChain) RemoveEntry(privKey crypto.PrivKey, pubKey crypto.PubKey) (iface.SigChainEntry, error) {
	if !m.isKeyCurrentlyPresent(privKey.GetPublic()) {
		return nil, errors.New("not allowed to remove entry")
	}

	if !m.isKeyCurrentlyPresent(pubKey) {
		return nil, errors.New("pub key is not currently listed in the sig chain")
	}

	subjectKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, err
	}

	if len(m.Entries) == 0 {
		return nil, errors.New("sig chain has not been initialized yet")
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeRemoveKey,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *SigChain) isKeyCurrentlyPresent(pubKey crypto.PubKey) bool {
	for _, allowedPubKey := range m.ListCurrentPubKeys() {
		if allowedPubKey.Equals(pubKey) {
			return true
		}
	}

	return false
}

func (m *SigChain) appendEntry(privKey crypto.PrivKey, entry *SigChainEntry) (iface.SigChainEntry, error) {
	lastEntry := m.GetLastEntry()
	if lastEntry != nil {
		entry.ParentEntryHash = lastEntry.GetEntryHash()
	}

	signerPubKeyBytes, err := privKey.GetPublic().Bytes()
	if err != nil {
		return nil, err
	}

	entry.CreatedAt = time.Now()
	entry.ExpiringAt = theFuture
	entry.SignerPublicKeyBytes = signerPubKeyBytes

	err = entry.Sign(privKey)
	if err != nil {
		return nil, err
	}

	m.Entries = append(m.Entries, entry)

	return entry, nil
}

func (m *SigChain) Check() error {
	// TODO: implement me

	return nil
}

func NewSigChain() iface.SigChain {
	return &SigChain{}
}

var _ iface.SigChain = (*SigChain)(nil)
