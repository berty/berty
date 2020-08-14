package bertyprotocol

import (
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"

	"go.uber.org/zap"
)

// GroupMetadataSubscribe subscribes to the metadata events for a group
func (s *service) GroupMetadataSubscribe(req *bertytypes.GroupMetadataSubscribe_Request, sub ProtocolService_GroupMetadataSubscribeServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// Subscribe for new metadatas
	chSub := cg.MetadataStore().Subscribe(sub.Context())

	// Get old metadatas and forward them to subscriber
	sentDedup := map[string]bool{}
	// TODO: add more granularity
	if len(req.Since) > 0 {
		for evt := range cg.MetadataStore().ListEvents(sub.Context()) {
			if evt == nil {
				continue
			}

			if err = sub.Send(evt); err != nil {
				if sub.Context().Err() == nil {
					cg.logger.Error("error while sending metadata", zap.Error(err))
				}
				return errcode.TODO.Wrap(err)
			}

			cg.logger.Info("service - metadata store - sent 1 event from log history")
			sentDedup[string(evt.EventContext.ID)] = true
		}
	}

	// Get new metadatas and forward them to subscriber
	for evt := range chSub {
		e, ok := evt.(*bertytypes.GroupMetadataEvent)
		if !ok || sentDedup[string(e.EventContext.ID)] {
			continue
		}

		if err := sub.Send(e); err != nil {
			if sub.Context().Err() != nil {
				return nil
			}
			cg.logger.Error("error while sending message", zap.Error(err))
			return err
		}

		cg.logger.Info("service - metadata store - sent 1 event from log subscription")
	}

	return nil
}

// GroupMessageSubscribe subscribes to the message events for a group
func (s *service) GroupMessageSubscribe(req *bertytypes.GroupMessageSubscribe_Request, sub ProtocolService_GroupMessageSubscribeServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// Subscribe for new messages
	chSub := cg.MessageStore().Subscribe(sub.Context())

	// Get old messages and forward them to subscriber
	sentDedup := map[string]bool{}
	// TODO: add more granularity
	if len(req.Since) > 0 {
		chList, err := cg.MessageStore().ListMessages(sub.Context())
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		for evt := range chList {
			if err = sub.Send(evt); err != nil {
				if sub.Context().Err() == nil {
					cg.logger.Error("error while sending message", zap.Error(err))
				}
				return errcode.TODO.Wrap(err)
			}
			sentDedup[string(evt.EventContext.ID)] = true
		}
	}

	// Get new messages and forward them to subscriber
	for evt := range chSub {
		e, ok := evt.(*bertytypes.GroupMessageEvent)
		if !ok || sentDedup[string(e.EventContext.ID)] {
			continue
		}

		_, span := tracer.SpanFromMessageHeaders(sub.Context(), e.Headers, "Receive Group Message")
		err := sub.Send(e)
		span.End()
		if err != nil {
			if sub.Context().Err() != nil {
				return nil
			}
			cg.logger.Error("error while sending message", zap.Error(err))
			return err
		}
	}

	return nil
}

func (s *service) GroupMetadataList(req *bertytypes.GroupMetadataList_Request, sub ProtocolService_GroupMetadataListServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	for evt := range cg.MetadataStore().ListEvents(sub.Context()) {
		if evt == nil {
			continue
		}

		if err := sub.Send(evt); err != nil {
			if sub.Context().Err() != nil {
				return nil
			}
			cg.logger.Error("error while sending message", zap.Error(err))
		}
	}

	return nil
}

func (s *service) GroupMessageList(req *bertytypes.GroupMessageList_Request, sub ProtocolService_GroupMessageListServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	messages, err := cg.MessageStore().ListMessages(sub.Context())
	if err != nil {
		return err
	}

	for evt := range messages {
		if err := sub.Send(evt); err != nil {
			if sub.Context().Err() != nil {
				cg.logger.Error("context closed", zap.Error(err))
				return nil
			}
			cg.logger.Error("error while sending message", zap.Error(err))
			return err
		}
	}

	return nil
}
