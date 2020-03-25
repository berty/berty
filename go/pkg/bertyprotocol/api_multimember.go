package bertyprotocol

import (
	"context"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
)

// MultiMemberGroupCreate creates a new MultiMember group
func (c *client) MultiMemberGroupCreate(ctx context.Context, req *MultiMemberGroupCreate_Request) (*MultiMemberGroupCreate_Reply, error) {
	g, sk, err := NewGroupMultiMember()
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	_, err = c.accContextGroup.MetadataStore().GroupJoin(ctx, g)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	c.lock.Lock()
	c.groups[string(g.PublicKey)] = g
	c.lock.Unlock()

	_, err = c.activateGroup(ctx, sk.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to activate group: %w", err))
	}

	cg, err := c.getContextGroupForID(g.PublicKey)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, err = cg.MetadataStore().ClaimGroupOwnership(ctx, sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &MultiMemberGroupCreate_Reply{
		GroupPK: g.PublicKey,
	}, nil
}

// MultiMemberGroupJoin joins an existing MultiMember group using an invitation
func (c *client) MultiMemberGroupJoin(ctx context.Context, req *MultiMemberGroupJoin_Request) (*MultiMemberGroupJoin_Reply, error) {
	_, err := c.accContextGroup.MetadataStore().GroupJoin(ctx, req.Group)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &MultiMemberGroupJoin_Reply{}, nil
}

// MultiMemberGroupLeave leaves a previously joined MultiMember group
func (c *client) MultiMemberGroupLeave(ctx context.Context, req *MultiMemberGroupLeave_Request) (*MultiMemberGroupLeave_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	_, err = c.accContextGroup.MetadataStore().GroupLeave(ctx, pk)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_ = c.deactivateGroup(pk)

	return &MultiMemberGroupLeave_Reply{}, nil
}

// MultiMemberGroupAliasResolverDisclose sends an account identity proof to the group members
func (c *client) MultiMemberGroupAliasResolverDisclose(ctx context.Context, req *MultiMemberGroupAliasResolverDisclose_Request) (*MultiMemberGroupAliasResolverDisclose_Reply, error) {
	cg, err := c.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	_, err = cg.MetadataStore().SendAliasProof(ctx)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &MultiMemberGroupAliasResolverDisclose_Reply{}, nil
}

// MultiMemberGroupAdminRoleGrant grants admin role to another member of the group
func (c *client) MultiMemberGroupAdminRoleGrant(context.Context, *MultiMemberGroupAdminRoleGrant_Request) (*MultiMemberGroupAdminRoleGrant_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupInvitationCreate creates a group invitation
func (c *client) MultiMemberGroupInvitationCreate(ctx context.Context, req *MultiMemberGroupInvitationCreate_Request) (*MultiMemberGroupInvitationCreate_Reply, error) {
	cg, err := c.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	return &MultiMemberGroupInvitationCreate_Reply{
		Group: cg.Group(),
	}, nil
}
