package bertychat

import (
	"context"
	"math/rand"

	"berty.tech/go/pkg/errcode"
)

// Search
func (c *client) Search(*SearchRequest, ChatService_SearchServer) error {

	return errcode.ErrNotImplemented
}

// Event
func (c *client) EventSubscribe(*EventSubscribeRequest, ChatService_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) DevEventSubscribe(*DevEventSubscribeRequest, ChatService_DevEventSubscribeServer) error {
	return errcode.ErrNotImplemented
}

// Conversation
func (c *client) ConversationList(req *ConversationListRequest, stream ChatService_ConversationListServer) error {
	max := rand.Intn(11) + 5 // 5-15
	for i := 0; i < max; i++ {
		conversation := fakeConversation(c.logger)
		err := stream.Send(&ConversationListReply{Conversation: conversation})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}
	return nil
}
func (c *client) ConversationGet(ctx context.Context, req *ConversationGetRequest) (*ConversationGetReply, error) {
	if req == nil {
		return nil, errcode.ErrMissingInput
	}
	return &ConversationGetReply{
		Conversation: fakeConversation(c.logger),
	}, nil
}
func (c *client) ConversationCreate(context.Context, *ConversationCreateRequest) (*ConversationCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationUpdate(context.Context, *ConversationUpdateRequest) (*ConversationUpdateReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationMute(context.Context, *ConversationMuteRequest) (*ConversationMuteReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationLeave(context.Context, *ConversationLeaveRequest) (*ConversationLeaveReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationErase(context.Context, *ConversationEraseRequest) (*ConversationEraseReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationInvitationSend(context.Context, *ConversationInvitationSendRequest) (*ConversationInvitationSendReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationInvitationAccept(context.Context, *ConversationInvitationAcceptRequest) (*ConversationInvitationAcceptReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ConversationInvitationDecline(context.Context, *ConversationInvitationDeclineRequest) (*ConversationInvitationDeclineReply, error) {
	return nil, errcode.ErrNotImplemented
}

// Message
func (c *client) MessageList(*MessageListRequest, ChatService_MessageListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) MessageGet(context.Context, *MessageGetRequest) (*MessageGetReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageSend(context.Context, *MessageSendRequest) (*MessageSendReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageEdit(context.Context, *MessageEditRequest) (*MessageEditReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageHide(context.Context, *MessageHideRequest) (*MessageHideReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageReact(context.Context, *MessageReactRequest) (*MessageReactReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MessageRead(context.Context, *MessageReadRequest) (*MessageReadReply, error) {
	return nil, errcode.ErrNotImplemented
}

// Member
func (c *client) MemberList(*MemberListRequest, ChatService_MemberListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) MemberGet(context.Context, *MemberGetRequest) (*MemberGetReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) MemberUpdate(context.Context, *MemberUpdateRequest) (*MemberUpdateReply, error) {
	return nil, errcode.ErrNotImplemented
}

// Contact
func (c *client) ContactList(*ContactListRequest, ChatService_ContactListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactBlock(context.Context, *ContactBlockRequest) (*ContactBlockReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestSend(context.Context, *ContactRequestSendRequest) (*ContactRequestSendReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestDecline(context.Context, *ContactRequestDeclineRequest) (*ContactRequestDeclineReply, error) {
	return nil, errcode.ErrNotImplemented
}

// Account
func (c *client) AccountList(*AccountListRequest, ChatService_AccountListServer) error {
	return errcode.ErrNotImplemented
}
func (c *client) AccountGet(context.Context, *AccountGetRequest) (*AccountGetReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountCreate(context.Context, *AccountCreateRequest) (*AccountCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountUpdate(context.Context, *AccountUpdateRequest) (*AccountUpdateReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountOpen(context.Context, *AccountOpenRequest) (*AccountOpenReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountClose(context.Context, *AccountCloseRequest) (*AccountCloseReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountRemove(context.Context, *AccountRemoveRequest) (*AccountRemoveReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountPairingInvitationCreate(context.Context, *AccountPairingInvitationCreateRequest) (*AccountPairingInvitationCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) AccountRenewIncomingContactRequestLink(context.Context, *AccountRenewIncomingContactRequestLinkRequest) (*AccountRenewIncomingContactRequestLinkReply, error) {
	return nil, errcode.ErrNotImplemented
}
