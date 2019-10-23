package bertychat

import (
	"context"
	"math/rand"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ConversationList(req *ConversationListRequest, stream Account_ConversationListServer) error {
	max := rand.Intn(11) + 5 // 5-15
	for i := 0; i < max; i++ {
		conversation := fakeConversation(c.logger)
		err := stream.Send(&ConversationListReply{Conversation: conversation})
		if err != nil {
			return errcode.ChatTODO.Wrap(err)
		}
	}
	return nil
}

func (c *client) ConversationGet(ctx context.Context, input *ConversationGetRequest) (*ConversationGetReply, error) {
	if input == nil || input.ID == "" {
		return nil, errcode.ErrChatMissingInput
	}
	if input.ID == "invalid" { // simulating an invalid ID (tmp)
		return nil, errcode.ErrChatInvalidInput
	}
	return &ConversationGetReply{
		Conversation: fakeConversation(c.logger),
	}, nil
}

func (c *client) ConversationCreate(context.Context, *ConversationCreateRequest) (*ConversationCreateReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationLeave(context.Context, *ConversationLeaveRequest) (*ConversationLeaveReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationErase(context.Context, *ConversationEraseRequest) (*ConversationEraseReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationSetSeenPosition(context.Context, *ConversationSetSeenPositionRequest) (*ConversationSetSeenPositionReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationUpdateSettings(context.Context, *ConversationUpdateSettingsRequest) (*ConversationUpdateSettingsReply, error) {
	return nil, errcode.ErrChatNotImplemented
}
