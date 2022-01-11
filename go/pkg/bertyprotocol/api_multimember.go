package bertyprotocol

import (
	"context"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

// MultiMemberGroupCreate creates a new MultiMember group
func (s *service) MultiMemberGroupCreate(ctx context.Context, req *protocoltypes.MultiMemberGroupCreate_Request) (_ *protocoltypes.MultiMemberGroupCreate_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Creating MultiMember group")
	defer func() { endSection(err, "") }()

	g, sk, err := NewGroupMultiMember()
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	_, err = s.accountGroup.MetadataStore().GroupJoin(ctx, g)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	if err := s.groupDatastore.Put(ctx, g); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	err = s.activateGroup(ctx, sk.GetPublic(), false)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to activate group: %w", err))
	}

	cg, err := s.GetContextGroupForID(g.PublicKey)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, err = cg.MetadataStore().ClaimGroupOwnership(ctx, sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.MultiMemberGroupCreate_Reply{
		GroupPK: g.PublicKey,
	}, nil
}

// MultiMemberGroupJoin joins an existing MultiMember group using an invitation
func (s *service) MultiMemberGroupJoin(ctx context.Context, req *protocoltypes.MultiMemberGroupJoin_Request) (_ *protocoltypes.MultiMemberGroupJoin_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Joining MultiMember group")
	defer func() { endSection(err, "") }()

	if _, err := s.accountGroup.MetadataStore().GroupJoin(ctx, req.Group); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.MultiMemberGroupJoin_Reply{}, nil
}

// MultiMemberGroupLeave leaves a previously joined MultiMember group
func (s *service) MultiMemberGroupLeave(ctx context.Context, req *protocoltypes.MultiMemberGroupLeave_Request) (_ *protocoltypes.MultiMemberGroupLeave_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "Leaving MultiMember group")
	defer func() { endSection(err, "") }()

	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	_, err = s.accountGroup.MetadataStore().GroupLeave(ctx, pk)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_ = s.deactivateGroup(pk)

	return &protocoltypes.MultiMemberGroupLeave_Reply{}, nil
}

// MultiMemberGroupAliasResolverDisclose sends an deviceKeystore identity proof to the group members
func (s *service) MultiMemberGroupAliasResolverDisclose(ctx context.Context, req *protocoltypes.MultiMemberGroupAliasResolverDisclose_Request) (*protocoltypes.MultiMemberGroupAliasResolverDisclose_Reply, error) {
	cg, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	_, err = cg.MetadataStore().SendAliasProof(ctx)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.MultiMemberGroupAliasResolverDisclose_Reply{}, nil
}

// MultiMemberGroupAdminRoleGrant grants admin role to another member of the group
func (s *service) MultiMemberGroupAdminRoleGrant(context.Context, *protocoltypes.MultiMemberGroupAdminRoleGrant_Request) (*protocoltypes.MultiMemberGroupAdminRoleGrant_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupInvitationCreate creates a group invitation
func (s *service) MultiMemberGroupInvitationCreate(ctx context.Context, req *protocoltypes.MultiMemberGroupInvitationCreate_Request) (*protocoltypes.MultiMemberGroupInvitationCreate_Reply, error) {
	cg, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	return &protocoltypes.MultiMemberGroupInvitationCreate_Reply{
		Group: cg.Group(),
	}, nil
}
