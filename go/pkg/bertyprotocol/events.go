package bertyprotocol

import (
	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	"github.com/golang/protobuf/proto"
	cid "github.com/ipfs/go-cid"
	"golang.org/x/crypto/nacl/secretbox"
)

var eventTypesMapper = map[bertytypes.EventType]struct {
	Message    proto.Message
	SigChecker sigChecker
}{
	bertytypes.EventTypeGroupMemberDeviceAdded:                 {Message: &bertytypes.GroupAddMemberDevice{}, SigChecker: sigCheckerMemberDeviceAdded},
	bertytypes.EventTypeGroupDeviceSecretAdded:                 {Message: &bertytypes.GroupAddDeviceSecret{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountGroupJoined:                     {Message: &bertytypes.AccountGroupJoined{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountGroupLeft:                       {Message: &bertytypes.AccountGroupLeft{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestDisabled:          {Message: &bertytypes.AccountContactRequestDisabled{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestEnabled:           {Message: &bertytypes.AccountContactRequestEnabled{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestReferenceReset:    {Message: &bertytypes.AccountContactRequestReferenceReset{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:  {Message: &bertytypes.AccountContactRequestEnqueued{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestOutgoingSent:      {Message: &bertytypes.AccountContactRequestSent{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestIncomingReceived:  {Message: &bertytypes.AccountContactRequestReceived{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestIncomingDiscarded: {Message: &bertytypes.AccountContactRequestDiscarded{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestIncomingAccepted:  {Message: &bertytypes.AccountContactRequestAccepted{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactBlocked:                  {Message: &bertytypes.AccountContactBlocked{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactUnblocked:                {Message: &bertytypes.AccountContactUnblocked{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeContactAliasKeyAdded:                   {Message: &bertytypes.ContactAddAliasKey{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeMultiMemberGroupAliasResolverAdded:     {Message: &bertytypes.MultiMemberGroupAddAliasResolver{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeMultiMemberGroupInitialMemberAnnounced: {Message: &bertytypes.MultiMemberInitialMember{}, SigChecker: sigCheckerGroupSigned},
	bertytypes.EventTypeMultiMemberGroupAdminRoleGranted:       {Message: &bertytypes.MultiMemberGrantAdminRole{}, SigChecker: sigCheckerDeviceSigned},
	bertytypes.EventTypeGroupMetadataPayloadSent:               {Message: &bertytypes.AppMetadata{}, SigChecker: sigCheckerMissing},
}

func newEventContext(eventID cid.Cid, parentIDs []cid.Cid, g *bertytypes.Group) *bertytypes.EventContext {
	parentIDsBytes := make([][]byte, len(parentIDs))
	for i, parentID := range parentIDs {
		parentIDsBytes[i] = parentID.Bytes()
	}

	return &bertytypes.EventContext{
		ID:        eventID.Bytes(),
		ParentIDs: parentIDsBytes,
		GroupPK:   g.PublicKey,
	}
}

func getParentsForCID(log ipfslog.Log, c cid.Cid) []cid.Cid {
	if log == nil {
		// TODO: this should not happen
		return []cid.Cid{}
	}

	parent, ok := log.GetEntries().Get(c.String())

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

func newGroupMetadataEventFromEntry(log ipfslog.Log, e ipfslog.Entry, metadata *bertytypes.GroupMetadata, event proto.Message, g *bertytypes.Group) (*bertytypes.GroupMetadataEvent, error) {
	// TODO: if parent is a merge node we should return the next nodes of it

	eventBytes, err := proto.Marshal(event)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	evtCtx := newEventContext(e.GetHash(), getParentsForCID(log, e.GetHash()), g)
	return &bertytypes.GroupMetadataEvent{
		EventContext: evtCtx,
		Metadata:     metadata,
		Event:        eventBytes,
	}, nil
}

func openGroupEnvelope(g *bertytypes.Group, envelopeBytes []byte) (*bertytypes.GroupMetadata, proto.Message, error) {
	sharedSecret, err := g.GetSharedSecret()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	env := &bertytypes.GroupEnvelope{}
	if err := env.Unmarshal(envelopeBytes); err != nil {
		return nil, nil, errcode.ErrInvalidInput.Wrap(err)
	}

	nonce, err := cryptoutil.NonceSliceToArray(env.Nonce)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	data, ok := secretbox.Open(nil, env.Event, nonce, sharedSecret)
	if !ok {
		return nil, nil, errcode.ErrGroupMemberLogEventOpen
	}

	metadataEvent := &bertytypes.GroupMetadata{}

	err = metadataEvent.Unmarshal(data)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	et, ok := eventTypesMapper[metadataEvent.EventType]
	if !ok {
		return nil, nil, errcode.ErrInvalidInput
	}

	payload := proto.Clone(et.Message)
	if err := proto.Unmarshal(metadataEvent.Payload, payload); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	if err := et.SigChecker(g, metadataEvent, payload); err != nil {
		return nil, nil, errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	return metadataEvent, payload, nil
}

func sealGroupEnvelope(g *bertytypes.Group, eventType bertytypes.EventType, payload proto.Marshaler, payloadSig []byte) ([]byte, error) {
	payloadBytes, err := payload.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	sharedSecret, err := g.GetSharedSecret()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	event := &bertytypes.GroupMetadata{
		EventType: eventType,
		Payload:   payloadBytes,
		Sig:       payloadSig,
	}

	eventClearBytes, err := event.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	eventBytes := secretbox.Seal(nil, eventClearBytes, nonce, sharedSecret)

	env := &bertytypes.GroupEnvelope{
		Event: eventBytes,
		Nonce: nonce[:],
	}

	return env.Marshal()
}
