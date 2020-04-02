package bertyprotocol

import (
	"strconv"
	"time"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"go.uber.org/zap"
	"google.golang.org/grpc/metadata"
)

var mdReady = metadata.New(map[string]string{"ready": strconv.FormatBool(true)})

// GroupMetadataSubscribe subscribes to the metadata events for a group
func (s *service) GroupMetadataSubscribe(req *bertytypes.GroupMetadataSubscribe_Request, sub ProtocolService_GroupMetadataSubscribeServer) error {
	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMemberUnknownGroupID.Wrap(err)
	}

	// TODO: replay
	ch := cg.MetadataStore().Subscribe(sub.Context())

	// @FIXME: Wait for subscription to be ready, we should find a way to avoid this
	time.AfterFunc(time.Millisecond*100, func() {
		if err := sub.SendHeader(mdReady.Copy()); err != nil {
			s.logger.Warn("Send header header error", zap.Error(err))
		}
	})

	for evt := range ch {
		e, ok := evt.(*bertytypes.GroupMetadataEvent)
		if !ok {
			continue
		}

		if err := sub.Send(e); err != nil {
			cg.logger.Error("error while sending message", zap.Error(err))
			return err
		}
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

	// @FIXME: Wait for subscription to be ready, we should find a way to avoid this
	time.AfterFunc(time.Millisecond*100, func() {
		if err := sub.SendHeader(mdReady.Copy()); err != nil {
			s.logger.Warn("Send header header error", zap.Error(err))
		}
	})

	for evt := range ch {
		e, ok := evt.(*bertytypes.GroupMessageEvent)
		if !ok {
			continue
		}

		if err := sub.Send(e); err != nil {
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
		if err := sub.Send(evt); err != nil {
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
			cg.logger.Error("error while sending message", zap.Error(err))
		}
	}

	return nil
}
