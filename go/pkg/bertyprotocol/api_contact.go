package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (c *client) ContactAliasKeySend(ctx context.Context, req *ContactAliasKeySend_Request) (*ContactAliasKeySend_Reply, error) {
	g, err := c.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrMissingGroup.Wrap(err)
	}

	if _, err := g.MetadataStore().ContactSendAliasKey(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &ContactAliasKeySend_Reply{}, nil
}

func (c *client) ContactBlock(ctx context.Context, req *ContactBlock_Request) (*ContactBlock_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactBlock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &ContactBlock_Reply{}, nil
}

func (c *client) ContactUnblock(ctx context.Context, req *ContactUnblock_Request) (*ContactUnblock_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactUnblock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &ContactUnblock_Reply{}, nil
}
