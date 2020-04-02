package bertyprotocol

import (
	"context"
	"fmt"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

// MultiMemberGroupCreate creates a new MultiMember group
func (s *service) MultiMemberGroupCreate(ctx context.Context, req *bertytypes.MultiMemberGroupCreate_Request) (*bertytypes.MultiMemberGroupCreate_Reply, error) {
	g, sk, err := NewGroupMultiMember()
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	_, err = s.accountGroup.MetadataStore().GroupJoin(ctx, g)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	s.lock.Lock()
	s.groups[string(g.PublicKey)] = g
	s.lock.Unlock()

	err = s.activateGroup(sk.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to activate group: %w", err))
	}

	cg, err := s.getContextGroupForID(g.PublicKey)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, err = cg.MetadataStore().ClaimGroupOwnership(ctx, sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.MultiMemberGroupCreate_Reply{
		GroupPK: g.PublicKey,
	}, nil
}

// MultiMemberGroupJoin joins an existing MultiMember group using an invitation
func (s *service) MultiMemberGroupJoin(ctx context.Context, req *bertytypes.MultiMemberGroupJoin_Request) (*bertytypes.MultiMemberGroupJoin_Reply, error) {
	_, err := s.accountGroup.MetadataStore().GroupJoin(ctx, req.Group)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.MultiMemberGroupJoin_Reply{}, nil
}

// MultiMemberGroupLeave leaves a previously joined MultiMember group
func (s *service) MultiMemberGroupLeave(ctx context.Context, req *bertytypes.MultiMemberGroupLeave_Request) (*bertytypes.MultiMemberGroupLeave_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	_, err = s.accountGroup.MetadataStore().GroupLeave(ctx, pk)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_ = s.deactivateGroup(pk)

	return &bertytypes.MultiMemberGroupLeave_Reply{}, nil
}

// MultiMemberGroupAliasResolverDisclose sends an deviceKeystore identity proof to the group members
func (s *service) MultiMemberGroupAliasResolverDisclose(ctx context.Context, req *bertytypes.MultiMemberGroupAliasResolverDisclose_Request) (*bertytypes.MultiMemberGroupAliasResolverDisclose_Reply, error) {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	_, err = cg.MetadataStore().SendAliasProof(ctx)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.MultiMemberGroupAliasResolverDisclose_Reply{}, nil
}

// MultiMemberGroupAdminRoleGrant grants admin role to another member of the group
func (s *service) MultiMemberGroupAdminRoleGrant(context.Context, *bertytypes.MultiMemberGroupAdminRoleGrant_Request) (*bertytypes.MultiMemberGroupAdminRoleGrant_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupInvitationCreate creates a group invitation
func (s *service) MultiMemberGroupInvitationCreate(ctx context.Context, req *bertytypes.MultiMemberGroupInvitationCreate_Request) (*bertytypes.MultiMemberGroupInvitationCreate_Reply, error) {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	return &bertytypes.MultiMemberGroupInvitationCreate_Reply{
		Group: cg.Group(),
	}, nil
}
