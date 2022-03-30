package bertyprotocol

import (
	"fmt"

	"github.com/gogo/protobuf/proto"
	cid "github.com/ipfs/go-cid"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	ipfslog "berty.tech/go-ipfs-log"
)

var eventTypesMapper = map[protocoltypes.EventType]struct {
	Message    proto.Message
	SigChecker sigChecker
}{
	protocoltypes.EventTypeGroupMemberDeviceAdded:                 {Message: &protocoltypes.GroupAddMemberDevice{}, SigChecker: sigCheckerMemberDeviceAdded},
	protocoltypes.EventTypeGroupDeviceSecretAdded:                 {Message: &protocoltypes.GroupAddDeviceSecret{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountGroupJoined:                     {Message: &protocoltypes.AccountGroupJoined{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountGroupLeft:                       {Message: &protocoltypes.AccountGroupLeft{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestDisabled:          {Message: &protocoltypes.AccountContactRequestDisabled{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestEnabled:           {Message: &protocoltypes.AccountContactRequestEnabled{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestReferenceReset:    {Message: &protocoltypes.AccountContactRequestReferenceReset{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued:  {Message: &protocoltypes.AccountContactRequestEnqueued{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestOutgoingSent:      {Message: &protocoltypes.AccountContactRequestSent{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestIncomingReceived:  {Message: &protocoltypes.AccountContactRequestReceived{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestIncomingDiscarded: {Message: &protocoltypes.AccountContactRequestDiscarded{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactRequestIncomingAccepted:  {Message: &protocoltypes.AccountContactRequestAccepted{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactBlocked:                  {Message: &protocoltypes.AccountContactBlocked{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountContactUnblocked:                {Message: &protocoltypes.AccountContactUnblocked{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeContactAliasKeyAdded:                   {Message: &protocoltypes.ContactAddAliasKey{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeMultiMemberGroupAliasResolverAdded:     {Message: &protocoltypes.MultiMemberGroupAddAliasResolver{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeMultiMemberGroupInitialMemberAnnounced: {Message: &protocoltypes.MultiMemberInitialMember{}, SigChecker: sigCheckerGroupSigned},
	protocoltypes.EventTypeMultiMemberGroupAdminRoleGranted:       {Message: &protocoltypes.MultiMemberGrantAdminRole{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeGroupMetadataPayloadSent:               {Message: &protocoltypes.AppMetadata{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountServiceTokenAdded:               {Message: &protocoltypes.AccountServiceTokenAdded{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeAccountServiceTokenRemoved:             {Message: &protocoltypes.AccountServiceTokenRemoved{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypeGroupReplicating:                       {Message: &protocoltypes.GroupReplicating{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypePushDeviceServerRegistered:             {Message: &protocoltypes.PushDeviceServerRegistered{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypePushDeviceTokenRegistered:              {Message: &protocoltypes.PushDeviceTokenRegistered{}, SigChecker: sigCheckerDeviceSigned},
	protocoltypes.EventTypePushMemberTokenUpdate:                  {Message: &protocoltypes.PushMemberTokenUpdate{}, SigChecker: sigCheckerDeviceSigned},
}

func newEventContext(eventID cid.Cid, parentIDs []cid.Cid, g *protocoltypes.Group, attachmentsCIDs [][]byte) *protocoltypes.EventContext {
	parentIDsBytes := make([][]byte, len(parentIDs))
	for i, parentID := range parentIDs {
		parentIDsBytes[i] = parentID.Bytes()
	}

	return &protocoltypes.EventContext{
		ID:             eventID.Bytes(),
		ParentIDs:      parentIDsBytes,
		GroupPK:        g.PublicKey,
		AttachmentCIDs: attachmentsCIDs,
	}
}

// FIXME(gfanton): getParentsCID use a lot of ressources
// nolint:unused
func getParentsForCID(log ipfslog.Log, c cid.Cid) []cid.Cid {
	if log == nil {
		// TODO: this should not happen
		return []cid.Cid{}
	}

	parent, ok := log.Get(c)

	// Can't fetch parent entry
	if !ok {
		return []cid.Cid{}
	}

	nextEntries := parent.GetNext()

	// Parent has only one or no parents, returning its id
	if len(nextEntries) <= 1 {
		return []cid.Cid{parent.GetHash()}
	}

	// Parent has more than one parent, returning parent entries
	var ret []cid.Cid
	for _, n := range nextEntries {
		ret = append(ret, getParentsForCID(log, n)...)
	}

	return ret
}

func newGroupMetadataEventFromEntry(_ ipfslog.Log, e ipfslog.Entry, metadata *protocoltypes.GroupMetadata, event proto.Message, g *protocoltypes.Group, attachmentsCIDs [][]byte) (*protocoltypes.GroupMetadataEvent, error) {
	// TODO: if parent is a merge node we should return the next nodes of it

	eventBytes, err := proto.Marshal(event)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	// TODO(gfanton): getParentsCID use a lot of ressources, disable it until we need it
	// evtCtx := newEventContext(e.GetHash(), getParentsForCID(log, e.GetHash()), g, attachmentsCIDs)
	evtCtx := newEventContext(e.GetHash(), []cid.Cid{}, g, attachmentsCIDs)

	gme := protocoltypes.GroupMetadataEvent{
		EventContext: evtCtx,
		Metadata:     metadata,
		Event:        eventBytes,
	}

	return &gme, nil
}

func openGroupEnvelope(g *protocoltypes.Group, envelopeBytes []byte, devKS cryptoutil.DeviceKeystore) (*protocoltypes.GroupMetadata, proto.Message, [][]byte, error) {
	env := &protocoltypes.GroupEnvelope{}
	if err := env.Unmarshal(envelopeBytes); err != nil {
		return nil, nil, nil, errcode.ErrInvalidInput.Wrap(err)
	}

	nonce, err := cryptoutil.NonceSliceToArray(env.Nonce)
	if err != nil {
		return nil, nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	data, ok := secretbox.Open(nil, env.Event, nonce, cryptoutil.GetSharedSecret(g))
	if !ok {
		return nil, nil, nil, errcode.ErrGroupMemberLogEventOpen
	}

	metadataEvent := &protocoltypes.GroupMetadata{}

	err = metadataEvent.Unmarshal(data)
	if err != nil {
		return nil, nil, nil, errcode.TODO.Wrap(err)
	}

	et, ok := eventTypesMapper[metadataEvent.EventType]
	if !ok {
		return nil, nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("event type not found"))
	}

	payload := proto.Clone(et.Message)
	if err := proto.Unmarshal(metadataEvent.Payload, payload); err != nil {
		return nil, nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	if err := et.SigChecker(g, metadataEvent, payload); err != nil {
		return nil, nil, nil, errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	attachmentsCIDs, err := cryptoutil.AttachmentCIDSliceDecrypt(g, env.GetEncryptedAttachmentCIDs())
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	if err := devKS.AttachmentSecretSlicePut(attachmentsCIDs, metadataEvent.GetProtocolMetadata().GetAttachmentsSecrets()); err != nil {
		return nil, nil, nil, errcode.TODO.Wrap(err)
	}

	return metadataEvent, payload, attachmentsCIDs, nil
}

func sealGroupEnvelope(g *protocoltypes.Group, eventType protocoltypes.EventType, payload proto.Marshaler, payloadSig []byte, attachmentsCIDs [][]byte, attachmentsSecrets [][]byte) ([]byte, error) {
	payloadBytes, err := payload.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	event := &protocoltypes.GroupMetadata{
		EventType:        eventType,
		Payload:          payloadBytes,
		Sig:              payloadSig,
		ProtocolMetadata: &protocoltypes.ProtocolMetadata{AttachmentsSecrets: attachmentsSecrets},
	}

	eventClearBytes, err := event.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	eventBytes := secretbox.Seal(nil, eventClearBytes, nonce, cryptoutil.GetSharedSecret(g))

	eCIDs, err := cryptoutil.AttachmentCIDSliceEncrypt(g, attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	env := &protocoltypes.GroupEnvelope{
		Event:                   eventBytes,
		Nonce:                   nonce[:],
		EncryptedAttachmentCIDs: eCIDs,
	}

	return env.Marshal()
}
