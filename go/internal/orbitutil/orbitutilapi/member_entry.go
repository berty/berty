package orbitutilapi

import (
	"sync"

	"github.com/libp2p/go-libp2p-core/crypto"
)

type MemberEntry struct {
	member   crypto.PubKey
	devices  []crypto.PubKey
	inviters []crypto.PubKey
	lock     sync.RWMutex
}

func NewMemberEntry(member crypto.PubKey, devices []crypto.PubKey, inviters []crypto.PubKey) *MemberEntry {
	return &MemberEntry{
		member:   member,
		devices:  devices,
		inviters: inviters,
	}
}

func (m *MemberEntry) AddDeviceKey(key crypto.PubKey) {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.devices = append(m.devices, key)
}

func (m *MemberEntry) AddInviterKey(key crypto.PubKey) {
	m.lock.Lock()
	defer m.lock.Unlock()

	m.inviters = append(m.inviters, key)
}

func (m *MemberEntry) Inviters() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return append([]crypto.PubKey(nil), m.inviters...)
}

func (m *MemberEntry) CountInviters() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return len(m.inviters)
}

func (m *MemberEntry) FirstInviter() crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.inviters[0]
}

func (m *MemberEntry) Devices() []crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return append([]crypto.PubKey(nil), m.devices...)
}

func (m *MemberEntry) CountDevices() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return len(m.devices)
}

func (m *MemberEntry) FirstDevice() crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.devices[0]
}

func (m *MemberEntry) Member() crypto.PubKey {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.member
}
