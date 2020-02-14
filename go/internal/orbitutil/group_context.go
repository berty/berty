package orbitutil

import (
	"context"
	"sync"

	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
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

	if g.messageKeysHolder == nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := g.messageKeysHolder.GetDeviceChainKey(ctx, g.ownMemberDevice.Device.GetPublic())
	if err != nil {
		return nil, errcode.ErrPersistenceGet.Wrap(err)
	}

	return ds, nil
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

func InitGroupContext(ctx context.Context, gc GroupContext, odb BertyOrbitDB) error {
	// TODO: check if already joined
	// TODO: check if an existing key chain exists

	ds, err := group.NewDeviceSecret()
	if err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	mkh, err := NewInMemoryMessageKeysHolder(ctx, gc, ds)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	gc.SetMessageKeysHolder(mkh)

	if err := RegisterChainKeyForDevice(ctx, mkh, gc.GetDevicePrivKey().GetPublic(), ds); err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	if err = odb.InitStoresForGroup(ctx, gc, nil); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func ActivateGroupContext(ctx context.Context, gc GroupContext) error {
	if _, err := gc.GetMetadataStore().JoinGroup(ctx); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err := FillMessageKeysHolderUsingPreviousData(ctx, gc); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err := SendSecretsToExistingMembers(ctx, gc); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	go func() {
		_ = FillMessageKeysHolderUsingNewData(ctx, gc)
	}()

	go WatchNewMembersAndSendSecrets(ctx, zap.NewNop(), gc)

	return nil
}

func NewGroupContext(g *group.Group, omd *group.OwnMemberDevice) GroupContext {
	return &groupContext{
		group:           g,
		ownMemberDevice: omd,
		lock:            &sync.RWMutex{},
	}
}
