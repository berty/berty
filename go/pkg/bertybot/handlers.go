package bertybot

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/messengertypes"
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

func (b *Bot) handleEvent(ctx context.Context, event *messengertypes.StreamEvent) error {
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
		IsNew:        event.IsNew,
	}

	// raw messenger events
	switch event.Type {
	case messengertypes.StreamEvent_TypeContactUpdated:
		context.Contact = payload.(*messengertypes.StreamEvent_ContactUpdated).Contact
		context.ConversationPK = context.Contact.ConversationPublicKey

		// specialized events
		switch context.Contact.State {
		case messengertypes.Contact_IncomingRequest:
			b.callHandlers(context, IncomingContactRequestHandler)
		case messengertypes.Contact_Accepted:
			b.callHandlers(context, AcceptedContactHandler)
		default:
			return fmt.Errorf("unsupported contact state: %q", context.Contact.State)
		}
		b.callHandlers(context, ContactUpdatedHandler)

	case messengertypes.StreamEvent_TypeInteractionUpdated:
		context.Interaction = payload.(*messengertypes.StreamEvent_InteractionUpdated).Interaction
		context.IsMine = context.Interaction.IsMine
		context.ConversationPK = context.Interaction.ConversationPublicKey
		context.IsAck = context.Interaction.Acknowledged
		payload, err := context.Interaction.UnmarshalPayload()
		if err != nil {
			return fmt.Errorf("unmarshal interaction payload failed: %w", err)
		}

		// specialized events
		switch context.Interaction.Type {
		case messengertypes.AppMessage_TypeUserMessage:
			receivedMessage := payload.(*messengertypes.AppMessage_UserMessage)
			context.UserMessage = receivedMessage.GetBody()
			if len(b.commands) > 0 && len(context.UserMessage) > 1 && strings.HasPrefix(context.UserMessage, "/") {
				if !context.IsMine && !context.IsReplay && !context.IsAck {
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

	case messengertypes.StreamEvent_TypeConversationUpdated:
		context.Conversation = payload.(*messengertypes.StreamEvent_ConversationUpdated).Conversation
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

	case messengertypes.StreamEvent_TypeDeviceUpdated:
		context.Device = payload.(*messengertypes.StreamEvent_DeviceUpdated).Device
		b.callHandlers(context, DeviceUpdatedHandler)

	case messengertypes.StreamEvent_TypeAccountUpdated:
		context.Account = payload.(*messengertypes.StreamEvent_AccountUpdated).Account
		context.IsMine = true
		b.callHandlers(context, AccountUpdatedHandler)

	case messengertypes.StreamEvent_TypeMemberUpdated:
		context.Member = payload.(*messengertypes.StreamEvent_MemberUpdated).Member
		b.callHandlers(context, MemberUpdatedHandler)

	case messengertypes.StreamEvent_TypeListEnded:
		b.callHandlers(context, EndOfReplayHandler)

	case messengertypes.StreamEvent_TypeNotified:
		b.callHandlers(context, NotificationHandler)

	default:
		return fmt.Errorf("unsupported event type: %q", event.Type)
	}

	b.callHandlers(context, PostAnythingHandler)
	return nil
}

func (b *Bot) callHandlers(context *Context, typ HandlerType) {
	if !b.withFromMyself && context.IsMine {
		return
	}
	if !b.withEntityUpdates && !context.IsNew {
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
