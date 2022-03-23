package bertyprotocol

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-eventbus"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-ipfs-log/enc"
	"berty.tech/go-ipfs-log/entry"
	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-ipfs-log/io"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/pubsub/pubsubcoreapi"
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
	Datastore        datastore.Batching
	MessageKeystore  *cryptoutil.MessageKeystore
	DeviceKeystore   cryptoutil.DeviceKeystore
	RotationInterval *rendezvous.RotationInterval
}

func (n *NewOrbitDBOptions) applyDefaults() {
	if n.Datastore == nil {
		n.Datastore = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	if n.Cache == nil {
		n.Cache = NewOrbitDatastoreCache(n.Datastore)
	}

	if n.Logger == nil {
		n.Logger = zap.NewNop()
	}

	if n.MessageKeystore == nil {
		n.MessageKeystore = cryptoutil.NewMessageKeystore(datastoreutil.NewNamespacedDatastore(n.Datastore, datastore.NewKey(datastoreutil.NamespaceMessageKeystore)))
	}

	if n.DeviceKeystore == nil {
		n.DeviceKeystore = cryptoutil.NewDeviceKeystore(ipfsutil.NewDatastoreKeystore(datastoreutil.NewNamespacedDatastore(n.Datastore, datastore.NewKey(NamespaceDeviceKeystore))), nil)
	}

	if n.RotationInterval == nil {
		n.RotationInterval = rendezvous.NewStaticRotationInterval()
	}
}

type BertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	rotationInterval *rendezvous.RotationInterval
	groups           sync.Map // map[string]*protocoltypes.Group
	groupContexts    sync.Map // map[string]*GroupContext
	groupsSigPubKey  sync.Map // map[string]crypto.PubKey
	keyStore         *BertySignedKeyStore
	messageKeystore  *cryptoutil.MessageKeystore
	deviceKeystore   cryptoutil.DeviceKeystore
	pubSub           iface.PubSubInterface
	messageMarshaler *RotationMessageMarshaler
}

func (s *BertyOrbitDB) registerGroupPrivateKey(g *protocoltypes.Group) error {
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

func (s *BertyOrbitDB) registerGroupSigningPubKey(g *protocoltypes.Group) error {
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

	if options.PubSub == nil {
		self, err := ipfs.Key().Self(ctx)
		if err != nil {
			return nil, err
		}

		options.PubSub = pubsubcoreapi.NewPubSub(ipfs, self.ID(), time.Second, options.Logger, options.Tracer)
	}

	mm := NewRotationMessageMarshaler(options.RotationInterval)
	if options.MessageMarshaler == nil {
		options.MessageMarshaler = mm
	}

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, &options.NewOrbitDBOptions)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &BertyOrbitDB{
		messageMarshaler: mm,
		BaseOrbitDB:      orbitDB,
		keyStore:         ks,
		deviceKeystore:   options.DeviceKeystore,
		messageKeystore:  options.MessageKeystore,
		rotationInterval: options.RotationInterval,
		pubSub:           options.PubSub,
	}

	if err := bertyDB.RegisterAccessControllerType(NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	bertyDB.RegisterStoreType(groupMetadataStoreType, constructorFactoryGroupMetadata(bertyDB, options.Logger))
	bertyDB.RegisterStoreType(groupMessageStoreType, constructorFactoryGroupMessage(bertyDB, options.Logger))

	return bertyDB, nil
}

func (s *BertyOrbitDB) openAccountGroup(ctx context.Context, options *orbitdb.CreateDBOptions, ipfsCoreAPI ipfsutil.ExtendedCoreAPI) (*GroupContext, error) {
	l := s.Logger()

	sk, err := s.deviceKeystore.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	l.Debug("Got AccountPrivKey", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	skProof, err := s.deviceKeystore.AccountProofPrivKey()
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	l.Debug("Got AccountProofPrivKey", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	g, err := cryptoutil.GetGroupForAccount(sk, skProof)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	l.Debug("Got account group", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Group", Description: g.String()}})...)

	gc, err := s.OpenGroup(ctx, g, options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	l.Debug("Opened account group", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	if err := ActivateGroupContext(ctx, gc, nil); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	l.Debug("Account group context activated", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	TagGroupContextPeers(ctx, gc, ipfsCoreAPI, 84)

	l.Debug("TagGroupContextPeers done", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	return gc, nil
}

func (s *BertyOrbitDB) setHeadsForGroup(ctx context.Context, g *protocoltypes.Group, metaHeads, messageHeads []cid.Cid) error {
	id := g.GroupIDAsString()

	var (
		err                    error
		metaImpl, messagesImpl orbitdb.Store
	)

	existingGC, err := s.getGroupContext(id)
	if err != nil && !errcode.Is(err, errcode.ErrMissingMapKey) {
		return errcode.ErrInternal.Wrap(err)
	}
	if err == nil {
		metaImpl = existingGC.metadataStore
		messagesImpl = existingGC.messageStore
	}

	if metaImpl == nil || messagesImpl == nil {
		groupID := g.GroupIDAsString()
		s.groups.Store(groupID, g)

		if err := s.registerGroupSigningPubKey(g); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		s.Logger().Debug("OpenGroup", zap.Any("public key", g.PublicKey), zap.Any("secret", g.Secret), zap.Stringer("type", g.GroupType))

		if metaImpl == nil {
			metaImpl, err = s.storeForGroup(ctx, s, g, nil, groupMetadataStoreType, GroupOpenModeReplicate)
			if err != nil {
				return errcode.ErrOrbitDBOpen.Wrap(err)
			}

			defer func() { _ = metaImpl.Close() }()
		}

		if messagesImpl == nil {
			messagesImpl, err = s.storeForGroup(ctx, s, g, nil, groupMessageStoreType, GroupOpenModeReplicate)
			if err != nil {
				return errcode.ErrOrbitDBOpen.Wrap(err)
			}

			defer func() { _ = messagesImpl.Close() }()
		}
	}

	if messagesImpl == nil {
		return errcode.ErrInternal.Wrap(fmt.Errorf("message store is nil"))
	}

	if metaImpl == nil {
		return errcode.ErrInternal.Wrap(fmt.Errorf("metadata store is nil"))
	}

	messageHeadsEntries := make([]ipfslog.Entry, len(messageHeads))
	for i, h := range messageHeads {
		messageHeadsEntries[i] = &entry.Entry{Hash: h}
	}

	messagesImpl.Replicator().Load(ctx, messageHeadsEntries)

	metaHeadsEntries := make([]ipfslog.Entry, len(metaHeads))
	for i, h := range metaHeads {
		metaHeadsEntries[i] = &entry.Entry{Hash: h}
	}
	metaImpl.Replicator().Load(ctx, metaHeadsEntries)

	return nil
}

func (s *BertyOrbitDB) OpenGroup(ctx context.Context, g *protocoltypes.Group, options *orbitdb.CreateDBOptions) (*GroupContext, error) {
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

	s.Logger().Debug("OpenGroup", tyber.FormatStepLogFields(ctx, tyber.ZapFieldsToDetails(zap.Any("public key", g.PublicKey), zap.Any("secret", g.Secret), zap.Stringer("type", g.GroupType)))...)

	memberDevice, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	mpkb, err := crypto.MarshalPublicKey(memberDevice.Public().Member)
	if err != nil {
		mpkb = []byte{}
	}
	s.Logger().Debug("Got member device", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "DevicePublicKey", Description: base64.RawURLEncoding.EncodeToString(mpkb)}})...)

	// Force secret generation if missing
	if _, err := s.messageKeystore.GetDeviceSecret(ctx, g, s.deviceKeystore); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	s.Logger().Debug("Got device secret", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	metaImpl, err := s.groupMetadataStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	s.Logger().Debug("Got metadata store", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	messagesImpl, err := s.groupMessageStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	s.Logger().Debug("Got message store", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	gc := NewContextGroup(g, metaImpl, messagesImpl, s.messageKeystore, memberDevice, s.Logger())

	s.Logger().Debug("Created group context", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	s.groupContexts.Store(groupID, gc)

	s.Logger().Debug("Stored group context", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	return gc, nil
}

func (s *BertyOrbitDB) OpenGroupReplication(ctx context.Context, g *protocoltypes.Group, options *orbitdb.CreateDBOptions) (iface.Store, iface.Store, error) {
	if g == nil || len(g.PublicKey) == 0 {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing group or group pubkey"))
	}

	groupID := g.GroupIDAsString()

	gc, err := s.getGroupContext(groupID)
	if err != nil && !errcode.Is(err, errcode.ErrMissingMapKey) {
		return nil, nil, errcode.ErrInternal.Wrap(err)
	}
	if err == nil {
		return gc.metadataStore, gc.messageStore, nil
	}

	s.groups.Store(groupID, g)

	if err := s.registerGroupSigningPubKey(g); err != nil {
		return nil, nil, err
	}

	metadataStore, err := s.storeForGroup(ctx, s, g, options, groupMetadataStoreType, GroupOpenModeReplicate)
	if err != nil {
		_ = metadataStore.Close()
		return nil, nil, errors.Wrap(err, "unable to open database")
	}

	messageStore, err := s.storeForGroup(ctx, s, g, options, groupMessageStoreType, GroupOpenModeReplicate)
	if err != nil {
		return nil, nil, errors.Wrap(err, "unable to open database")
	}

	return metadataStore, messageStore, nil
}

func (s *BertyOrbitDB) getGroupContext(id string) (*GroupContext, error) {
	g, ok := s.groupContexts.Load(id)
	if !ok {
		return nil, errcode.ErrMissingMapKey
	}

	return g.(*GroupContext), nil
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

func (s *BertyOrbitDB) storeForGroup(ctx context.Context, o iface.BaseOrbitDB, g *protocoltypes.Group, options *orbitdb.CreateDBOptions, storeType string, groupOpenMode GroupOpenMode) (iface.Store, error) {
	l := s.Logger()

	options, err := DefaultOrbitDBOptions(g, options, s.keyStore, storeType, groupOpenMode)
	if err != nil {
		return nil, err
	}

	l.Debug("Opening store", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Group", Description: g.String()}, {Name: "Options", Description: fmt.Sprint(options)}}, tyber.Status(tyber.Running))...)

	options.StoreType = &storeType
	name := fmt.Sprintf("%s_%s", g.GroupIDAsString(), storeType)

	addr, err := o.DetermineAddress(ctx, name, storeType, &orbitdb.DetermineAddressOptions{AccessController: options.AccessController})
	if err != nil {
		return nil, err
	}

	linkKey, err := cryptoutil.GetLinkKeyArray(g)
	if err != nil {
		return nil, err
	}

	if key := linkKey[:]; len(key) > 0 {
		sk, err := enc.NewSecretbox(key)
		if err != nil {
			return nil, err
		}

		cborIO := io.CBOR()
		cborIO.ApplyOptions(&io.CBOROptions{LinkKey: sk})
		options.IO = cborIO

		s.messageMarshaler.RegisterSharedKeyForTopic(addr.String(), sk)
		s.rotationInterval.RegisterRotation(time.Now(), addr.String(), key)
	}

	options.EventBus = eventbus.NewBus()
	store, err := o.Open(ctx, name, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	l.Debug("Loading store", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Group", Description: g.String()}, {Name: "StoreType", Description: store.Type()}, {Name: "Store", Description: store.Address().String()}}, tyber.Status(tyber.Running))...)

	_ = store.Load(ctx, -1)

	l.Debug("Loaded store", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Group", Description: g.String()}})...)

	return store, nil
}

func (s *BertyOrbitDB) groupMetadataStore(ctx context.Context, g *protocoltypes.Group, options *orbitdb.CreateDBOptions) (*MetadataStore, error) {
	l := s.Logger()
	l.Debug("Opening group metadata store", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Group", Description: g.String()}, {Name: "Options", Description: fmt.Sprint(options)}}, tyber.Status(tyber.Running))...)

	store, err := s.storeForGroup(ctx, s, g, options, groupMetadataStoreType, GroupOpenModeWrite)
	if err != nil {
		return nil, tyber.LogFatalError(ctx, l, "Failed to get group store", errors.Wrap(err, "unable to open database"))
	}

	l.Debug("Got group store", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "DBName", Description: store.DBName()}})...)

	sStore, ok := store.(*MetadataStore)
	if !ok {
		return nil, tyber.LogFatalError(ctx, l, "Failed to cast group store", errors.New("unable to cast store to metadata store"))
	}

	l.Debug("Opened group metadata store", tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Group", Description: g.String()}})...)

	return sStore, nil
}

func (s *BertyOrbitDB) groupMessageStore(ctx context.Context, g *protocoltypes.Group, options *orbitdb.CreateDBOptions) (*MessageStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, groupMessageStoreType, GroupOpenModeWrite)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	mStore, ok := store.(*MessageStore)
	if !ok {
		return nil, errors.New("unable to cast store to message store")
	}

	return mStore, nil
}

func (s *BertyOrbitDB) getGroupFromOptions(options *iface.NewStoreOptions) (*protocoltypes.Group, error) {
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

	typed, ok := g.(*protocoltypes.Group)
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	return typed, nil
}

func (s *BertyOrbitDB) IsGroupLoaded(groupID string) bool {
	gc, ok := s.groups.Load(groupID)

	return ok && gc != nil
}
