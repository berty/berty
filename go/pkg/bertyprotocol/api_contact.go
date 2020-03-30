package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (s *service) ContactAliasKeySend(ctx context.Context, req *bertytypes.ContactAliasKeySend_Request) (*bertytypes.ContactAliasKeySend_Reply, error) {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	if _, err := g.MetadataStore().ContactSendAliasKey(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactAliasKeySend_Reply{}, nil
}

func (s *service) ContactBlock(ctx context.Context, req *bertytypes.ContactBlock_Request) (*bertytypes.ContactBlock_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactBlock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactBlock_Reply{}, nil
}

func (s *service) ContactUnblock(ctx context.Context, req *bertytypes.ContactUnblock_Request) (*bertytypes.ContactUnblock_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactUnblock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactUnblock_Reply{}, nil
}
