package bertyprotocol

import (
	"crypto/rand"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	"github.com/golang/protobuf/proto"
	cid "github.com/ipfs/go-cid"
	"golang.org/x/crypto/nacl/secretbox"
)

var eventTypesMapper = map[bertytypes.EventType]struct {
	Message    proto.Message
	SigChecker SigChecker
}{
	bertytypes.EventTypeGroupMemberDeviceAdded:                 {Message: &bertytypes.GroupAddMemberDevice{}, SigChecker: SigCheckerMemberDeviceAdded},
	bertytypes.EventTypeGroupDeviceSecretAdded:                 {Message: &bertytypes.GroupAddDeviceSecret{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountGroupJoined:                     {Message: &bertytypes.AccountGroupJoined{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountGroupLeft:                       {Message: &bertytypes.AccountGroupLeft{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestDisabled:          {Message: &bertytypes.AccountContactRequestDisabled{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestEnabled:           {Message: &bertytypes.AccountContactRequestEnabled{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestReferenceReset:    {Message: &bertytypes.AccountContactRequestReferenceReset{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:  {Message: &bertytypes.AccountContactRequestEnqueued{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestOutgoingSent:      {Message: &bertytypes.AccountContactRequestSent{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestIncomingReceived:  {Message: &bertytypes.AccountContactRequestReceived{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestIncomingDiscarded: {Message: &bertytypes.AccountContactRequestDiscarded{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactRequestIncomingAccepted:  {Message: &bertytypes.AccountContactRequestAccepted{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactBlocked:                  {Message: &bertytypes.AccountContactBlocked{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeAccountContactUnblocked:                {Message: &bertytypes.AccountContactUnblocked{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeContactAliasKeyAdded:                   {Message: &bertytypes.ContactAddAliasKey{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeMultiMemberGroupAliasResolverAdded:     {Message: &bertytypes.MultiMemberGroupAddAliasResolver{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeMultiMemberGroupInitialMemberAnnounced: {Message: &bertytypes.MultiMemberInitialMember{}, SigChecker: SigCheckerGroupSigned},
	bertytypes.EventTypeMultiMemberGroupAdminRoleGranted:       {Message: &bertytypes.MultiMemberGrantAdminRole{}, SigChecker: SigCheckerDeviceSigned},
	bertytypes.EventTypeGroupMetadataPayloadSent:               {Message: &bertytypes.AppMetadata{}, SigChecker: SigCheckerMissing},
}

func NewEventContext(eventID cid.Cid, parentIDs []cid.Cid, g *bertytypes.Group) (*bertytypes.EventContext, error) {
	parentIDsBytes := make([][]byte, len(parentIDs))
	for i, parentID := range parentIDs {
		parentIDsBytes[i] = parentID.Bytes()
	}

	return &bertytypes.EventContext{
		ID:        eventID.Bytes(),
		ParentIDs: parentIDsBytes,
		GroupPK:   g.PublicKey,
	}, nil
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

func NewGroupMetadataEventFromEntry(log ipfslog.Log, e ipfslog.Entry, metadata *bertytypes.GroupMetadata, event proto.Message, g *bertytypes.Group) (*bertytypes.GroupMetadataEvent, error) {
	// TODO: if parent is a merge node we should return the next nodes of it
	evtCtx, err := NewEventContext(e.GetHash(), getParentsForCID(log, e.GetHash()), g)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	eventBytes, err := proto.Marshal(event)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return &bertytypes.GroupMetadataEvent{
		EventContext: evtCtx,
		Metadata:     metadata,
		Event:        eventBytes,
	}, nil
}

func OpenGroupEnvelope(g *bertytypes.Group, envelopeBytes []byte) (*bertytypes.GroupMetadata, proto.Message, error) {
	sharedSecret, err := g.GetSharedSecret()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	env := &bertytypes.GroupEnvelope{}
	if err := env.Unmarshal(envelopeBytes); err != nil {
		return nil, nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if len(env.Nonce) != 24 {
		return nil, nil, errcode.ErrInvalidInput
	}

	var nonce [24]byte
	copy(nonce[:], env.Nonce[:24])

	data, ok := secretbox.Open(nil, env.Event, &nonce, sharedSecret)
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
		return nil, nil, errcode.ErrSignatureVerificationFailed.Wrap(err)
	}

	return metadataEvent, payload, nil
}

func SealGroupEnvelope(g *bertytypes.Group, eventType bertytypes.EventType, payload proto.Marshaler, payloadSig []byte) ([]byte, error) {
	payloadBytes, err := payload.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	var nonce [24]byte
	nonceArr := make([]byte, 24)
	if n, err := rand.Read(nonceArr); err != nil || n != 24 {
		return nil, errcode.ErrRandomGenerationFailed.Wrap(err)
	}

	for i := range nonceArr {
		nonce[i] = nonceArr[i]
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

	eventBytes := secretbox.Seal(nil, eventClearBytes, &nonce, sharedSecret)

	env := &bertytypes.GroupEnvelope{
		Event: eventBytes,
		Nonce: nonceArr,
	}

	return env.Marshal()
}
