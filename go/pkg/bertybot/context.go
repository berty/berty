package bertybot

import (
	"context"
	"fmt"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// Context is the main argument passed to handlers.
type Context struct {
	// common
	HandlerType  HandlerType
	EventPayload proto.Message `json:"-"` // content of the payload is already available in the parsed payloads
	EventType    messengertypes.StreamEvent_Type
	Context      context.Context
	Client       messengertypes.MessengerServiceClient
	Logger       *zap.Logger
	IsReplay     bool // whether the event is a replayed or a fresh event
	IsMine       bool // whether the bot is the author
	IsAck        bool // whether the event is an ack
	IsNew        bool // whether the event is new or an entity update

	// parsed payloads, depending on the context
	Contact        *messengertypes.Contact      `json:"Contact,omitempty"`
	Conversation   *messengertypes.Conversation `json:"Conversation,omitempty"`
	Interaction    *messengertypes.Interaction  `json:"Interaction,omitempty"`
	Member         *messengertypes.Member       `json:"Member,omitempty"`
	Account        *messengertypes.Account      `json:"Account,omitempty"`
	Device         *messengertypes.Device       `json:"Device,omitempty"`
	ConversationPK string                       `json:"ConversationPK,omitempty"`
	UserMessage    string                       `json:"UserMessage,omitempty"`
	CommandArgs    []string

	// internal
	initialized bool
}

// ReplyString sends a text message on the conversation related to the context.
// The conversation can be 1-1 or multi-member.
func (ctx *Context) ReplyString(text string) error {
	if ctx.ConversationPK == "" {
		return fmt.Errorf("unknown conversation PK, cannot reply")
	}
	// FIXME: support group conversation
	userMessage, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{Body: text})
	if err != nil {
		return fmt.Errorf("marshal user message failed: %w", err)
	}
	_, err = ctx.Client.Interact(ctx.Context, &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               userMessage,
		ConversationPublicKey: ctx.ConversationPK,
	})
	if err != nil {
		return fmt.Errorf("interact failed: %w", err)
	}
	return nil
}
