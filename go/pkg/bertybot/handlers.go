package bertybot

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

type HandlerType uint

const (
	UnknownHandler HandlerType = iota

	// general events

	ErrorHandler
	PreAnythingHandler
	PostAnythingHandler
	EndOfReplayHandler

	// raw messenger events

	ContactUpdatedHandler
	InteractionUpdatedHandler
	ConversationUpdatedHandler
	AccountUpdatedHandler
	MemberUpdatedHandler
	DeviceUpdatedHandler
	NotificationHandler

	// specialized events

	IncomingContactRequestHandler
	AcceptedContactHandler
	UserMessageHandler
	NewConversationHandler
	CommandHandler
	CommandNotFoundHandler
)

type Handler func(ctx Context)

func (b *Bot) handleEvent(ctx context.Context, event *bertymessenger.StreamEvent) error {
	payload, err := event.UnmarshalPayload()
	if err != nil {
		return fmt.Errorf("unmarshal event payload failed: %w", err)
	}
	context := &Context{
		Context:      ctx,
		EventPayload: payload,
		EventType:    event.Type,
		IsReplay:     b.isReplaying,
		Client:       b.client,
		Logger:       b.logger,
	}

	// raw messenger events
	switch event.Type {
	case bertymessenger.StreamEvent_TypeContactUpdated:
		context.Contact = payload.(*bertymessenger.StreamEvent_ContactUpdated).Contact
		context.ConversationPK = context.Contact.ConversationPublicKey

		// specialized events
		switch context.Contact.State {
		case bertymessenger.Contact_IncomingRequest:
			b.callHandlers(context, IncomingContactRequestHandler)
		case bertymessenger.Contact_Accepted:
			b.callHandlers(context, AcceptedContactHandler)
		default:
			return fmt.Errorf("unsupported contact state: %q", context.Contact.State)
		}
		b.callHandlers(context, ContactUpdatedHandler)

	case bertymessenger.StreamEvent_TypeInteractionUpdated:
		context.Interaction = payload.(*bertymessenger.StreamEvent_InteractionUpdated).Interaction
		context.IsMe = context.Interaction.IsMe
		context.ConversationPK = context.Interaction.ConversationPublicKey
		context.IsAck = context.Interaction.Acknowledged
		payload, err := context.Interaction.UnmarshalPayload()
		if err != nil {
			return fmt.Errorf("unmarshal interaction payload failed: %w", err)
		}

		// specialized events
		switch context.Interaction.Type {
		case bertymessenger.AppMessage_TypeUserMessage:
			receivedMessage := payload.(*bertymessenger.AppMessage_UserMessage)
			context.UserMessage = receivedMessage.GetBody()
			if len(b.commands) > 0 && len(context.UserMessage) > 1 && strings.HasPrefix(context.UserMessage, "/") {
				if !context.IsMe && !context.IsReplay && !context.IsAck {
					context.CommandArgs = strings.Split(context.UserMessage[1:], " ")
					command, found := b.commands[context.CommandArgs[0]]
					if found {
						b.logger.Debug("found handler", zap.Strings("args", context.CommandArgs))
						command.handler(*context)
						b.callHandlers(context, CommandHandler)
					} else {
						b.callHandlers(context, CommandNotFoundHandler)
					}
				}
			}
			b.callHandlers(context, UserMessageHandler)
		default:
			return fmt.Errorf("unsupported interaction type: %q", context.Interaction.Type)
		}
		b.callHandlers(context, InteractionUpdatedHandler)

	case bertymessenger.StreamEvent_TypeConversationUpdated:
		context.Conversation = payload.(*bertymessenger.StreamEvent_ConversationUpdated).Conversation
		context.ConversationPK = context.Conversation.PublicKey
		b.store.mutex.Lock()
		_, found := b.store.conversations[context.ConversationPK]
		if !found {
			b.store.conversations[context.ConversationPK] = context.Conversation
		}
		b.store.mutex.Unlock()
		if !found {
			b.callHandlers(context, NewConversationHandler)
		}
		b.callHandlers(context, ConversationUpdatedHandler)

	case bertymessenger.StreamEvent_TypeDeviceUpdated:
		context.Device = payload.(*bertymessenger.StreamEvent_DeviceUpdated).Device
		b.callHandlers(context, DeviceUpdatedHandler)

	case bertymessenger.StreamEvent_TypeAccountUpdated:
		context.Account = payload.(*bertymessenger.StreamEvent_AccountUpdated).Account
		context.IsMe = true
		b.callHandlers(context, AccountUpdatedHandler)

	case bertymessenger.StreamEvent_TypeMemberUpdated:
		context.Member = payload.(*bertymessenger.StreamEvent_MemberUpdated).Member
		b.callHandlers(context, MemberUpdatedHandler)

	case bertymessenger.StreamEvent_TypeListEnd:
		b.callHandlers(context, EndOfReplayHandler)

	case bertymessenger.StreamEvent_TypeNotified:
		b.callHandlers(context, NotificationHandler)

	default:
		return fmt.Errorf("unsupported event type: %q", event.Type)
	}

	b.callHandlers(context, PostAnythingHandler)
	return nil
}

func (b *Bot) callHandlers(context *Context, typ HandlerType) {
	if b.skipMyself && context.IsMe {
		return
	}
	if b.skipAcknowledge && !context.IsReplay && context.IsAck {
		return
	}

	if !context.initialized {
		context.initialized = true
		b.callHandlers(context, PreAnythingHandler)
	}

	handlers, found := b.handlers[typ]
	if !found {
		return
	}

	copy := *context
	for _, handler := range handlers {
		copy.HandlerType = typ
		handler(copy)
	}
}

func (b *Bot) addHandler(typ HandlerType, handler Handler) {
	if _, found := b.handlers[typ]; !found {
		b.handlers[typ] = make([]Handler, 0)
	}
	b.handlers[typ] = append(b.handlers[typ], handler)
}
