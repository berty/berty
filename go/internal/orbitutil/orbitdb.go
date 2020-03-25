package orbitutil

import (
	"context"
	"fmt"
	"sync"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/baseorbitdb"
	"berty.tech/go-orbit-db/iface"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

type bertyOrbitDB struct {
	baseorbitdb.BaseOrbitDB
	groups          sync.Map // map[string]*bertyprotocol.Group
	groupContexts   sync.Map // map[string]*contextGroup
	groupsSigPubKey sync.Map // map[string]crypto.PubKey
	keyStore        *BertySignedKeyStore
	mk              bertyprotocol.MessageKeys
	account         bertyprotocol.AccountKeys
}

func (s *bertyOrbitDB) GetContactGroup(pk crypto.PubKey) (*bertyprotocol.Group, error) {
	sk, err := s.account.ContactGroupPrivKey(pk)
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return bertyprotocol.GetGroupForContact(sk)
}

func (s *bertyOrbitDB) registerGroupPrivateKey(g *bertyprotocol.Group) error {
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

func NewBertyOrbitDB(ctx context.Context, ipfs coreapi.CoreAPI, acc bertyprotocol.AccountKeys, mk bertyprotocol.MessageKeys, options *baseorbitdb.NewOrbitDBOptions) (bertyprotocol.BertyOrbitDB, error) {
	var err error

	if options == nil {
		options = &baseorbitdb.NewOrbitDBOptions{}
	}

	ks := &BertySignedKeyStore{}
	options.Keystore = ks
	options.Identity = &identityprovider.Identity{}

	orbitDB, err := baseorbitdb.NewOrbitDB(ctx, ipfs, options)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	bertyDB := &bertyOrbitDB{
		BaseOrbitDB: orbitDB,
		keyStore:    ks,
		account:     acc,
		mk:          mk,
	}

	if err := bertyDB.RegisterAccessControllerType(NewSimpleAccessController); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	bertyDB.RegisterStoreType(GroupMetadataStoreType, ConstructorFactoryGroupMetadata(bertyDB))
	bertyDB.RegisterStoreType(GroupMessageStoreType, ConstructorFactoryGroupMessage(bertyDB))

	return bertyDB, nil
}

func (s *bertyOrbitDB) OpenAccountGroup(ctx context.Context, options *orbitdb.CreateDBOptions) (bertyprotocol.ContextGroup, error) {
	sk, err := s.account.AccountPrivKey()
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	skProof, err := s.account.AccountProofPrivKey()
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	g, err := bertyprotocol.GetGroupForAccount(sk, skProof)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	return s.OpenGroup(ctx, g, options)
}

func (s *bertyOrbitDB) OpenGroup(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (bertyprotocol.ContextGroup, error) {
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

	memberDevice, err := s.account.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	// Force secret generation if missing
	if _, err := bertyprotocol.GetDeviceSecret(ctx, g, s.mk, s.account); err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	metadataStore, err := s.GroupMetadataStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	metaImpl, ok := metadataStore.(*MetadataStoreImpl)
	if !ok {
		return nil, errcode.ErrOrbitDBStoreCast
	}

	messageStore, err := s.GroupMessageStore(ctx, g, options)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	messagesImpl, ok := messageStore.(*MessageStoreImpl)
	if !ok {
		return nil, errcode.ErrOrbitDBStoreCast
	}

	gc := NewContextGroup(g, metaImpl, messagesImpl, s.mk, memberDevice)
	s.groupContexts.Store(groupID, gc)

	return gc, nil
}

func (s *bertyOrbitDB) getGroupContext(id string) (*contextGroup, error) {
	g, ok := s.groupContexts.Load(id)
	if !ok {
		return nil, errcode.ErrMissingMapKey
	}

	return g.(*contextGroup), nil
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

func (s *bertyOrbitDB) storeForGroup(ctx context.Context, o iface.BaseOrbitDB, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions, storeType string) (iface.Store, error) {
	options, err := DefaultOptions(g, options, s.keyStore, storeType)
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

func (s *bertyOrbitDB) GroupMetadataStore(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (bertyprotocol.MetadataStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, GroupMetadataStoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	sStore, ok := store.(*MetadataStoreImpl)
	if !ok {
		return nil, errors.New("unable to cast store to metadata store")
	}

	return sStore, nil
}

func (s *bertyOrbitDB) GroupMessageStore(ctx context.Context, g *bertyprotocol.Group, options *orbitdb.CreateDBOptions) (bertyprotocol.MessageStore, error) {
	store, err := s.storeForGroup(ctx, s, g, options, GroupMessageStoreType)
	if err != nil {
		return nil, errors.Wrap(err, "unable to open database")
	}

	mStore, ok := store.(*MessageStoreImpl)
	if !ok {
		return nil, errors.New("unable to cast store to message store")
	}

	return mStore, nil
}

func (s *bertyOrbitDB) getGroupFromOptions(options *iface.NewStoreOptions) (*bertyprotocol.Group, error) {
	groupIDs, err := options.AccessController.GetAuthorizedByRole(IdentityGroupIDKey)
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

	typed, ok := g.(*bertyprotocol.Group)
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	return typed, nil
}

var _ bertyprotocol.BertyOrbitDB = (*bertyOrbitDB)(nil)
