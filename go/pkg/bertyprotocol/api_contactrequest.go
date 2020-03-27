package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

// ContactRequestReference retrieves the necessary information to create a contact link
func (c *client) ContactRequestReference(context.Context, *bertytypes.ContactRequestReference_Request) (*bertytypes.ContactRequestReference_Reply, error) {
	enabled, shareableContact := c.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	ref := []byte(nil)

	if shareableContact != nil {
		var err error

		shareableContact.Metadata = nil
		ref, err = shareableContact.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}
	}

	return &bertytypes.ContactRequestReference_Reply{
		Reference: ref,
		Enabled:   enabled,
	}, nil
}

// ContactRequestDisable disables incoming contact requests
func (c *client) ContactRequestDisable(ctx context.Context, _ *bertytypes.ContactRequestDisable_Request) (*bertytypes.ContactRequestDisable_Reply, error) {
	if _, err := c.accountGroup.MetadataStore().ContactRequestDisable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactRequestDisable_Reply{}, nil
}

// ContactRequestEnable enables incoming contact requests
func (c *client) ContactRequestEnable(ctx context.Context, _ *bertytypes.ContactRequestEnable_Request) (*bertytypes.ContactRequestEnable_Reply, error) {
	if _, err := c.accountGroup.MetadataStore().ContactRequestEnable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := c.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	ref := []byte(nil)

	if shareableContact != nil {
		var err error

		shareableContact.Metadata = nil
		ref, err = shareableContact.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}
	}

	return &bertytypes.ContactRequestEnable_Reply{
		Reference: ref,
	}, nil
}

// ContactRequestResetReference generates a new contact request reference
func (c *client) ContactRequestResetReference(ctx context.Context, _ *bertytypes.ContactRequestResetReference_Request) (*bertytypes.ContactRequestResetReference_Reply, error) {
	if _, err := c.accountGroup.MetadataStore().ContactRequestReferenceReset(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := c.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	ref := []byte(nil)

	if shareableContact != nil {
		var err error

		shareableContact.Metadata = nil
		ref, err = shareableContact.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}
	}

	return &bertytypes.ContactRequestResetReference_Reply{
		Reference: ref,
	}, nil
}

// ContactRequestSend enqueues a new contact request to be sent
func (c *client) ContactRequestSend(ctx context.Context, req *bertytypes.ContactRequestSend_Request) (*bertytypes.ContactRequestSend_Reply, error) {
	shareableContact := &bertytypes.ShareableContact{}
	if err := shareableContact.Unmarshal(req.Reference); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	shareableContact.Metadata = req.ContactMetadata

	pk, err := crypto.UnmarshalEd25519PublicKey(shareableContact.PK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accountGroup.MetadataStore().ContactRequestOutgoingEnqueue(ctx, shareableContact); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	// TODO: remove this, used to fake contact requests atm
	if _, err := c.accountGroup.MetadataStore().ContactRequestOutgoingSent(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactRequestSend_Reply{}, nil
}

// ContactRequestAccept accepts a contact request
func (c *client) ContactRequestAccept(ctx context.Context, req *bertytypes.ContactRequestAccept_Request) (*bertytypes.ContactRequestAccept_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accountGroup.MetadataStore().ContactRequestIncomingAccept(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	if err = c.indexGroups(); err != nil {
		return nil, err
	}

	return &bertytypes.ContactRequestAccept_Reply{}, nil
}

// ContactRequestDiscard ignores a contact request without informing the request sender
func (c *client) ContactRequestDiscard(ctx context.Context, req *bertytypes.ContactRequestDiscard_Request) (*bertytypes.ContactRequestDiscard_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accountGroup.MetadataStore().ContactRequestIncomingDiscard(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactRequestDiscard_Reply{}, nil
}
