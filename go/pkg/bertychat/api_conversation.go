package bertychat

import (
	"context"
	"math/rand"

	"berty.tech/go/internal/chaterrcode"
)

func (c *client) ConversationList(req *ConversationListRequest, stream Account_ConversationListServer) error {
	max := rand.Intn(11) + 5 // 5-15
	for i := 0; i < max; i++ {
		conversation := fakeConversation(c.logger)
		err := stream.Send(&ConversationListReply{Conversation: conversation})
		if err != nil {
			return chaterrcode.TODO.Wrap(err)
		}
	}
	return nil
}

func (c *client) ConversationGet(ctx context.Context, input *ConversationGetRequest) (*ConversationGetReply, error) {
	if input == nil || input.ID == "" {
		return nil, chaterrcode.ErrMissingInput
	}
	if input.ID == "invalid" { // simulating an invalid ID (tmp)
		return nil, chaterrcode.ErrInvalidInput
	}
	return &ConversationGetReply{
		Conversation: fakeConversation(c.logger),
	}, nil
}

func (c *client) ConversationCreate(context.Context, *ConversationCreateRequest) (*ConversationCreateReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationLeave(context.Context, *ConversationLeaveRequest) (*ConversationLeaveReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationErase(context.Context, *ConversationEraseRequest) (*ConversationEraseReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationSetSeenPosition(context.Context, *ConversationSetSeenPositionRequest) (*ConversationSetSeenPositionReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationUpdateSettings(context.Context, *ConversationUpdateSettingsRequest) (*ConversationUpdateSettingsReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}
