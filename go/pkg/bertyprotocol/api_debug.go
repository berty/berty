package bertyprotocol

import (
	"fmt"

	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/stores/operation"
	"go.uber.org/zap"
)

func (s *service) DebugListGroups(req *bertytypes.DebugListGroups_Request, srv ProtocolService_DebugListGroupsServer) error {
	if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
		GroupPK:   s.accountGroup.group.PublicKey,
		GroupType: s.accountGroup.group.GroupType,
	}); err != nil {
		return err
	}

	for _, c := range s.accountGroup.MetadataStore().ListContactsByStatus(bertytypes.ContactStateAdded) {
		pk, err := crypto.UnmarshalEd25519PublicKey(c.PK)
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		sk, err := s.deviceKeystore.ContactGroupPrivKey(pk)
		if err != nil {
			return errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		g, err := getGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
			ContactPK: c.PK,
		}); err != nil {
			return err
		}
	}

	for _, g := range s.accountGroup.MetadataStore().ListMultiMemberGroups() {
		if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
		}); err != nil {
			return err
		}
	}

	return nil
}

func (s *service) DebugInspectGroupStore(req *bertytypes.DebugInspectGroupStore_Request, srv ProtocolService_DebugInspectGroupStoreServer) error {
	if req.LogType == bertytypes.DebugInspectGroupLogTypeUndefined {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid log type specified"))
	}

	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	switch req.LogType {
	case bertytypes.DebugInspectGroupLogTypeMessage:
		for _, e := range cg.messageStore.OpLog().GetEntries().Slice() {
			var (
				payload  = []byte(nil)
				devicePK = []byte(nil)
				nexts    = make([][]byte, len(e.GetNext()))
			)

			if evt, err := cg.messageStore.openMessage(srv.Context(), e); err != nil {
				s.logger.Error("unable to open message", zap.Error(err))

			} else {
				devicePK = evt.Headers.DevicePK
				payload = evt.Message
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&bertytypes.DebugInspectGroupStore_Reply{
				CID:        e.GetHash().Bytes(),
				ParentCIDs: nexts,
				DevicePK:   devicePK,
				Payload:    payload,
			}); err != nil {
				return err
			}
		}

	case bertytypes.DebugInspectGroupLogTypeMetadata:
		log := cg.metadataStore.OpLog()

		for _, e := range log.GetEntries().Slice() {
			var (
				eventType bertytypes.EventType
				payload   = []byte(nil)
				devicePK  = []byte(nil)
				nexts     = make([][]byte, len(e.GetNext()))
			)

			if op, err := operation.ParseOperation(e); err != nil {
				s.logger.Error("unable to parse operation", zap.Error(err))
			} else if meta, event, err := openGroupEnvelope(cg.group, op.GetValue()); err != nil {
				s.logger.Error("unable to open group envelope", zap.Error(err))
			} else if metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, cg.group); err != nil {
				s.logger.Error("unable to get group metadata event from entry", zap.Error(err))
			} else {
				payload = metaEvent.Event
				eventType = metaEvent.Metadata.EventType

				if typeData, ok := eventTypesMapper[metaEvent.Metadata.EventType]; ok {
					p := proto.Clone(typeData.Message)
					if err := proto.Unmarshal(metaEvent.Event, p); err == nil {
						if msg, ok := p.(eventDeviceSigned); ok {
							devicePK = msg.GetDevicePK()
						}
					}
				} else {
					s.logger.Error("unable to get message struct for event type", zap.String("event_type", metaEvent.Metadata.EventType.String()))
				}
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&bertytypes.DebugInspectGroupStore_Reply{
				CID:               e.GetHash().Bytes(),
				ParentCIDs:        nexts,
				Payload:           payload,
				MetadataEventType: eventType,
				DevicePK:          devicePK,
			}); err != nil {
				return err
			}
		}
	}

	return nil
}
