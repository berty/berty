package orbitutil

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	"github.com/libp2p/go-libp2p-core/crypto"
)

const IdentityGroupIDKey = "group_id"
const StoreTypeKey = "store_type"
const IdentityType = "betry_group_entry"

type BertySignedIdentityProvider struct {
	keyStore *BertySignedKeyStore
}

func (b *BertySignedIdentityProvider) UnmarshalPublicKey(data []byte) (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(data)
}

func (b *BertySignedIdentityProvider) GetID(opts *identityprovider.CreateIdentityOptions) (string, error) {
	return opts.ID, nil
}

func (b *BertySignedIdentityProvider) SignIdentity(data []byte, id string) ([]byte, error) {
	return nil, nil
}

func (b *BertySignedIdentityProvider) GetType() string {
	return IdentityType
}

func (b *BertySignedIdentityProvider) VerifyIdentity(identity *identityprovider.Identity) error {
	return nil
}

func (b *BertySignedIdentityProvider) Sign(identity *identityprovider.Identity, bytes []byte) ([]byte, error) {
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

func (b *BertySignedIdentityProvider) signID(id string) (crypto.PubKey, []byte, error) {
	privKey, err := b.keyStore.GetKey(id)
	if err != nil {
		return nil, nil, err
	}

	idSignature, err := b.keyStore.Sign(privKey, []byte(id))
	if err != nil {
		return nil, nil, err
	}

	return privKey.GetPublic(), idSignature, nil
}

func (b *BertySignedIdentityProvider) CreateIdentity(options *identityprovider.CreateIdentityOptions) (*identityprovider.Identity, error) {
	id, err := b.GetID(options)
	if err != nil {
		return nil, err
	}

	publicKey, idSignature, err := b.signID(id)
	if err != nil {
		return nil, err
	}

	publicKeyBytes, err := publicKey.Raw()
	if err != nil {
		return nil, err
	}

	pubKeyIDSignature, err := b.SignIdentity(append(publicKeyBytes, idSignature...), options.ID)
	if err != nil {
		return nil, err
	}

	return &identityprovider.Identity{
		ID:        id,
		PublicKey: publicKeyBytes,
		Signatures: &identityprovider.IdentitySignature{
			ID:        idSignature,
			PublicKey: pubKeyIDSignature,
		},
		Type:     b.GetType(),
		Provider: b,
	}, nil
}

var _ identityprovider.Interface = (*BertySignedIdentityProvider)(nil)
