package orbitutil

import (
	"sync"

	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"

	"berty.tech/berty/go/internal/group"
)

type GroupContext struct {
	group         *group.Group
	memberStore   orbitutilapi.MemberStore
	settingsStore orbitutilapi.SettingsStore
	lock          sync.RWMutex
}

func (g *GroupContext) GetGroup() *group.Group {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.group
}

func (g *GroupContext) GetMemberStore() orbitutilapi.MemberStore {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.memberStore
}

func (g *GroupContext) GetSettingsStore() orbitutilapi.SettingsStore {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.settingsStore
}

func (g *GroupContext) SetGroup(group *group.Group) {
	g.lock.Lock()
	g.group = group
	g.lock.Unlock()
}

func (g *GroupContext) SetMemberStore(s orbitutilapi.MemberStore) {
	g.lock.Lock()
	g.memberStore = s
	g.lock.Unlock()
}

func (g *GroupContext) SetSettingsStore(s orbitutilapi.SettingsStore) {
	g.lock.Lock()
	g.settingsStore = s
	g.lock.Unlock()
}
