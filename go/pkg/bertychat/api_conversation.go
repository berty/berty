package bertychat

import (
	"context"
	"fmt"
	"math/rand"

	"berty.tech/go/pkg/chatmodel"
	"berty.tech/go/pkg/errcode"
)

func (c *client) ConversationList(req *ConversationList_Request, stream ChatService_ConversationListServer) error {
	max := rand.Intn(11) + 5 // 5-15
	for i := 0; i < max; i++ {
		conversation := fakeConversation(c.logger)
		err := stream.Send(&ConversationList_Reply{Conversation: conversation})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}
	return nil
}

func (c *client) ConversationGet(ctx context.Context, req *ConversationGet_Request) (*ConversationGet_Reply, error) {
	if req == nil {
		return nil, errcode.ErrMissingInput
	}
	return &ConversationGet_Reply{
		Conversation: fakeConversation(c.logger),
	}, nil
}

func (c *client) ConversationCreate(ctx context.Context, req *ConversationCreate_Request) (*ConversationCreate_Reply, error) {
	if req == nil || req.Title == "" {
		return nil, errcode.TODO.Wrap(fmt.Errorf("invalid input"))
	}

	conversation := chatmodel.Conversation{
		Title:     req.Title,
		Topic:     req.Topic,
		AvatarURI: req.AvatarURI,
	}

	err := c.db.Create(&conversation).Error
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	reply := ConversationCreate_Reply{
		Conversation: &conversation,
	}
	return &reply, nil
}

func (c *client) ConversationUpdate(context.Context, *ConversationUpdate_Request) (*ConversationUpdate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ConversationMute(context.Context, *ConversationMute_Request) (*ConversationMute_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ConversationLeave(context.Context, *ConversationLeave_Request) (*ConversationLeave_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ConversationErase(context.Context, *ConversationErase_Request) (*ConversationErase_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ConversationInvitationSend(context.Context, *ConversationInvitationSend_Request) (*ConversationInvitationSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ConversationInvitationAccept(context.Context, *ConversationInvitationAccept_Request) (*ConversationInvitationAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ConversationInvitationDecline(context.Context, *ConversationInvitationDecline_Request) (*ConversationInvitationDecline_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
