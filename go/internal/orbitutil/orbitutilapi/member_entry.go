package orbitutilapi

import "github.com/libp2p/go-libp2p-core/crypto"

type MemberEntry struct {
	member   crypto.PubKey
	devices  []crypto.PubKey
	inviters []crypto.PubKey
}

func NewMemberEntry(member crypto.PubKey, devices []crypto.PubKey, inviters []crypto.PubKey) *MemberEntry {
	return &MemberEntry{
		member:   member,
		devices:  devices,
		inviters: inviters,
	}
}

func (m MemberEntry) AddDeviceKey(key crypto.PubKey) *MemberEntry {
	m.devices = append(m.devices, key)

	return &m
}

func (m MemberEntry) AddInviterKey(key crypto.PubKey) *MemberEntry {
	m.inviters = append(m.inviters, key)

	return &m
}

func (m *MemberEntry) Inviters() []crypto.PubKey {
	return append(m.inviters[:0:0], m.inviters...)
}

func (m *MemberEntry) CountInviters() int {
	return len(m.inviters)
}

func (m *MemberEntry) FirstInviter() crypto.PubKey {
	return m.inviters[0]
}

func (m *MemberEntry) Devices() []crypto.PubKey {
	return append(m.devices[:0:0], m.devices...)
}

func (m *MemberEntry) CountDevices() int {
	return len(m.devices)
}

func (m *MemberEntry) FirstDevice() crypto.PubKey {
	return m.devices[0]
}

func (m *MemberEntry) Member() crypto.PubKey {
	return m.member
}
