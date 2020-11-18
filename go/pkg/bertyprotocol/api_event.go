package bertyprotocol

import (
	"errors"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
)

func checkParametersConsistency(sinceID, untilID []byte, sinceNow, untilNow, reverseOrder bool) error {
	// Since can't be both set to an ID and to now
	if sinceID != nil && sinceNow {
		return errcode.ErrInvalidInput.Wrap(errors.New("params SinceNow and SinceID are both set"))
	}
	// Until can't be both set to an ID and to now
	if untilID != nil && untilNow {
		return errcode.ErrInvalidInput.Wrap(errors.New("params UntilNow and UntilID are both set"))
	}
	// Since and Until can't be both set to now at the same time
	if sinceNow && untilNow {
		return errcode.ErrInvalidInput.Wrap(errors.New("params SinceNow and UntilNow are both set"))
	}
	// Can't reverse events orders if subscribed to new events
	if untilID == nil && !untilNow && reverseOrder {
		return errcode.ErrInvalidInput.Wrap(errors.New("reverse chronological order requested while subscribing to new events"))
	}

	return nil
}

// GroupMetadataList replays previous and subscribes to new metadata events from the group
func (s *service) GroupMetadataList(req *bertytypes.GroupMetadataList_Request, sub ProtocolService_GroupMetadataListServer) error {
	var (
		newEvents            <-chan events.Event
		sentEvents                = map[string]bool{}
		firstReplicatedFound bool = true
	)

	// Get group context / check if the group is opened
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// Check parameters consistency
	if err := checkParametersConsistency(req.SinceID, req.UntilID, req.SinceNow, req.UntilNow, req.ReverseOrder); err != nil {
		return err
	}

	// Subscribe to new metadata events if requested
	if req.UntilID == nil && !req.UntilNow {
		newEvents = cg.MetadataStore().Subscribe(sub.Context())
	}

	listPreviousMessages := func() error {
		var previousEvents <-chan *bertytypes.GroupMetadataEvent
		previousEvents, err = cg.MetadataStore().ListEvents(sub.Context(), req.SinceID, req.UntilID, req.ReverseOrder)
		if err != nil {
			return err
		}

		for event := range previousEvents {
			if event == nil || sentEvents[string(event.EventContext.ID)] {
				continue
			}

			if err = sub.Send(event); err != nil {
				if sub.Context().Err() == nil {
					cg.logger.Error("error while sending metadata", zap.Error(err))
				}
				return err
			}

			cg.logger.Info("service - metadata store - sent 1 event from log history")
			sentEvents[string(event.EventContext.ID)] = true
		}

		return nil
	}

	// Subscribe to previous metadata events and stream them if requested
	if !req.SinceNow {
		if err := listPreviousMessages(); err != nil {
			return err
		}
		firstReplicatedFound = false
	}

	// Subscribe to new metadata events and stream them if requested
	if req.UntilID == nil && !req.UntilNow {
		for event := range newEvents {
			if !firstReplicatedFound {
				if _, ok := event.(*stores.EventReplicated); ok {
					if err := listPreviousMessages(); err != nil {
						return err
					}
					firstReplicatedFound = true
					continue
				}
			}

			e, ok := event.(*bertytypes.GroupMetadataEvent)
			if !ok || sentEvents[string(e.EventContext.ID)] { // Avoid sending two times the same event
				continue
			}

			if err := sub.Send(e); err != nil {
				if sub.Context().Err() != nil {
					return nil
				}
				cg.logger.Error("error while sending metadata", zap.Error(err))
				return err
			}

			if !firstReplicatedFound {
				sentEvents[string(e.EventContext.ID)] = true
			}

			cg.logger.Info("service - metadata store - sent 1 event from log subscription")
		}
	}

	return nil
}

// GroupMessageList replays previous and subscribes to new message events from the group
func (s *service) GroupMessageList(req *bertytypes.GroupMessageList_Request, sub ProtocolService_GroupMessageListServer) error {
	var (
		newEvents            <-chan events.Event
		sentEvents                = map[string]bool{}
		firstReplicatedFound bool = true
	)

	// Get group context / check if the group is opened
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// Check parameters consistency
	if err := checkParametersConsistency(req.SinceID, req.UntilID, req.SinceNow, req.UntilNow, req.ReverseOrder); err != nil {
		return err
	}

	// Subscribe to new message events if requested
	if req.UntilID == nil && !req.UntilNow {
		newEvents = cg.MessageStore().Subscribe(sub.Context())
	}

	listPreviousMessages := func() error {
		var previousEvents <-chan *bertytypes.GroupMessageEvent
		previousEvents, err = cg.MessageStore().ListEvents(sub.Context(), req.SinceID, req.UntilID, req.ReverseOrder)
		if err != nil {
			return err
		}

		for event := range previousEvents {
			if event == nil || sentEvents[string(event.EventContext.ID)] {
				continue
			}

			if err = sub.Send(event); err != nil {
				if sub.Context().Err() == nil {
					cg.logger.Error("error while sending message", zap.Error(err))
				}
				return err
			}

			cg.logger.Info("service - message store - sent 1 event from log history")
			sentEvents[string(event.EventContext.ID)] = true
		}

		return nil
	}

	// Subscribe to previous message events and stream them if requested
	if !req.SinceNow {
		if err := listPreviousMessages(); err != nil {
			return err
		}
		firstReplicatedFound = false
	}

	// Subscribe to new message events and stream them if requested
	if req.UntilID == nil && !req.UntilNow {
		for event := range newEvents {
			if !firstReplicatedFound {
				if _, ok := event.(*stores.EventReplicated); ok {
					if err := listPreviousMessages(); err != nil {
						return err
					}
					firstReplicatedFound = true
					continue
				}
			}

			e, ok := event.(*bertytypes.GroupMessageEvent)
			if !ok || sentEvents[string(e.EventContext.ID)] { // Avoid sending two times the same event
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

			if !firstReplicatedFound {
				sentEvents[string(e.EventContext.ID)] = true
			}

			cg.logger.Info("service - message store - sent 1 event from log subscription")
		}
	}

	return nil
}
