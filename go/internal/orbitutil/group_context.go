package orbitutil

import (
	"sync"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
)

type GroupContext struct {
	group           *group.Group
	ownMemberDevice *group.OwnMemberDevice
	memberStore     orbitutilapi.MemberStore
	settingStore    orbitutilapi.SettingStore
	secretStore     orbitutilapi.SecretStore
	lock            *sync.RWMutex
}

func (g *GroupContext) GetGroup() *group.Group {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.group
}

func (g *GroupContext) GetMemberPrivKey() crypto.PrivKey {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.ownMemberDevice.Member
}

func (g *GroupContext) GetDevicePrivKey() crypto.PrivKey {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.ownMemberDevice.Device
}

func (g *GroupContext) GetDeviceSecret() *group.DeviceSecret {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.ownMemberDevice.Secret
}

func (g *GroupContext) GetMemberStore() orbitutilapi.MemberStore {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.memberStore
}

func (g *GroupContext) GetSettingStore() orbitutilapi.SettingStore {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.settingStore
}

func (g *GroupContext) GetSecretStore() orbitutilapi.SecretStore {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.secretStore
}

func (g *GroupContext) SetMemberStore(s orbitutilapi.MemberStore) {
	g.lock.Lock()
	g.memberStore = s
	g.lock.Unlock()
}

func (g *GroupContext) SetSettingStore(s orbitutilapi.SettingStore) {
	g.lock.Lock()
	g.settingStore = s
	g.lock.Unlock()
}

func (g *GroupContext) SetSecretStore(s orbitutilapi.SecretStore) {
	g.lock.Lock()
	g.secretStore = s
	g.lock.Unlock()
}

func NewGroupContext(g *group.Group, omd *group.OwnMemberDevice) *GroupContext {
	return &GroupContext{
		group:           g,
		ownMemberDevice: omd,
		lock:            &sync.RWMutex{},
	}
}
