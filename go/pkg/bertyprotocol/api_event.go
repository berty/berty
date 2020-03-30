package bertyprotocol

import (
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

// GroupMetadataSubscribe subscribes to the metadata events for a group
func (s *service) GroupMetadataSubscribe(req *bertytypes.GroupMetadataSubscribe_Request, sub ProtocolService_GroupMetadataSubscribeServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// TODO: replay
	ch := cg.MetadataStore().Subscribe(sub.Context())
	for evt := range ch {
		e, ok := evt.(*bertytypes.GroupMetadataEvent)
		if !ok {
			continue
		}

		// TODO: log if error
		err := sub.Send(e)
		_ = err
	}

	return nil
}

// GroupMessageSubscribe subscribes to the message events for a group
func (s *service) GroupMessageSubscribe(req *bertytypes.GroupMessageSubscribe_Request, sub ProtocolService_GroupMessageSubscribeServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// TODO: replay
	ch := cg.MessageStore().Subscribe(sub.Context())
	for evt := range ch {
		e, ok := evt.(*bertytypes.GroupMessageEvent)
		if !ok {
			continue
		}

		// TODO: log if error
		err := sub.Send(e)
		_ = err
	}

	return nil
}

func (s *service) GroupMetadataList(req *bertytypes.GroupMetadataList_Request, sub ProtocolService_GroupMetadataListServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	for evt := range cg.MetadataStore().ListEvents(sub.Context()) {
		err = sub.Send(evt)
		if err != nil {
			// TODO: log
			_ = err
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
		err = sub.Send(evt)
		if err != nil {
			// TODO: log
			_ = err
		}
	}

	return nil
}
