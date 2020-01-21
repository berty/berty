package orbitutil

import (
	"sync"

	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type ClearPayload interface {
	proto.Marshaler
	proto.Unmarshaler
}

type groupContext struct {
	group           *group.Group
	ownMemberDevice *group.OwnMemberDevice
	metadataStore   MetadataStore
	lock            *sync.RWMutex
}

func (g *groupContext) GetGroup() *group.Group {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.group
}

func (g *groupContext) GetMemberPrivKey() crypto.PrivKey {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.ownMemberDevice.Member
}

func (g *groupContext) GetDevicePrivKey() crypto.PrivKey {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.ownMemberDevice.Device
}

func (g *groupContext) GetDeviceSecret() *bertyprotocol.DeviceSecret {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.ownMemberDevice.Secret
}

func (g *groupContext) GetMetadataStore() MetadataStore {
	g.lock.RLock()
	defer g.lock.RUnlock()
	return g.metadataStore
}

func (g *groupContext) SetMetadataStore(s MetadataStore) {
	g.lock.Lock()
	defer g.lock.Unlock()

	g.metadataStore = s
}

func NewGroupContext(g *group.Group, omd *group.OwnMemberDevice) GroupContext {
	return &groupContext{
		group:           g,
		ownMemberDevice: omd,
		lock:            &sync.RWMutex{},
	}
}
