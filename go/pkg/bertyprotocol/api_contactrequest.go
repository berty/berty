package bertyprotocol

import (
	"context"
	"encoding/hex"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

// ContactRequestReference retrieves the necessary information to create a contact link
func (s *service) ContactRequestReference(context.Context, *protocoltypes.ContactRequestReference_Request) (*protocoltypes.ContactRequestReference_Reply, error) {
	enabled, shareableContact := s.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	rdvSeed := []byte(nil)

	if shareableContact != nil {
		rdvSeed = shareableContact.PublicRendezvousSeed
	}

	return &protocoltypes.ContactRequestReference_Reply{
		PublicRendezvousSeed: rdvSeed,
		Enabled:              enabled,
	}, nil
}

// ContactRequestDisable disables incoming contact requests
func (s *service) ContactRequestDisable(ctx context.Context, _ *protocoltypes.ContactRequestDisable_Request) (*protocoltypes.ContactRequestDisable_Reply, error) {
	if _, err := s.accountGroup.MetadataStore().ContactRequestDisable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	s.logger.Info(
		"Contact request disabled",
		tyber.FormatEventLogFields()...,
	)

	return &protocoltypes.ContactRequestDisable_Reply{}, nil
}

// ContactRequestEnable enables incoming contact requests
func (s *service) ContactRequestEnable(ctx context.Context, _ *protocoltypes.ContactRequestEnable_Request) (*protocoltypes.ContactRequestEnable_Reply, error) {
	if _, err := s.accountGroup.MetadataStore().ContactRequestEnable(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := s.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	rdvSeed := []byte(nil)

	if shareableContact != nil {
		rdvSeed = shareableContact.PublicRendezvousSeed
	}

	s.logger.Info(
		"Contact request enabled",
		tyber.FormatEventLogFields(tyber.Detail{Name: "rdvSeed", Description: hex.EncodeToString(rdvSeed)})...,
	)

	return &protocoltypes.ContactRequestEnable_Reply{
		PublicRendezvousSeed: rdvSeed,
	}, nil
}

// ContactRequestResetReference generates a new contact request reference
func (s *service) ContactRequestResetReference(ctx context.Context, _ *protocoltypes.ContactRequestResetReference_Request) (*protocoltypes.ContactRequestResetReference_Reply, error) {
	if _, err := s.accountGroup.MetadataStore().ContactRequestReferenceReset(ctx); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	_, shareableContact := s.accountGroup.MetadataStore().GetIncomingContactRequestsStatus()
	rdvSeed := []byte(nil)

	if shareableContact != nil {
		rdvSeed = shareableContact.PublicRendezvousSeed
	}

	return &protocoltypes.ContactRequestResetReference_Reply{
		PublicRendezvousSeed: rdvSeed,
	}, nil
}

// ContactRequestSend enqueues a new contact request to be sent
func (s *service) ContactRequestSend(ctx context.Context, req *protocoltypes.ContactRequestSend_Request) (*protocoltypes.ContactRequestSend_Reply, error) {
	ctx = tyber.ContextWithTraceID(ctx)
	shareableContact := req.Contact
	s.logger.Info(
		"Sending request to contact "+hex.EncodeToString(shareableContact.PK),
		tyber.FormatTraceLogFields(ctx)...,
	)
	if shareableContact == nil {
		s.logger.Error(
			"Nil contact",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: errcode.ErrInvalidInput.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrInvalidInput
	}

	if _, err := s.accountGroup.MetadataStore().ContactRequestOutgoingEnqueue(ctx, shareableContact, req.OwnMetadata); err != nil {
		s.logger.Error(
			"Error writting to the metadata store",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	s.logger.Debug(
		"Store written successfully",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, true)...,
	)
	return &protocoltypes.ContactRequestSend_Reply{}, nil
}

// ContactRequestAccept accepts a contact request
func (s *service) ContactRequestAccept(ctx context.Context, req *protocoltypes.ContactRequestAccept_Request) (*protocoltypes.ContactRequestAccept_Reply, error) {
	ctx = tyber.ContextWithTraceID(ctx)
	s.logger.Info(
		"Accepting contact request from "+hex.EncodeToString(req.ContactPK),
		tyber.FormatTraceLogFields(ctx)...,
	)
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		s.logger.Error(
			"Error deserializing the key",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactRequestIncomingAccept(ctx, pk); err != nil {
		s.logger.Error(
			"Error writting to the metadata store",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	s.logger.Debug(
		"Metadata store written successfully",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, false)...,
	)

	if err = s.indexGroups(); err != nil {
		s.logger.Error(
			"Error indexing groups",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, err
	}

	s.logger.Debug(
		"Groups indexed correctly",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, true)...,
	)
	return &protocoltypes.ContactRequestAccept_Reply{}, nil
}

// ContactRequestDiscard ignores a contact request without informing the request sender
func (s *service) ContactRequestDiscard(ctx context.Context, req *protocoltypes.ContactRequestDiscard_Request) (*protocoltypes.ContactRequestDiscard_Reply, error) {
	ctx = tyber.ContextWithTraceID(ctx)
	s.logger.Info(
		"Discarding contact request from "+hex.EncodeToString(req.ContactPK),
		tyber.FormatTraceLogFields(ctx)...,
	)
	pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
	if err != nil {
		s.logger.Error(
			"Error deserializing the key",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := s.accountGroup.MetadataStore().ContactRequestIncomingDiscard(ctx, pk); err != nil {
		s.logger.Error(
			"Error writting to the metadata store",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	s.logger.Debug(
		"Metadata store written successfully",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, true)...,
	)

	return &protocoltypes.ContactRequestDiscard_Reply{}, nil
}
