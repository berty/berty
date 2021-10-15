package bertyprotocol

import (
	"context"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) ContactAliasKeySend(ctx context.Context, req *protocoltypes.ContactAliasKeySend_Request) (_ *protocoltypes.ContactAliasKeySend_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Sending contact alias key")
	defer func() { endSection(err, "") }()

	g, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	if _, err := g.MetadataStore().ContactSendAliasKey(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.ContactAliasKeySend_Reply{}, nil
}

func (s *service) ContactBlock(ctx context.Context, req *protocoltypes.ContactBlock_Request) (_ *protocoltypes.ContactBlock_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Blocking contact")
	defer func() { endSection(err, "") }()

	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactBlock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.ContactBlock_Reply{}, nil
}

func (s *service) ContactUnblock(ctx context.Context, req *protocoltypes.ContactUnblock_Request) (_ *protocoltypes.ContactUnblock_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Unblocking contact")
	defer func() { endSection(err, "") }()

	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactUnblock(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.ContactUnblock_Reply{}, nil
}
