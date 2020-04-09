package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

// ContactRequestReference retrieves the necessary information to create a contact link
func (s *service) ContactRequestReference(context.Context, *bertytypes.ContactRequestReference_Request) (*bertytypes.ContactRequestReference_Reply, error) {
	enabled, shareableContact := s.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	rdvSeed := []byte(nil)

	if shareableContact != nil {
		rdvSeed = shareableContact.PublicRendezvousSeed
	}

	return &bertytypes.ContactRequestReference_Reply{
		PublicRendezvousSeed: rdvSeed,
		Enabled:              enabled,
	}, nil
}

// ContactRequestDisable disables incoming contact requests
func (s *service) ContactRequestDisable(ctx context.Context, _ *bertytypes.ContactRequestDisable_Request) (*bertytypes.ContactRequestDisable_Reply, error) {
	if _, err := s.accountGroup.MetadataStore().ContactRequestDisable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactRequestDisable_Reply{}, nil
}

// ContactRequestEnable enables incoming contact requests
func (s *service) ContactRequestEnable(ctx context.Context, _ *bertytypes.ContactRequestEnable_Request) (*bertytypes.ContactRequestEnable_Reply, error) {
	if _, err := s.accountGroup.MetadataStore().ContactRequestEnable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := s.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	rdvSeed := []byte(nil)

	if shareableContact != nil {
		rdvSeed = shareableContact.PublicRendezvousSeed
	}

	return &bertytypes.ContactRequestEnable_Reply{
		PublicRendezvousSeed: rdvSeed,
	}, nil
}

// ContactRequestResetReference generates a new contact request reference
func (s *service) ContactRequestResetReference(ctx context.Context, _ *bertytypes.ContactRequestResetReference_Request) (*bertytypes.ContactRequestResetReference_Reply, error) {
	if _, err := s.accountGroup.MetadataStore().ContactRequestReferenceReset(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := s.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	rdvSeed := []byte(nil)

	if shareableContact != nil {
		rdvSeed = shareableContact.PublicRendezvousSeed
	}

	return &bertytypes.ContactRequestResetReference_Reply{
		PublicRendezvousSeed: rdvSeed,
	}, nil
}

// ContactRequestSend enqueues a new contact request to be sent
func (s *service) ContactRequestSend(ctx context.Context, req *bertytypes.ContactRequestSend_Request) (*bertytypes.ContactRequestSend_Reply, error) {
	shareableContact := req.Contact
	if shareableContact == nil {
		return nil, errcode.ErrInvalidInput
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(shareableContact.PK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactRequestOutgoingEnqueue(ctx, shareableContact); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	// TODO: remove this, used to fake contact requests atm
	if _, err := s.accountGroup.MetadataStore().ContactRequestOutgoingSent(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactRequestSend_Reply{}, nil
}

// ContactRequestAccept accepts a contact request
func (s *service) ContactRequestAccept(ctx context.Context, req *bertytypes.ContactRequestAccept_Request) (*bertytypes.ContactRequestAccept_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactRequestIncomingAccept(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	if err = s.indexGroups(); err != nil {
		return nil, err
	}

	return &bertytypes.ContactRequestAccept_Reply{}, nil
}

// ContactRequestDiscard ignores a contact request without informing the request sender
func (s *service) ContactRequestDiscard(ctx context.Context, req *bertytypes.ContactRequestDiscard_Request) (*bertytypes.ContactRequestDiscard_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactRequestIncomingDiscard(ctx, pk); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.ContactRequestDiscard_Reply{}, nil
}
