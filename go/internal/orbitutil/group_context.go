package orbitutil

import (
	"context"
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
	group             *group.Group
	ownMemberDevice   *group.OwnMemberDevice
	metadataStore     MetadataStore
	messageStore      MessageStore
	messageKeysHolder MessageKeysHolder
	lock              *sync.RWMutex
}

func (g *groupContext) GetMessageStore() MessageStore {
	g.lock.RLock()
	defer g.lock.RUnlock()

	return g.messageStore
}

func (g *groupContext) SetMessageStore(s MessageStore) {
	g.lock.Lock()
	defer g.lock.Unlock()

	g.messageStore = s
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

func (g *groupContext) GetDeviceSecret(ctx context.Context) (*bertyprotocol.DeviceSecret, error) {
	g.lock.RLock()
	defer g.lock.RUnlock()

	return g.messageKeysHolder.GetDeviceChainKey(ctx, g.ownMemberDevice.Device.GetPublic())
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

func (g *groupContext) GetMessageKeysHolder() MessageKeysHolder {
	g.lock.Lock()
	defer g.lock.Unlock()

	return g.messageKeysHolder
}

func (g *groupContext) SetMessageKeysHolder(m MessageKeysHolder) {
	g.lock.Lock()
	defer g.lock.Unlock()

	g.messageKeysHolder = m
}

func NewGroupContext(g *group.Group, omd *group.OwnMemberDevice) GroupContext {
	return &groupContext{
		group:           g,
		ownMemberDevice: omd,
		lock:            &sync.RWMutex{},
	}
}
