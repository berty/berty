package orbitutil

import (
	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

const IdentityType = "betry_group_entry"

type bertySignedIdentityProvider struct {
	keyStore *BertySignedKeyStore
}

func (b *bertySignedIdentityProvider) UnmarshalPublicKey(data []byte) (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(data)
}

func (b *bertySignedIdentityProvider) GetID(opts *identityprovider.CreateIdentityOptions) (string, error) {
	return opts.ID, nil
}

func (b *bertySignedIdentityProvider) SignIdentity(data []byte, id string) ([]byte, error) {
	return nil, nil
}

func (b *bertySignedIdentityProvider) GetType() string {
	return IdentityType
}

func (b *bertySignedIdentityProvider) VerifyIdentity(identity *identityprovider.Identity) error {
	return nil
}

func (b *bertySignedIdentityProvider) Sign(identity *identityprovider.Identity, bytes []byte) ([]byte, error) {
	key, err := b.keyStore.GetKey(identity.ID)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	sig, err := key.Sign(bytes)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return sig, nil
}

func NewBertySignedIdentityProviderFactory(ks *BertySignedKeyStore) func(options *identityprovider.CreateIdentityOptions) identityprovider.Interface {
	return func(options *identityprovider.CreateIdentityOptions) identityprovider.Interface {
		return &bertySignedIdentityProvider{
			keyStore: ks,
		}
	}
}

var _ identityprovider.Interface = (*bertySignedIdentityProvider)(nil)
