package cryptoutil

import (
	"context"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"

	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"

	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const NamespaceGroupDatastore = "account_groups_datastore"

type GroupDatastore struct {
	store datastore.Datastore
}

type GroupDatastoreReadOnly interface {
	Has(ctx context.Context, key crypto.PubKey) (bool, error)
	Get(ctx context.Context, key crypto.PubKey) (*protocoltypes.Group, error)
}

func (gd *GroupDatastore) key(key []byte) datastore.Key {
	return datastore.NewKey(base64.RawURLEncoding.EncodeToString(key))
}

func (gd *GroupDatastore) Has(ctx context.Context, key crypto.PubKey) (bool, error) {
	keyBytes, err := key.Raw()
	if err != nil {
		return false, errcode.ErrSerialization.Wrap(err)
	}

	return gd.store.Has(ctx, gd.key(keyBytes))
}

func (gd *GroupDatastore) Get(ctx context.Context, key crypto.PubKey) (*protocoltypes.Group, error) {
	keyBytes, err := key.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	data, err := gd.store.Get(ctx, gd.key(keyBytes))
	if err != nil {
		return nil, errcode.ErrMissingMapKey.Wrap(err)
	}

	g := &protocoltypes.Group{}
	if err := g.Unmarshal(data); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	return g, nil
}

func (gd *GroupDatastore) Put(ctx context.Context, g *protocoltypes.Group) error {
	pk, err := g.GetPubKey()
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if ok, err := gd.Has(ctx, pk); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	} else if ok {
		return nil
	}

	data, err := g.Marshal()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	if err := gd.store.Put(ctx, gd.key(g.PublicKey), data); err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}

	return nil
}

func (gd *GroupDatastore) Delete(ctx context.Context, pk crypto.PubKey) error {
	pkBytes, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	return gd.store.Delete(ctx, gd.key(pkBytes))
}

func (gd *GroupDatastore) PutForContactPK(ctx context.Context, pk crypto.PubKey, deviceKeystore DeviceKeystore) error {
	if deviceKeystore == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing device keystore"))
	}

	sk, err := deviceKeystore.ContactGroupPrivKey(pk)
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	g, err := GetGroupForContact(sk)
	if err != nil {
		return errcode.ErrOrbitDBOpen.Wrap(err)
	}

	if err := gd.Put(ctx, g); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func NewGroupDatastore(ds datastore.Datastore) (*GroupDatastore, error) {
	if ds == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("a datastore is expected"))
	}

	return &GroupDatastore{
		store: datastoreutil.NewNamespacedDatastore(ds, datastore.NewKey(NamespaceGroupDatastore)),
	}, nil
}

func GetGroupForContact(contactPairSK crypto.PrivKey) (*protocoltypes.Group, error) {
	groupSK, groupSecretSK, err := GetKeysForGroupOfContact(contactPairSK)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}
	pubBytes, err := groupSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	signingBytes, err := SeedFromEd25519PrivateKey(groupSecretSK)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &protocoltypes.Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: nil,
		GroupType: protocoltypes.GroupTypeContact,
	}, nil
}

func GetGroupForAccount(priv, signing crypto.PrivKey) (*protocoltypes.Group, error) {
	pubBytes, err := priv.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	signingBytes, err := SeedFromEd25519PrivateKey(signing)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &protocoltypes.Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: nil,
		GroupType: protocoltypes.GroupTypeAccount,
	}, nil
}

func GetKeysForGroupOfContact(contactPairSK crypto.PrivKey) (crypto.PrivKey, crypto.PrivKey, error) {
	// Salt length must be equal to hash length (64 bytes for sha256)
	hash := sha256.New

	ck, err := contactPairSK.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	// Generate Pseudo Random Key using ck as IKM and salt
	prk := hkdf.Extract(hash, ck, nil)
	if len(prk) == 0 {
		return nil, nil, errcode.ErrInternal
	}

	// Expand using extracted prk and groupID as info (kind of namespace)
	kdf := hkdf.Expand(hash, prk, nil)

	// Generate next KDF and message keys
	groupSeed, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	groupSecretSeed, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	sk1 := ed25519.NewKeyFromSeed(groupSeed)
	groupSK, _, err := crypto.KeyPairFromStdKey(&sk1)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	sk2 := ed25519.NewKeyFromSeed(groupSecretSeed)
	groupSecretSK, _, err := crypto.KeyPairFromStdKey(&sk2)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return groupSK, groupSecretSK, nil
}
