package bertyprotocol

import (
	"context"
	"fmt"
	"sync"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type loggable interface {
	setLogger(*zap.Logger)
}

type bertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	groups          sync.Map // map[string]*bertytypes.Group
	groupContexts   sync.Map // map[string]*groupContext
	groupsSigPubKey sync.Map // map[string]crypto.PubKey
	keyStore        *BertySignedKeyStore
	messageKeystore *MessageKeystore
	deviceKeystore  DeviceKeystore
	logger          *zap.Logger
}

func (s *bertyOrbitDB) GetContactGroup(pk crypto.PubKey) (*bertytypes.Group, error) {
	sk, err := s.deviceKeystore.ContactGroupPrivKey(pk)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return getGroupForContact(sk)
}

func (s *bertyOrbitDB) registerGroupPrivateKey(g *bertytypes.Group) error {
	groupID := g.GroupIDAsString()

	gSigSK, err := g.GetSigningPrivKey()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if err := s.SetGroupSigPubKey(groupID, gSigSK.GetPublic()); err != nil {
		return errcode.TODO.Wrap(err)
	}

	if err := s.keyStore.SetKey(gSigSK); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func newBertyOrbitDB(ctx context.Context, ipfs coreapi.CoreAPI, acc DeviceKeystore, mk *MessageKeystore, logger *zap.Logger, options *orbitdb.NewOrbitDBOptions) (*bertyOrbitDB, error) {
	var err error

	if options == nil {
		options = &orbitdb.NewOrbitDBOptions{}
	}

	if logger == nil {
		logger = zap.NewNop()
	}

	ks := &BertySignedKeyStore{}
	options.Keystore = ks
	options.Identity = &identityprovider.Identity{}

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &bertyOrbitDB{
		BaseOrbitDB:     orbitDB,
		keyStore:        ks,
		deviceKeystore:  acc,
		messageKeystore: mk,
		logger:          logger,
	}

	if err := bertyDB.RegisterAccessControllerType(NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	bertyDB.RegisterStoreType(groupMetadataStoreType, constructorFactoryGroupMetadata(bertyDB))
	bertyDB.RegisterStoreType(groupMessageStoreType, constructorFactoryGroupMessage(bertyDB))

	return bertyDB, nil
}

func (s *bertyOrbitDB) OpenAccountGroup(ctx context.Context, options *orbitdb.CreateDBOptions) (*groupContext, error) {
	sk, err := s.deviceKeystore.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	skProof, err := s.deviceKeystore.AccountProofPrivKey()
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	g, err := getGroupForAccount(sk, skProof)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	return s.OpenGroup(ctx, g, options)
}

func (s *bertyOrbitDB) OpenGroup(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (*groupContext, error) {
	id := g.GroupIDAsString()

	existingGC, err := s.getGroupContext(id)
	if err != nil && err != errcode.ErrMissingMapKey {
		return nil, errcode.ErrInternal.Wrap(err)
	} else if err == nil {
		return existingGC, nil
	}

	groupID := g.GroupIDAsString()
	s.groups.Store(groupID, g)

	if err := s.registerGroupPrivateKey(g); err != nil {
		return nil, err
	}

	s.logger.Warn(fmt.Sprintf("group details %+v", g))

	memberDevice, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	// Force secret generation if missing
	if _, err := getDeviceSecret(ctx, g, s.messageKeystore, s.deviceKeystore); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	metaImpl, err := s.GroupMetadataStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	messagesImpl, err := s.GroupMessageStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	gc := newContextGroup(g, metaImpl, messagesImpl, s.messageKeystore, memberDevice, s.logger)
	s.groupContexts.Store(groupID, gc)

	return gc, nil
}

func (s *bertyOrbitDB) getGroupContext(id string) (*groupContext, error) {
	g, ok := s.groupContexts.Load(id)
	if !ok {
		return nil, errcode.ErrMissingMapKey
	}

	return g.(*groupContext), nil
}

// SetGroupSigPubKey registers a new group signature pubkey, mainly used to
// replicate a store data without needing to access to its content
func (s *bertyOrbitDB) SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error {
	if pubKey == nil {
		return errcode.ErrInvalidInput
	}

	s.groupsSigPubKey.Store(groupID, pubKey)

	return nil
}

func (s *bertyOrbitDB) storeForGroup(ctx context.Context, o iface.BaseOrbitDB, g *bertytypes.Group, options *orbitdb.CreateDBOptions, storeType string) (iface.Store, error) {
	options, err := DefaultOrbitDBOptions(g, options, s.keyStore, storeType)
	if err != nil {
		return nil, err
	}

	options.StoreType = &storeType

	store, err := o.Open(ctx, fmt.Sprintf("%s_%s", g.GroupIDAsString(), storeType), options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	if loggableStore, ok := store.(loggable); ok {
		loggableStore.setLogger(s.logger)
	}

	_ = store.Load(ctx, -1)

	return store, nil
}

func (s *bertyOrbitDB) GroupMetadataStore(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (*metadataStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, groupMetadataStoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	sStore, ok := store.(*metadataStore)
	if !ok {
		return nil, errors.New("unable to cast store to metadata store")
	}

	return sStore, nil
}

func (s *bertyOrbitDB) GroupMessageStore(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (*messageStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, groupMessageStoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	mStore, ok := store.(*messageStore)
	if !ok {
		return nil, errors.New("unable to cast store to message store")
	}

	return mStore, nil
}

func (s *bertyOrbitDB) getGroupFromOptions(options *iface.NewStoreOptions) (*bertytypes.Group, error) {
	groupIDs, err := options.AccessController.GetAuthorizedByRole(identityGroupIDKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if len(groupIDs) != 1 {
		return nil, errcode.ErrInvalidInput
	}

	g, ok := s.groups.Load(groupIDs[0])
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	typed, ok := g.(*bertytypes.Group)
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	return typed, nil
}
