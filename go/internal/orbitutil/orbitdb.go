package orbitutil

import (
	"context"
	"fmt"
	"sync"
	"time"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/orbitutil/identityberty"
	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"
	"berty.tech/berty/go/internal/orbitutil/storegroup"
	memberstore "berty.tech/berty/go/internal/orbitutil/storemember"
	settingstore "berty.tech/berty/go/internal/orbitutil/storesetting"
	"berty.tech/berty/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller/simple"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
)

type BertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	groups          map[string]orbitutilapi.GroupContext
	groupsSigPubKey map[string]crypto.PubKey
	keyStore        *identityberty.BertySignedKeyStore
	lock            sync.RWMutex
}

func (s *BertyOrbitDB) RegisterGroupContext(gc orbitutilapi.GroupContext) error {
	g := gc.GetGroup()

	groupID, err := g.GroupIDAsString()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	s.lock.Lock()
	s.groups[groupID] = gc
	s.lock.Unlock()

	if err = s.SetGroupSigPubKey(groupID, g.SigningKey.GetPublic()); err != nil {
		return errcode.TODO.Wrap(err)
	}

	s.lock.RLock()
	ks := s.keyStore
	s.lock.RUnlock()

	if err := ks.SetKey(g.SigningKey); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func (s *BertyOrbitDB) InitStoresForGroup(ctx context.Context, g *group.Group, options *orbitdb.CreateDBOptions) (orbitutilapi.GroupContext, error) {
	gc := &GroupContext{group: g}

	if err := s.RegisterGroupContext(gc); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if _, err := s.GroupMemberStore(ctx, gc, options); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if _, err := s.GroupSettingsStore(ctx, gc, options); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return gc, nil
}

func NewBertyOrbitDB(ctx context.Context, ipfs coreapi.CoreAPI, options *baseorbitdb.NewOrbitDBOptions) (*BertyOrbitDB, error) {
	var err error

	if options == nil {
		options = &baseorbitdb.NewOrbitDBOptions{}
	}

	ks := identityberty.NewBertySignedKeyStore()
	options.Keystore = ks
	options.Identity = &identityprovider.Identity{}

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &BertyOrbitDB{
		BaseOrbitDB:     orbitDB,
		groups:          map[string]orbitutilapi.GroupContext{},
		groupsSigPubKey: map[string]crypto.PubKey{},
		keyStore:        ks,
	}

	if err := bertyDB.RegisterAccessControllerType(simple.NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	bertyDB.RegisterStoreType(memberstore.StoreType, memberstore.ConstructorFactory(bertyDB))
	bertyDB.RegisterStoreType(settingstore.StoreType, settingstore.ConstructorFactory(bertyDB))

	return bertyDB, nil
}

func (s *BertyOrbitDB) GetGroupContext(groupID string) (orbitutilapi.GroupContext, error) {
	s.lock.RLock()
	g, ok := s.groups[groupID]
	s.lock.RUnlock()

	if !ok {
		return nil, errcode.ErrGroupMemberMissingSecrets
	}

	return g, nil
}

func (s *BertyOrbitDB) GetGroupFromOptions(options *iface.NewStoreOptions) (orbitutilapi.GroupContext, error) {
	groupIDs, err := options.AccessController.GetAuthorizedByRole(identityberty.GroupIDKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if len(groupIDs) != 1 {
		return nil, errcode.ErrInvalidInput
	}

	return s.GetGroupContext(groupIDs[0])
}

// SetGroupSigPubKey registers a new group signature pubkey, mainly used to
// replicate a store data without needing to access to its content
func (s *BertyOrbitDB) SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error {
	if pubKey == nil {
		return errcode.ErrInvalidInput
	}

	s.lock.Lock()
	s.groupsSigPubKey[groupID] = pubKey
	s.lock.Unlock()

	return nil
}

func (s *BertyOrbitDB) InitGroupStore(ctx context.Context, indexConstructor func(g orbitutilapi.GroupContext) iface.IndexConstructor, store orbitutilapi.GroupStore, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error {
	g, err := s.GetGroupFromOptions(options)

	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	options.Index = indexConstructor(g)
	store.SetGroupContext(g)

	if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
		return errors.Wrap(err, "unable to initialize base store")
	}

	return nil
}

func (s *BertyOrbitDB) storeForGroup(ctx context.Context, o iface.BaseOrbitDB, gc orbitutilapi.GroupContext, options *orbitdb.CreateDBOptions, storeType string) (orbitutilapi.GroupStore, error) {
	options, err := storegroup.DefaultOptions(gc.GetGroup(), options, s.keyStore)
	if err != nil {
		return nil, err
	}

	options.StoreType = &storeType

	groupID, err := gc.GetGroup().GroupIDAsString()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	store, err := o.Open(ctx, fmt.Sprintf("%s_%s", groupID, storeType), options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	sStore, ok := store.(orbitutilapi.GroupStore)
	if !ok {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to cast store to group store"))
	}

	return sStore, nil
}

func (s *BertyOrbitDB) GroupSettingsStore(ctx context.Context, g orbitutilapi.GroupContext, options *orbitdb.CreateDBOptions) (orbitutilapi.SettingsStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, settingstore.StoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	sStore, ok := store.(orbitutilapi.SettingsStore)
	if !ok {
		return nil, errors.New("unable to cast store to settings store")
	}

	g.SetSettingsStore(sStore)

	return sStore, nil
}

func (s *BertyOrbitDB) GroupMemberStore(ctx context.Context, g orbitutilapi.GroupContext, options *orbitdb.CreateDBOptions) (orbitutilapi.MemberStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, memberstore.StoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	sStore, ok := store.(orbitutilapi.MemberStore)
	if !ok {
		return nil, errors.New("unable to cast store to member store")
	}

	g.SetMemberStore(sStore)

	return sStore, nil
}

var _ orbitutilapi.BertyOrbitDB = (*BertyOrbitDB)(nil)

func WaitStoreReplication(ctx context.Context, timeout time.Duration, s orbitdb.Store) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	go s.Subscribe(ctx, func(evt events.Event) {
		switch evt.(type) {
		case *stores.EventReplicated:
			cancel()
		}
	})

	<-ctx.Done()
}
