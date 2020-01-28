package orbitutil

import (
	"crypto/rand"

	ipfslog "berty.tech/go-ipfs-log"
	"github.com/golang/protobuf/proto"
	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func NewEventContext(eventID cid.Cid, parentIDs []cid.Cid, groupPK crypto.PubKey) (*bertyprotocol.EventContext, error) {
	parentIDsBytes := make([][]byte, len(parentIDs))
	for i, parentID := range parentIDs {
		parentIDsBytes[i] = parentID.Bytes()
	}

	groupPKBytes, err := groupPK.Bytes()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &bertyprotocol.EventContext{
		ID:        eventID.Bytes(),
		ParentIDs: parentIDsBytes,
		GroupPK:   groupPKBytes,
	}, nil
}

func NewGroupSecureMessageEvent(eventContext *bertyprotocol.EventContext, headers *bertyprotocol.MessageHeaders, message []byte) *bertyprotocol.GroupMessageEvent {
	return &bertyprotocol.GroupMessageEvent{
		EventContext: eventContext,
		Headers:      headers,
		Message:      message,
	}
}

func NewGroupMetadataEvent(eventContext *bertyprotocol.EventContext, metadata *bertyprotocol.GroupMetadata) *bertyprotocol.GroupMetadataEvent {
	return &bertyprotocol.GroupMetadataEvent{
		EventContext: eventContext,
		Metadata:     metadata,
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

func NewGroupMetadataEventFromEntry(log ipfslog.Log, e ipfslog.Entry, metadata *bertyprotocol.GroupMetadata, event proto.Message, g *group.Group) (*bertyprotocol.GroupMetadataEvent, error) {
	// TODO: if parent is a merge node we should return the next nodes of it
	evtCtx, err := NewEventContext(e.GetHash(), getParentsForCID(log, e.GetHash()), g.PubKey)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	eventBytes, err := proto.Marshal(event)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return &bertyprotocol.GroupMetadataEvent{
		EventContext: evtCtx,
		Metadata:     metadata,
		Event:        eventBytes,
	}, nil
}

func OpenGroupEnvelope(g *group.Group, envelopeBytes []byte) (*bertyprotocol.GroupMetadata, proto.Message, error) {
	sharedSecret, err := g.GetSharedSecret()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	env := &bertyprotocol.GroupEnvelope{}
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

	metadataEvent := &bertyprotocol.GroupMetadata{}

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

	if err := et.Validator(metadataEvent, payload, g); err != nil {
		// TODO: change errcode
		return nil, nil, errcode.ErrGroupMemberLogEventSignature.Wrap(err)
	}

	return metadataEvent, payload, nil
}

func SealGroupEnvelope(g *group.Group, eventType bertyprotocol.EventType, payload proto.Marshaler, payloadSig []byte) ([]byte, error) {
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

	event := &bertyprotocol.GroupMetadata{
		EventType: eventType,
		Payload:   payloadBytes,
		Sig:       payloadSig,
	}

	eventClearBytes, err := event.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	eventBytes := secretbox.Seal(nil, eventClearBytes, &nonce, sharedSecret)

	env := &bertyprotocol.GroupEnvelope{
		Event: eventBytes,
		Nonce: nonceArr,
	}

	return env.Marshal()
}
