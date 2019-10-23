package crypto

import (
	"time"

	"berty.tech/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
)

var theFuture = time.Date(2199, time.December, 31, 0, 0, 0, 0, time.UTC)

type wrappedSigChain struct {
	*SigChain
	logger *zap.Logger
}

func (m *wrappedSigChain) GetInitialEntry() (*SigChainEntry, error) {
	entries := m.ListEntries()
	if len(entries) == 0 {
		return nil, errcode.ErrProtocolSigChainNoEntries
	}

	e := entries[0]

	if e.EntryTypeCode != SigChainEntry_SigChainEntryTypeInitChain {
		return nil, errcode.ErrProtocolSigChainInvalidEntryType
	}

	return e, nil
}

func (m *wrappedSigChain) GetLastEntry() *SigChainEntry {
	entries := m.ListEntries()

	if len(entries) == 0 {
		return nil
	}

	return entries[len(entries)-1]
}

func (m *wrappedSigChain) ListEntries() []*SigChainEntry {
	entries := make([]*SigChainEntry, len(m.Entries))
	for i, e := range m.Entries {
		entries[i] = e
	}

	return entries
}

func (m *wrappedSigChain) ListCurrentPubKeys() []p2pcrypto.PubKey {
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
			m.logger.Warn("unable to unmarshal public key")
			continue
		}

		pubKeysSlice = append(pubKeysSlice, pubKey)
	}

	return pubKeysSlice
}

func (m *wrappedSigChain) Init(privKey p2pcrypto.PrivKey) (*SigChainEntry, error) {
	if len(m.Entries) > 0 {
		return nil, errcode.ErrProtocolSigChainAlreadyInitialized
	}

	subjectKeyBytes, err := privKey.GetPublic().Bytes()
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeInitChain,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *wrappedSigChain) AddEntry(privKey p2pcrypto.PrivKey, pubKey p2pcrypto.PubKey, opts *Opts) (*SigChainEntry, error) {
	if !m.isKeyCurrentlyPresent(privKey.GetPublic(), opts) {
		return nil, errcode.ErrProtocolSigChainPermission
	}

	if m.isKeyCurrentlyPresent(pubKey, opts) {
		return nil, errcode.ErrProtocolSigChainOperationAlreadyDone
	}

	subjectKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeAddKey,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *wrappedSigChain) RemoveEntry(privKey p2pcrypto.PrivKey, pubKey p2pcrypto.PubKey, opts *Opts) (*SigChainEntry, error) {
	if !m.isKeyCurrentlyPresent(privKey.GetPublic(), opts) {
		return nil, errcode.ErrProtocolSigChainPermission
	}

	if !m.isKeyCurrentlyPresent(pubKey, opts) {
		return nil, errcode.ErrProtocolSigChainOperationAlreadyDone
	}

	subjectKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return m.appendEntry(privKey, &SigChainEntry{
		EntryTypeCode:         SigChainEntry_SigChainEntryTypeRemoveKey,
		SubjectPublicKeyBytes: subjectKeyBytes,
	})
}

func (m *wrappedSigChain) isKeyCurrentlyPresent(pubKey p2pcrypto.PubKey, opts *Opts) bool {
	for _, allowedPubKey := range m.ListCurrentPubKeys() {
		if allowedPubKey.Equals(pubKey) {
			return true
		}
	}

	return false
}

func (m *wrappedSigChain) appendEntry(privKey p2pcrypto.PrivKey, entry *SigChainEntry) (*SigChainEntry, error) {
	lastEntry := m.GetLastEntry()
	if lastEntry != nil {
		entry.ParentEntryHash = lastEntry.GetEntryHash()
	}

	signerPubKeyBytes, err := privKey.GetPublic().Bytes()
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	entry.CreatedAt = time.Now()
	entry.ExpiringAt = theFuture
	entry.SignerPublicKeyBytes = signerPubKeyBytes

	err = entry.Sign(privKey)
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	m.Entries = append(m.Entries, entry)

	return entry, nil
}

func (m *wrappedSigChain) Check() error {
	// ProtocolTODO: implement me

	return nil
}

func NewSigChain(opts *Opts) SigChainManager {
	if opts == nil {
		opts = &Opts{}
	}

	chain := &wrappedSigChain{
		SigChain: &SigChain{},
		logger:   zap.NewNop(),
	}

	if opts.Logger != nil {
		chain.logger = opts.Logger
	}

	return chain
}

func WrapSigChain(sigChain *SigChain, opts *Opts) SigChainManager {
	if opts == nil {
		opts = &Opts{}
	}

	chain := &wrappedSigChain{
		SigChain: sigChain,
		logger:   zap.NewNop(),
	}

	if opts.Logger != nil {
		chain.logger = opts.Logger
	}

	return chain
}

func (m *wrappedSigChain) Unwrap() *SigChain {
	return m.SigChain
}

var _ SigChainManager = (*wrappedSigChain)(nil)
