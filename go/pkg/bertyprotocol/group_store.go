package bertyprotocol

import (
	"encoding/base64"
	"fmt"

	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type GroupDatastore struct {
	store datastore.Datastore
}

type GroupDatastoreReadOnly interface {
	Has(key crypto.PubKey) (bool, error)
	Get(key crypto.PubKey) (*protocoltypes.Group, error)
}

func (gd *GroupDatastore) key(key []byte) datastore.Key {
	return datastore.NewKey(base64.RawURLEncoding.EncodeToString(key))
}

func (gd *GroupDatastore) Has(key crypto.PubKey) (bool, error) {
	keyBytes, err := key.Raw()
	if err != nil {
		return false, errcode.ErrSerialization.Wrap(err)
	}

	return gd.store.Has(gd.key(keyBytes))
}

func (gd *GroupDatastore) Get(key crypto.PubKey) (*protocoltypes.Group, error) {
	keyBytes, err := key.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	data, err := gd.store.Get(gd.key(keyBytes))
	if err != nil {
		return nil, errcode.ErrMissingMapKey.Wrap(err)
	}

	g := &protocoltypes.Group{}
	if err := g.Unmarshal(data); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	return g, nil
}

func (gd *GroupDatastore) Put(g *protocoltypes.Group) error {
	pk, err := g.GetPubKey()
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if ok, err := gd.Has(pk); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	} else if ok {
		return nil
	}

	data, err := g.Marshal()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	if err := gd.store.Put(gd.key(g.PublicKey), data); err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}

	return nil
}

func (gd *GroupDatastore) Delete(pk crypto.PubKey) error {
	pkBytes, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	return gd.store.Delete(gd.key(pkBytes))
}

func (gd *GroupDatastore) reindex(m *metadataStore, deviceKeystore DeviceKeystore) error {
	if deviceKeystore == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing device keystore"))
	}

	for _, g := range m.ListMultiMemberGroups() {
		if err := gd.Put(g); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	for _, contact := range m.ListContactsByStatus(
		protocoltypes.ContactStateToRequest,
		protocoltypes.ContactStateReceived,
		protocoltypes.ContactStateAdded,
		protocoltypes.ContactStateRemoved,
		protocoltypes.ContactStateDiscarded,
		protocoltypes.ContactStateBlocked,
	) {
		cPK, err := contact.GetPubKey()
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		if err := gd.PutForContactPK(cPK, deviceKeystore); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}

func (gd *GroupDatastore) PutForContactPK(pk crypto.PubKey, deviceKeystore DeviceKeystore) error {
	if deviceKeystore == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing device keystore"))
	}

	sk, err := deviceKeystore.ContactGroupPrivKey(pk)
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	g, err := getGroupForContact(sk)
	if err != nil {
		return errcode.ErrOrbitDBOpen.Wrap(err)
	}

	if err := gd.Put(g); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func NewGroupDatastore(ds datastore.Datastore) (*GroupDatastore, error) {
	if ds == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a datastore is expected"))
	}

	return &GroupDatastore{
		store: ipfsutil.NewNamespacedDatastore(ds, datastore.NewKey(NamespaceGroupDatastore)),
	}, nil
}
