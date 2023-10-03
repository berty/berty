package bertybot

import (
	"strings"
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/pkg/logutil"
)

// Recipe is a set of handlers that performs common behaviors.
type Recipe map[HandlerType][]Handler

// AutoAcceptIncomingContactRequestRecipe makes the bot "click" on the "accept" button automatically.
func AutoAcceptIncomingContactRequestRecipe() Recipe {
	recipe := map[HandlerType][]Handler{}
	recipe[IncomingContactRequestHandler] = []Handler{
		func(ctx Context) {
			ctx.Logger.Info("auto-accepting incoming contact request", zap.Any("contact", ctx.Contact))
			req := &messengertypes.ContactAccept_Request{
				PublicKey: ctx.Contact.PublicKey,
			}
			_, err := ctx.Client.ContactAccept(ctx.Context, req)
			if err != nil {
				ctx.Logger.Error("contact accept failed", zap.Error(err))
			}
		},
	}
	return recipe
}

// DebugEventRecipe logs every event using zap.DebugLevel.
func DebugEventRecipe(logger *zap.Logger) Recipe {
	recipe := map[HandlerType][]Handler{}
	recipe[PreAnythingHandler] = []Handler{
		func(ctx Context) {
			if logger == nil { // if no logger is passed, use the bot's one
				logger = ctx.Logger
			}
			logger.Debug("new event",
				zap.Stringer("type", ctx.EventType),
				zap.Any("context", ctx),
			)
		},
	}
	return recipe
}

// WelcomeMessageRecipe automatically sends a text message to new contacts.
func WelcomeMessageRecipe(text string) Recipe {
	recipe := map[HandlerType][]Handler{}
	if text == "" {
		return recipe
	}
	// send welcome message to new contacts
	recipe[NewConversationHandler] = []Handler{
		func(ctx Context) {
			// skip old events
			if ctx.IsReplay {
				return
			}
			time.Sleep(time.Second) // I don't know why, but this is required :/
			ctx.Logger.Info("sending welcome message",
				logutil.PrivateString("text", text),
				logutil.PrivateString("conversation", ctx.ConversationPK),
			)
			err := ctx.ReplyString(text)
			if err != nil {
				ctx.Logger.Error("reply failed", zap.Error(err))
			}
		},
	}
	return recipe
}

// EchoRecipe configures the bot to automatically reply any message with the same message.
// If a prefix is specified, the bot will prefix its response.
// If a prefix is specified, the bot will ignore incoming messages with that prefix (i.e., a conversation with multiple echo bots).
// The bot will skip incoming commands (messages starting with a '/').
func EchoRecipe(prefix string) Recipe {
	recipe := map[HandlerType][]Handler{}
	recipe[UserMessageHandler] = []Handler{
		func(ctx Context) {
			// skip old events
			if ctx.IsReplay {
				return
			}
			// do not reply to myself
			if ctx.IsMine {
				return
			}
			// avoid bot loops
			if strings.HasPrefix(ctx.UserMessage, prefix) {
				return
			}
			// ignore commands
			if strings.HasPrefix(ctx.UserMessage, "/") {
				return
			}
			// to avoid replying twice, only reply on the unacked message
			if ctx.Interaction.Acknowledged {
				return
			}

			msg := prefix + ctx.UserMessage
			ctx.Logger.Info("echo replying", logutil.PrivateString("text", msg), logutil.PrivateString("conversation", ctx.ConversationPK))
			err := ctx.ReplyString(msg)
			if err != nil {
				ctx.Logger.Error("reply failed", zap.Error(err))
			}
		},
	}
	return recipe
}

// DelayResponseRecipe will wait for the specified duration before handling an event.
func DelayResponseRecipe(duration time.Duration) Recipe {
	recipe := map[HandlerType][]Handler{}
	recipe[PreAnythingHandler] = []Handler{
		func(ctx Context) {
			// skip old events
			if ctx.IsReplay {
				return
			}
			time.Sleep(duration)
		},
	}
	return recipe
}

type AutoAcceptIncomingGroupInviteOpts struct {
	ConfirmationMessage string
}

// AutoAcceptIncomingGroupInviteRecipe makes the bot "click" on the "join" button automatically.
func AutoAcceptIncomingGroupInviteRecipe(opts *AutoAcceptIncomingGroupInviteOpts) Recipe {
	if opts == nil {
		opts = &AutoAcceptIncomingGroupInviteOpts{
			ConfirmationMessage: "I'll join asap!",
		}
	}
	recipe := map[HandlerType][]Handler{}
	recipe[IncomingGroupInvitationHandler] = []Handler{
		func(ctx Context) {
			if opts.ConfirmationMessage != "" {
				err := ctx.ReplyString(opts.ConfirmationMessage)
				ctx.Logger.Error("reply failed", zap.Error(err))
				// continue
			}
			payload, err := ctx.Interaction.UnmarshalPayload()
			if err != nil {
				ctx.Logger.Error("parse payload", zap.Error(err))
				return
			}

			inviteLink := payload.(*messengertypes.AppMessage_GroupInvitation).Link
			ctx.Logger.Info("auto-joining incoming group", zap.String("link", inviteLink))
			req := messengertypes.ConversationJoin_Request{Link: inviteLink}
			_, err = ctx.Client.ConversationJoin(ctx.Context, &req)
			if err != nil {
				ctx.Logger.Error("failed to join group", zap.Error(err))
			}
		},
	}
	return recipe
}

// SendErrorToClientRecipe will send internal errors to the related context (a contact or a conversation).
// NOT YET IMPLEMENTED.
func SendErrorToClientRecipe() Recipe {
	panic("not implemented")
}
