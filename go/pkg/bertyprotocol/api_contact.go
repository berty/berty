package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (c *client) ContactAliasKeySend(ctx context.Context, req *bertytypes.ContactAliasKeySend_Request) (*bertytypes.ContactAliasKeySend_Reply, error) {
	g, err := c.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrMissingGroup.Wrap(err)
	}

	if _, err := g.MetadataStore().ContactSendAliasKey(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactAliasKeySend_Reply{}, nil
}

func (c *client) ContactBlock(ctx context.Context, req *bertytypes.ContactBlock_Request) (*bertytypes.ContactBlock_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactBlock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactBlock_Reply{}, nil
}

func (c *client) ContactUnblock(ctx context.Context, req *bertytypes.ContactUnblock_Request) (*bertytypes.ContactUnblock_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactUnblock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactUnblock_Reply{}, nil
}
