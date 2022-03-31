package bertyprotocol

import (
	"context"
	"errors"
	"fmt"

	"github.com/libp2p/go-eventbus"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
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
func (s *service) GroupMetadataList(req *protocoltypes.GroupMetadataList_Request, sub protocoltypes.ProtocolService_GroupMetadataListServer) error {
	ctx, cancel := context.WithCancel(sub.Context())
	defer cancel()

	// Get group context / check if the group is opened
	cg, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// Check parameters consistency
	if err := checkParametersConsistency(req.SinceID, req.UntilID, req.SinceNow, req.UntilNow, req.ReverseOrder); err != nil {
		return err
	}

	// Subscribe to new metadata events if requested
	var newEvents <-chan interface{}
	if req.UntilID == nil && !req.UntilNow {
		sub, err := cg.MetadataStore().EventBus().Subscribe([]interface{}{
			// new(stores.EventReplicated),
			new(protocoltypes.GroupMetadataEvent),
		}, eventbus.BufSize(32))
		if err != nil {
			return fmt.Errorf("unable to subscribe to new events")
		}
		defer sub.Close()
		newEvents = sub.Out()
	} else {
		noop := make(chan interface{})
		newEvents = noop
		defer close(noop)
	}

	// Subscribe to previous metadata events and stream them if requested
	previousEvents := make(chan protocoltypes.GroupMetadataEvent)
	if !req.SinceNow {
		pevt, err := cg.MetadataStore().ListEvents(ctx, req.SinceID, req.UntilID, req.ReverseOrder)
		if err != nil {
			return err
		}

		go func() {
			for {
				var evt *protocoltypes.GroupMetadataEvent
				select {
				case <-ctx.Done():
					return
				case evt = <-pevt:
				}

				if evt == nil {
					// if we don't want to stream new event, cancel the process
					if req.UntilNow {
						cancel()
					} else {
						previousEvents <- protocoltypes.GroupMetadataEvent{EventContext: nil}
					}

					return
				}

				previousEvents <- *evt
			}
		}()
	}

	// Subscribe to new metadata events and stream them if requested
	for {
		var event interface{}
		select {
		case <-ctx.Done():
			return nil
		case event = <-previousEvents:
		case event = <-newEvents:
		}

		msg := event.(protocoltypes.GroupMetadataEvent)
		if msg.EventContext == nil {
			continue
		}

		if err := sub.Send(&msg); err != nil {
			return err
		}

		cg.logger.Info("service - metadata store - sent 1 event from log subscription")
	}
}

// GroupMessageList replays previous and subscribes to new message events from the group
func (s *service) GroupMessageList(req *protocoltypes.GroupMessageList_Request, sub protocoltypes.ProtocolService_GroupMessageListServer) error {
	ctx, cancel := context.WithCancel(sub.Context())
	defer cancel()

	// Get group context / check if the group is opened
	cg, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// Check parameters consistency
	if err := checkParametersConsistency(req.SinceID, req.UntilID, req.SinceNow, req.UntilNow, req.ReverseOrder); err != nil {
		return err
	}

	// Subscribe to new message events if requested
	var newEvents <-chan interface{}
	if req.UntilID == nil && !req.UntilNow {
		sub, err := cg.MessageStore().EventBus().Subscribe([]interface{}{
			new(protocoltypes.GroupMessageEvent),
		}, eventbus.BufSize(32))
		if err != nil {
			return fmt.Errorf("unable to subscribe to new events")
		}
		defer sub.Close()
		newEvents = sub.Out()
	} else {
		noop := make(chan interface{})
		newEvents = noop
		defer close(noop)
	}

	// Subscribe to previous message events and stream them if requested
	previousEvents := make(chan protocoltypes.GroupMessageEvent)
	if !req.SinceNow {
		pevt, err := cg.MessageStore().ListEvents(ctx, req.SinceID, req.UntilID, req.ReverseOrder)
		if err != nil {
			return err
		}

		go func() {
			for {
				var evt *protocoltypes.GroupMessageEvent
				select {
				case <-ctx.Done():
					return
				case evt = <-pevt:
				}

				if evt == nil {
					// if we don't want to stream new event, cancel the process
					if req.UntilNow {
						cancel()
					} else {
						previousEvents <- protocoltypes.GroupMessageEvent{EventContext: nil}
					}

					return
				}

				previousEvents <- *evt
			}
		}()
	}

	// Subscribe to new message events and stream them if requested
	// listPreviouseMessageDone := false
	for {
		var event interface{}
		select {
		case <-ctx.Done():
			return nil
		case event = <-previousEvents:
		case event = <-newEvents:
		}

		msg := event.(protocoltypes.GroupMessageEvent)
		if msg.EventContext == nil {
			continue
		}

		if err := sub.Send(&msg); err != nil {
			return err
		}

		cg.logger.Info("service - message store - sent 1 event from log subscription")
	}
}
