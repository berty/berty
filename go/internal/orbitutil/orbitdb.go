package orbitutil

import (
	"context"
	"fmt"
	"sync"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller/simple"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"

	"berty.tech/berty/go/pkg/errcode"
)

type bertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	groups          map[string]GroupContext
	groupsSigPubKey map[string]crypto.PubKey
	keyStore        *BertySignedKeyStore
	lock            sync.RWMutex
}

func (s *bertyOrbitDB) RegisterGroupContext(gc GroupContext) error {
	g := gc.GetGroup()

	groupID, err := g.GroupIDAsString()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
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

func (s *bertyOrbitDB) InitStoresForGroup(ctx context.Context, gc GroupContext, options *orbitdb.CreateDBOptions) error {
	if err := s.RegisterGroupContext(gc); err != nil {
		return errcode.TODO.Wrap(err)
	}

	if _, err := s.GroupMetadataStore(ctx, gc, options); err != nil {
		return errcode.TODO.Wrap(err)
	}

	if _, err := s.GroupMessageStore(ctx, gc, options); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func NewBertyOrbitDB(ctx context.Context, ipfs coreapi.CoreAPI, options *baseorbitdb.NewOrbitDBOptions) (BertyOrbitDB, error) {
	var err error

	if options == nil {
		options = &baseorbitdb.NewOrbitDBOptions{}
	}

	ks := NewBertySignedKeyStore()
	options.Keystore = ks
	options.Identity = &identityprovider.Identity{}

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &bertyOrbitDB{
		BaseOrbitDB:     orbitDB,
		groups:          map[string]GroupContext{},
		groupsSigPubKey: map[string]crypto.PubKey{},
		keyStore:        ks,
	}

	if err := bertyDB.RegisterAccessControllerType(simple.NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	bertyDB.RegisterStoreType(GroupMetadataStoreType, ConstructorFactoryGroupMetadata(bertyDB))
	bertyDB.RegisterStoreType(GroupMessageStoreType, ConstructorFactoryGroupMessage(bertyDB))

	return bertyDB, nil
}

func (s *bertyOrbitDB) GetGroupContext(groupID string) (GroupContext, error) {
	s.lock.RLock()
	g, ok := s.groups[groupID]
	s.lock.RUnlock()

	if !ok {
		return nil, errcode.ErrGroupMemberMissingSecrets
	}

	return g, nil
}

func (s *bertyOrbitDB) GetGroupFromOptions(options *iface.NewStoreOptions) (GroupContext, error) {
	groupIDs, err := options.AccessController.GetAuthorizedByRole(IdentityGroupIDKey)
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
func (s *bertyOrbitDB) SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error {
	if pubKey == nil {
		return errcode.ErrInvalidInput
	}

	s.lock.Lock()
	s.groupsSigPubKey[groupID] = pubKey
	s.lock.Unlock()

	return nil
}

func (s *bertyOrbitDB) InitGroupStore(ctx context.Context, indexConstructor func(g GroupContext) iface.IndexConstructor, store GroupStore, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) error {
	g, err := s.GetGroupFromOptions(options)

	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	options.Index = indexConstructor(g)
	store.SetGroupContext(g)

	if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
		return errcode.ErrOrbitDBInit.Wrap(err)
	}

	return nil
}

func (s *bertyOrbitDB) storeForGroup(ctx context.Context, o iface.BaseOrbitDB, gc GroupContext, options *orbitdb.CreateDBOptions, storeType string) (GroupStore, error) {
	options, err := DefaultOptions(gc.GetGroup(), options, s.keyStore)
	if err != nil {
		return nil, err
	}

	options.StoreType = &storeType

	groupID, err := gc.GetGroup().GroupIDAsString()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	store, err := o.Open(ctx, fmt.Sprintf("%s_%s", groupID, storeType), options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	sStore, ok := store.(GroupStore)
	if !ok {
		return nil, errcode.ErrOrbitDBStoreCast.Wrap(fmt.Errorf("unable to cast store to group store"))
	}

	sStore.SetGroupContext(gc)

	return sStore, nil
}

func (s *bertyOrbitDB) GroupMetadataStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (MetadataStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, GroupMetadataStoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	sStore, ok := store.(MetadataStore)
	if !ok {
		return nil, errors.New("unable to cast store to member store")
	}

	g.SetMetadataStore(sStore)

	return sStore, nil
}

func (s *bertyOrbitDB) GroupMessageStore(ctx context.Context, g GroupContext, options *orbitdb.CreateDBOptions) (MessageStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, GroupMessageStoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	mStore, ok := store.(MessageStore)
	if !ok {
		return nil, errors.New("unable to cast store to member store")
	}

	g.SetMessageStore(mStore)

	return mStore, nil
}

var _ BertyOrbitDB = (*bertyOrbitDB)(nil)
