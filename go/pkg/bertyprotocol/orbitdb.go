package bertyprotocol

import (
	"context"
	"fmt"
	"sync"

	datastore "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
)

type GroupOpenMode uint64

const (
	GroupOpenModeUndefined GroupOpenMode = iota
	GroupOpenModeReplicate
	GroupOpenModeWrite
)

var _ = GroupOpenModeUndefined

type loggable interface {
	setLogger(*zap.Logger)
}

type NewOrbitDBOptions struct {
	baseorbitdb.NewOrbitDBOptions
	Datastore       datastore.Batching
	MessageKeystore *MessageKeystore
	DeviceKeystore  DeviceKeystore
}

func (n *NewOrbitDBOptions) applyDefaults() {
	if n.Datastore == nil {
		n.Datastore = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	if n.Cache == nil {
		n.Cache = NewOrbitDatastoreCache(n.Datastore)
	}

	if n.MessageKeystore == nil {
		mk := ipfsutil.NewNamespacedDatastore(n.Datastore, datastore.NewKey(NamespaceMessageKeystore))
		n.MessageKeystore = NewMessageKeystore(mk)
	}

	if n.DeviceKeystore == nil {
		n.DeviceKeystore = NewDeviceKeystore(ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(n.Datastore, datastore.NewKey(NamespaceDeviceKeystore))))
	}

	if n.Logger == nil {
		n.Logger = zap.NewNop()
	}

	if n.Tracer == nil {
		n.Tracer = trace.NoopTracer{}
	}
}

type BertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	groups          sync.Map // map[string]*bertytypes.Group
	groupContexts   sync.Map // map[string]*groupContext
	groupsSigPubKey sync.Map // map[string]crypto.PubKey
	keyStore        *BertySignedKeyStore
	messageKeystore *MessageKeystore
	deviceKeystore  DeviceKeystore
}

func (s *BertyOrbitDB) GetContactGroup(pk crypto.PubKey) (*bertytypes.Group, error) {
	sk, err := s.deviceKeystore.ContactGroupPrivKey(pk)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return getGroupForContact(sk)
}

func (s *BertyOrbitDB) registerGroupPrivateKey(g *bertytypes.Group) error {
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

func (s *BertyOrbitDB) registerGroupSigningPubKey(g *bertytypes.Group) error {
	groupID := g.GroupIDAsString()

	var gSigPK crypto.PubKey

	gSigSK, err := g.GetSigningPrivKey()
	if err == nil && gSigSK != nil {
		gSigPK = gSigSK.GetPublic()
	} else {
		gSigPK, err = g.GetSigningPubKey()
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	if err := s.SetGroupSigPubKey(groupID, gSigPK); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func NewBertyOrbitDB(ctx context.Context, ipfs coreapi.CoreAPI, options *NewOrbitDBOptions) (*BertyOrbitDB, error) {
	var err error

	if options == nil {
		options = &NewOrbitDBOptions{}
	}

	options.applyDefaults()
	options.Logger = options.Logger.Named("odb")

	ks := &BertySignedKeyStore{}
	options.Keystore = ks
	options.Identity = &identityprovider.Identity{}

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, &options.NewOrbitDBOptions)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &BertyOrbitDB{
		BaseOrbitDB:     orbitDB,
		keyStore:        ks,
		deviceKeystore:  options.DeviceKeystore,
		messageKeystore: options.MessageKeystore,
	}

	if err := bertyDB.RegisterAccessControllerType(NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	bertyDB.RegisterStoreType(groupMetadataStoreType, constructorFactoryGroupMetadata(bertyDB))
	bertyDB.RegisterStoreType(groupMessageStoreType, constructorFactoryGroupMessage(bertyDB))

	return bertyDB, nil
}

func (s *BertyOrbitDB) openAccountGroup(ctx context.Context, options *orbitdb.CreateDBOptions) (*groupContext, error) {
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

	return s.openGroup(ctx, g, options)
}

func (s *BertyOrbitDB) openGroup(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (*groupContext, error) {
	if s.deviceKeystore == nil || s.messageKeystore == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("db open in naive mode"))
	}

	id := g.GroupIDAsString()

	existingGC, err := s.getGroupContext(id)
	if err != nil && !errcode.Is(err, errcode.ErrMissingMapKey) {
		return nil, errcode.ErrInternal.Wrap(err)
	}
	if err == nil {
		return existingGC, nil
	}

	groupID := g.GroupIDAsString()
	s.groups.Store(groupID, g)

	if err := s.registerGroupPrivateKey(g); err != nil {
		return nil, err
	}

	s.Logger().Debug("openGroup", zap.Any("public key", g.PublicKey), zap.Any("secret", g.Secret), zap.Stringer("type", g.GroupType))

	memberDevice, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	// Force secret generation if missing
	if _, err := s.messageKeystore.GetDeviceSecret(g, s.deviceKeystore); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	metaImpl, err := s.groupMetadataStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	messagesImpl, err := s.groupMessageStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	gc := newContextGroup(g, metaImpl, messagesImpl, s.messageKeystore, memberDevice, s.Logger())
	s.groupContexts.Store(groupID, gc)

	return gc, nil
}

func (s *BertyOrbitDB) openGroupReplication(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) error {
	if g == nil || len(g.PublicKey) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing group or group pubkey"))
	}

	id := g.GroupIDAsString()

	_, err := s.getGroupContext(id)
	if err != nil && !errcode.Is(err, errcode.ErrMissingMapKey) {
		return errcode.ErrInternal.Wrap(err)
	}
	if err == nil {
		return nil
	}

	groupID := g.GroupIDAsString()
	s.groups.Store(groupID, g)

	if err := s.registerGroupSigningPubKey(g); err != nil {
		return err
	}

	_, err = s.storeForGroup(ctx, s, g, options, groupMetadataStoreType, GroupOpenModeReplicate)
	if err != nil {
		return errors.Wrap(err, "unable to open database")
	}

	_, err = s.storeForGroup(ctx, s, g, options, groupMessageStoreType, GroupOpenModeReplicate)
	if err != nil {
		return errors.Wrap(err, "unable to open database")
	}

	return nil
}

func (s *BertyOrbitDB) getGroupContext(id string) (*groupContext, error) {
	g, ok := s.groupContexts.Load(id)
	if !ok {
		return nil, errcode.ErrMissingMapKey
	}

	return g.(*groupContext), nil
}

// SetGroupSigPubKey registers a new group signature pubkey, mainly used to
// replicate a store data without needing to access to its content
func (s *BertyOrbitDB) SetGroupSigPubKey(groupID string, pubKey crypto.PubKey) error {
	if pubKey == nil {
		return errcode.ErrInvalidInput
	}

	s.groupsSigPubKey.Store(groupID, pubKey)

	return nil
}

func (s *BertyOrbitDB) storeForGroup(ctx context.Context, o iface.BaseOrbitDB, g *bertytypes.Group, options *orbitdb.CreateDBOptions, storeType string, groupOpenMode GroupOpenMode) (iface.Store, error) {
	options, err := DefaultOrbitDBOptions(g, options, s.keyStore, storeType, groupOpenMode)
	if err != nil {
		return nil, err
	}

	options.StoreType = &storeType

	store, err := o.Open(ctx, fmt.Sprintf("%s_%s", g.GroupIDAsString(), storeType), options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	_ = store.Load(ctx, -1)

	return store, nil
}

func (s *BertyOrbitDB) groupMetadataStore(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (*metadataStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, groupMetadataStoreType, GroupOpenModeWrite)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	sStore, ok := store.(*metadataStore)
	if !ok {
		return nil, errors.New("unable to cast store to metadata store")
	}

	return sStore, nil
}

func (s *BertyOrbitDB) groupMessageStore(ctx context.Context, g *bertytypes.Group, options *orbitdb.CreateDBOptions) (*messageStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, groupMessageStoreType, GroupOpenModeWrite)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	mStore, ok := store.(*messageStore)
	if !ok {
		return nil, errors.New("unable to cast store to message store")
	}

	return mStore, nil
}

func (s *BertyOrbitDB) getGroupFromOptions(options *iface.NewStoreOptions) (*bertytypes.Group, error) {
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
