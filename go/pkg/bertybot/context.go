package bertybot

import (
	"context"
	"fmt"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

// Context is the main argument passed to handlers.
type Context struct {
	// common
	HandlerType  HandlerType
	EventPayload proto.Message `json:"-"` // content of the payload is already available in the parsed payloads
	EventType    bertymessenger.StreamEvent_Type
	Context      context.Context
	Client       bertymessenger.MessengerServiceClient
	Logger       *zap.Logger
	IsReplay     bool // whether the event is a replayed or a fresh event
	IsMe         bool // whether the bot is the author
	IsAck        bool // whether the event is an ack

	// parsed payloads, depending on the context
	Contact        *bertymessenger.Contact      `json:"Contact,omitempty"`
	Conversation   *bertymessenger.Conversation `json:"Conversation,omitempty"`
	Interaction    *bertymessenger.Interaction  `json:"Interaction,omitempty"`
	Member         *bertymessenger.Member       `json:"Member,omitempty"`
	Account        *bertymessenger.Account      `json:"Account,omitempty"`
	Device         *bertymessenger.Device       `json:"Device,omitempty"`
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
	userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{Body: text})
	if err != nil {
		return fmt.Errorf("marshal user message failed: %w", err)
	}
	_, err = ctx.Client.Interact(ctx.Context, &bertymessenger.Interact_Request{
		Type:                  bertymessenger.AppMessage_TypeUserMessage,
		Payload:               userMessage,
		ConversationPublicKey: ctx.ConversationPK,
	})
	if err != nil {
		return fmt.Errorf("interact failed: %w", err)
	}
	return nil
}
