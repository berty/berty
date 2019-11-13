package bertychat

import (
	"context"
	"math/rand"

	"berty.tech/go/pkg/errcode"
)

// Search
func (c *client) Search(*Search_Request, ChatService_SearchServer) error {
	return errcode.ErrNotImplemented
}

// Event
func (c *client) EventSubscribe(*EventSubscribe_Request, ChatService_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) DevEventSubscribe(*DevEventSubscribe_Request, ChatService_DevEventSubscribeServer) error {
	return errcode.ErrNotImplemented
}

// Conversation
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
func (c *client) ConversationCreate(context.Context, *ConversationCreate_Request) (*ConversationCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
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

// Message
func (c *client) MessageList(*MessageList_Request, ChatService_MessageListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) MessageGet(context.Context, *MessageGet_Request) (*MessageGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageSend(context.Context, *MessageSend_Request) (*MessageSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageEdit(context.Context, *MessageEdit_Request) (*MessageEdit_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageHide(context.Context, *MessageHide_Request) (*MessageHide_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageReact(context.Context, *MessageReact_Request) (*MessageReact_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageRead(context.Context, *MessageRead_Request) (*MessageRead_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// Member
func (c *client) MemberList(*MemberList_Request, ChatService_MemberListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) MemberGet(context.Context, *MemberGet_Request) (*MemberGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// Contact
func (c *client) ContactList(*ContactList_Request, ChatService_ContactListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) ContactGet(context.Context, *ContactGet_Request) (*ContactGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactBlock(context.Context, *ContactBlock_Request) (*ContactBlock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRemove(context.Context, *ContactRemove_Request) (*ContactRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestSend(context.Context, *ContactRequestSend_Request) (*ContactRequestSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestAccept(context.Context, *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestDecline(context.Context, *ContactRequestDecline_Request) (*ContactRequestDecline_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// Account
func (c *client) AccountList(*AccountList_Request, ChatService_AccountListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) AccountGet(context.Context, *AccountGet_Request) (*AccountGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountCreate(context.Context, *AccountCreate_Request) (*AccountCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountUpdate(context.Context, *AccountUpdate_Request) (*AccountUpdate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountOpen(context.Context, *AccountOpen_Request) (*AccountOpen_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountClose(context.Context, *AccountClose_Request) (*AccountClose_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountRemove(context.Context, *AccountRemove_Request) (*AccountRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountPairingInvitationCreate(context.Context, *AccountPairingInvitationCreate_Request) (*AccountPairingInvitationCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountRenewIncomingContactRequestLink(context.Context, *AccountRenewIncomingContactRequestLink_Request) (*AccountRenewIncomingContactRequestLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
