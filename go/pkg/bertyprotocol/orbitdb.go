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
	peer "github.com/libp2p/go-libp2p-core/peer"
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

	if n.Logger == nil {
		n.Logger = zap.NewNop()
	}
	n.Logger = n.Logger.Named("odb")
}

type (
	GroupMap           = sync.Map
	GroupContextMap    = sync.Map
	GroupsSigPubKeyMap = sync.Map
)

type BertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	keyStore         *BertySignedKeyStore
	messageKeystore  *cryptoutil.MessageKeystore
	deviceKeystore   cryptoutil.DeviceKeystore
	pubSub           iface.PubSubInterface
	rotationInterval *rendezvous.RotationInterval
	messageMarshaler *OrbitDBMessageMarshaler

	ctx context.Context
	// FIXME(gfanton): use real map instead of sync.Map
	groups          *GroupMap           // map[string]*protocoltypes.Group
	groupContexts   *GroupContextMap    // map[string]*GroupContext
	groupsSigPubKey *GroupsSigPubKeyMap // map[string]crypto.PubKey
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

	ks := &BertySignedKeyStore{}
	options.Keystore = ks
	options.Identity = &identityprovider.Identity{}

	self, err := ipfs.Key().Self(ctx)
	if err != nil {
		return nil, err
	}

	if options.PubSub == nil {
		options.PubSub = pubsubcoreapi.NewPubSub(ipfs, self.ID(), time.Second, options.Logger, options.Tracer)
	}

	mm := NewOrbitDBMessageMarshaler(self.ID(), options.DeviceKeystore, options.RotationInterval)
	options.MessageMarshaler = mm

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, &options.NewOrbitDBOptions)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &BertyOrbitDB{
		ctx:              ctx,
		messageMarshaler: mm,
		BaseOrbitDB:      orbitDB,
		keyStore:         ks,
		deviceKeystore:   options.DeviceKeystore,
		messageKeystore:  options.MessageKeystore,
		rotationInterval: options.RotationInterval,
		pubSub:           options.PubSub,
		groups:           &GroupMap{},
		groupContexts:    &GroupContextMap{},    // map[string]*GroupContext
		groupsSigPubKey:  &GroupsSigPubKeyMap{}, // map[string]crypto.PubKey
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

	gc, err := s.OpenGroup(g, options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	l.Debug("Opened account group", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	if err := ActivateGroupContext(ctx, gc, nil); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	l.Debug("Account group context activated", tyber.FormatStepLogFields(ctx, []tyber.Detail{})...)

	TagGroupContextPeers(ctx, l, gc, ipfsCoreAPI, 84)

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

func (s *BertyOrbitDB) OpenGroup(g *protocoltypes.Group, options *orbitdb.CreateDBOptions) (*GroupContext, error) {
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

	s.Logger().Debug("OpenGroup", tyber.FormatStepLogFields(s.ctx, tyber.ZapFieldsToDetails(zap.Any("public key", g.PublicKey), zap.Any("secret", g.Secret), zap.Stringer("type", g.GroupType)))...)

	memberDevice, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	mpkb, err := crypto.MarshalPublicKey(memberDevice.Public().Member)
	if err != nil {
		mpkb = []byte{}
	}
	s.Logger().Debug("Got member device", tyber.FormatStepLogFields(s.ctx, []tyber.Detail{{Name: "DevicePublicKey", Description: base64.RawURLEncoding.EncodeToString(mpkb)}})...)

	// Force secret generation if missing
	if _, err := s.messageKeystore.GetDeviceSecret(s.ctx, g, s.deviceKeystore); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	s.Logger().Debug("Got device secret", tyber.FormatStepLogFields(s.ctx, []tyber.Detail{})...)

	metaImpl, err := s.groupMetadataStore(s.ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}
	s.messageMarshaler.RegisterGroup(metaImpl.Address().String(), g)

	s.Logger().Debug("Got metadata store", tyber.FormatStepLogFields(s.ctx, []tyber.Detail{})...)

	messagesImpl, err := s.groupMessageStore(s.ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}
	s.messageMarshaler.RegisterGroup(messagesImpl.Address().String(), g)

	s.Logger().Debug("Got message store", tyber.FormatStepLogFields(s.ctx, []tyber.Detail{})...)

	gc := NewContextGroup(g, metaImpl, messagesImpl, s.messageKeystore, memberDevice, s.Logger())

	s.Logger().Debug("Created group context", tyber.FormatStepLogFields(s.ctx, []tyber.Detail{})...)

	s.groupContexts.Store(groupID, gc)

	s.Logger().Debug("Stored group context", tyber.FormatStepLogFields(s.ctx, []tyber.Detail{})...)

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

	gc, ok := g.(*GroupContext)
	if !ok {
		s.groupContexts.Delete(id)
		return nil, errors.New("cannot cast object to GroupContext")
	}

	if gc.IsClosed() {
		s.groupContexts.Delete(id)
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

	s.messageMarshaler.RegisterGroup(addr.String(), g)

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

		l.Debug("opening store: register rotation", zap.String("topic", addr.String()))

		s.messageMarshaler.RegisterSharedKeyForTopic(addr.String(), sk)
		s.rotationInterval.RegisterRotation(time.Now(), addr.String(), key)
	}

	options.EventBus = eventbus.NewBus()

	// @FIXME(d4ryl00): the given context is not the one of the group but one with
	// a longer time life because go-orbitdb doesn't close correctly the group
	// and that can lead of bugs when you close/open the same group.
	store, err := o.Open(s.ctx, name, options)
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

func (s *BertyOrbitDB) GetDevicePKForPeerID(id peer.ID) (pdg *PeerDeviceGroup, ok bool) {
	return s.messageMarshaler.GetDevicePKForPeerID(id)
}
