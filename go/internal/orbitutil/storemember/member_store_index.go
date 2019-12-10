package storemember

import (
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storegroup"
	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type indexEntry struct {
	memberDevice *group.MemberDevice
	err          error
	root         bool
	children     []*indexEntry
	isValid      bool
	parentPubKey crypto.PubKey
	parent       *indexEntry
	payload      *group.MemberEntryPayload
	fullyValid   bool
}

func (i *indexEntry) findParent(index *memberStoreIndex) *indexEntry {
	if i.parent != nil {
		return i.parent
	}

	for _, e := range index.entries {
		if e.memberDevice.Device.Equals(i.parentPubKey) {
			i.parent = e
			e.children = append(e.children, i)

			return e
		}
	}

	return nil
}

type memberStoreIndex struct {
	entries      map[string]*indexEntry
	muEntries    sync.RWMutex
	members      []*group.MemberDevice
	muMembers    sync.RWMutex
	groupContext orbitutilapi.GroupContext
}

func (m *memberStoreIndex) Get(key string) interface{} {
	m.muMembers.RLock()
	defer m.muMembers.RUnlock()
	return m.members
}

func (m *memberStoreIndex) checkMemberLogEntryPayloadFirst(entry *indexEntry) error {
	if !entry.parentPubKey.Equals(m.groupContext.GetGroup().PubKey) {
		return errcode.ErrGroupMemberLogWrongInviter
	}

	return nil
}

func (m *memberStoreIndex) checkMemberLogEntryPayloadInvited(entry *indexEntry) error {
	m.muEntries.RLock()
	defer m.muEntries.RUnlock()

	for _, e := range m.entries {
		if e.memberDevice.Device.Equals(entry.parentPubKey) {
			return nil
		}
	}

	return errcode.ErrGroupMemberLogWrongInviter
}

func (m *memberStoreIndex) UpdateIndex(log ipfslog.Log, entries []ipfslog.Entry) error {
	for _, e := range log.Values().Slice() {
		var (
			idxE       *indexEntry
			ok         bool
			entryBytes []byte
		)

		entryHash := e.GetHash().String()

		m.muEntries.RLock()
		idxE, ok = m.entries[entryHash]
		m.muEntries.RUnlock()

		if !ok {
			payload := &group.MemberEntryPayload{}

			idxE = &indexEntry{}
			m.muEntries.Lock()
			m.entries[entryHash] = idxE
			m.muEntries.Unlock()

			if entryBytes, idxE.err = storegroup.UnwrapOperation(e); idxE.err != nil {
				continue
			}

			if idxE.err = group.OpenStorePayload(payload, entryBytes, m.groupContext.GetGroup()); idxE.err != nil {
				continue
			}

			if idxE.err = payload.CheckStructure(); idxE.err != nil {
				continue
			}

			idxE.payload = payload

			if idxE.memberDevice, idxE.err = payload.ToMemberDevice(); idxE.err != nil {
				continue
			}

			if idxE.parentPubKey, idxE.err = crypto.UnmarshalEd25519PublicKey(payload.InviterDevicePubKey); idxE.err != nil {
				continue
			}
		}

		if err := m.checkMemberLogEntryPayloadFirst(idxE); err == nil {
			m.validateEntry(idxE, true)
			continue
		}

		if err := m.checkMemberLogEntryPayloadInvited(idxE); err == nil {
			m.validateEntry(idxE, false)
			continue
		}
	}

	return nil
}

func (m *memberStoreIndex) validateEntry(entry *indexEntry, isRoot bool) {
	if entry.fullyValid {
		return
	}
	entry.isValid = true

	if isRoot {
		entry.root = true
	}

	entry.parent = entry.findParent(m)

	if hasAllParentsValid(entry, m) {
		m.muMembers.Lock()
		m.members = append(m.members, entry.memberDevice)
		m.muMembers.Unlock()
		entry.fullyValid = true

		eventNewMemberDevice := NewEventNewMemberDevice(entry.memberDevice)
		m.groupContext.GetMemberStore().Emit(eventNewMemberDevice)
	}

	for _, child := range entry.children {
		m.validateEntry(child, false)
	}
}

func hasAllParentsValid(entry *indexEntry, index *memberStoreIndex) bool {
	if entry.root {
		return true
	}

	if entry.parent == nil {
		return false
	}

	if !entry.parent.isValid {
		return false
	}

	return hasAllParentsValid(entry.parent, index)
}

// NewMemberStoreIndex returns a new index to manage the list of the group members
func NewMemberStoreIndex(g orbitutilapi.GroupContext) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		return &memberStoreIndex{
			groupContext: g,
			entries:      map[string]*indexEntry{},
		}
	}
}

var _ iface.StoreIndex = &memberStoreIndex{}
