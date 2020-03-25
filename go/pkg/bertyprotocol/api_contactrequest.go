package bertyprotocol

import (
	"context"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/errcode"
)

// ContactRequestReference retrieves the necessary information to create a contact link
func (c *client) ContactRequestReference(context.Context, *ContactRequestReference_Request) (*ContactRequestReference_Reply, error) {
	enabled, shareableContact := c.accContextGroup.MetadataStore().GetIncomingContactRequestsStatus()
	ref := []byte(nil)

	if shareableContact != nil {
		var err error

		shareableContact.Metadata = nil
		ref, err = shareableContact.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}
	}

	return &ContactRequestReference_Reply{
		Reference: ref,
		Enabled:   enabled,
	}, nil
}

// ContactRequestDisable disables incoming contact requests
func (c *client) ContactRequestDisable(ctx context.Context, _ *ContactRequestDisable_Request) (*ContactRequestDisable_Reply, error) {
	if _, err := c.accContextGroup.MetadataStore().ContactRequestDisable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &ContactRequestDisable_Reply{}, nil
}

// ContactRequestEnable enables incoming contact requests
func (c *client) ContactRequestEnable(ctx context.Context, _ *ContactRequestEnable_Request) (*ContactRequestEnable_Reply, error) {
	if _, err := c.accContextGroup.MetadataStore().ContactRequestEnable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := c.accContextGroup.MetadataStore().GetIncomingContactRequestsStatus()
	ref := []byte(nil)

	if shareableContact != nil {
		var err error

		shareableContact.Metadata = nil
		ref, err = shareableContact.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}
	}

	return &ContactRequestEnable_Reply{
		Reference: ref,
	}, nil
}

// ContactRequestResetReference generates a new contact request reference
func (c *client) ContactRequestResetReference(ctx context.Context, _ *ContactRequestResetReference_Request) (*ContactRequestResetReference_Reply, error) {
	if _, err := c.accContextGroup.MetadataStore().ContactRequestReferenceReset(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := c.accContextGroup.MetadataStore().GetIncomingContactRequestsStatus()
	ref := []byte(nil)

	if shareableContact != nil {
		var err error

		shareableContact.Metadata = nil
		ref, err = shareableContact.Marshal()
		if err != nil {
			return nil, errcode.ErrSerialization.Wrap(err)
		}
	}

	return &ContactRequestResetReference_Reply{
		Reference: ref,
	}, nil
}

// ContactRequestSend enqueues a new contact request to be sent
func (c *client) ContactRequestSend(ctx context.Context, req *ContactRequestSend_Request) (*ContactRequestSend_Reply, error) {
	shareableContact := &ShareableContact{}
	if err := shareableContact.Unmarshal(req.Reference); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	shareableContact.Metadata = req.ContactMetadata

	pk, err := crypto.UnmarshalEd25519PublicKey(shareableContact.PK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactRequestOutgoingEnqueue(ctx, shareableContact); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	// TODO: remove this, used to fake contact requests atm
	if _, err := c.accContextGroup.MetadataStore().ContactRequestOutgoingSent(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &ContactRequestSend_Reply{}, nil
}

// ContactRequestAccept accepts a contact request
func (c *client) ContactRequestAccept(ctx context.Context, req *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactRequestIncomingAccept(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	if err = c.indexGroups(); err != nil {
		return nil, err
	}

	return &ContactRequestAccept_Reply{}, nil
}

// ContactRequestDiscard ignores a contact request without informing the request sender
func (c *client) ContactRequestDiscard(ctx context.Context, req *ContactRequestDiscard_Request) (*ContactRequestDiscard_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := c.accContextGroup.MetadataStore().ContactRequestIncomingDiscard(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &ContactRequestDiscard_Reply{}, nil
}
