package bertyprotocol

import (
	"context"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
)

const (
	identityGroupIDKey = "group_id"
	storeTypeKey       = "store_type"
	identityType       = "betry_group_entry"
)

type bertySignedIdentityProvider struct {
	keyStore *BertySignedKeyStore
}

func (b *bertySignedIdentityProvider) UnmarshalPublicKey(data []byte) (crypto.PubKey, error) {
	return crypto.UnmarshalPublicKey(data)
}

func (b *bertySignedIdentityProvider) GetID(ctx context.Context, opts *identityprovider.CreateIdentityOptions) (string, error) {
	return opts.ID, nil
}

func (b *bertySignedIdentityProvider) SignIdentity(ctx context.Context, data []byte, id string) ([]byte, error) {
	return nil, nil
}

func (b *bertySignedIdentityProvider) GetType() string {
	return identityType
}

func (b *bertySignedIdentityProvider) VerifyIdentity(identity *identityprovider.Identity) error {
	return nil
}

func (b *bertySignedIdentityProvider) Sign(ctx context.Context, identity *identityprovider.Identity, bytes []byte) ([]byte, error) {
	key, err := b.keyStore.GetKey(ctx, identity.ID)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	sig, err := key.Sign(bytes)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return sig, nil
}

func (b *bertySignedIdentityProvider) signID(ctx context.Context, id string) (crypto.PubKey, []byte, error) {
	privKey, err := b.keyStore.GetKey(ctx, id)
	if err != nil {
		return nil, nil, err
	}

	idSignature, err := b.keyStore.Sign(privKey, []byte(id))
	if err != nil {
		return nil, nil, err
	}

	return privKey.GetPublic(), idSignature, nil
}

func (b *bertySignedIdentityProvider) createIdentity(ctx context.Context, options *identityprovider.CreateIdentityOptions) (*identityprovider.Identity, error) {
	id, err := b.GetID(ctx, options)
	if err != nil {
		return nil, err
	}

	publicKey, idSignature, err := b.signID(ctx, id)
	if err != nil {
		return nil, err
	}

	publicKeyRaw, err := publicKey.Raw()
	if err != nil {
		return nil, err
	}

	publicKeyBytes, err := crypto.MarshalPublicKey(publicKey)
	if err != nil {
		return nil, err
	}

	pubKeyIDSignature, err := b.SignIdentity(ctx, append(publicKeyRaw, idSignature...), options.ID)
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

var _ identityprovider.Interface = (*bertySignedIdentityProvider)(nil)
