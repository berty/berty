package bertybot

import (
	"fmt"
	"sort"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

// NewOption can be passed to the `New` function to configure the bot.
type NewOption func(*Bot) error

// WithMessengerClient passes an already initialized messenger client.
func WithMessengerClient(client bertymessenger.MessengerServiceClient) NewOption {
	return func(b *Bot) error {
		b.client = client
		return nil
	}
}

// WithMessengerGRPCConn configures a new Messenger client from an already initialized gRPC connection.
func WithMessengerGRPCConn(cc *grpc.ClientConn) NewOption {
	return func(b *Bot) error {
		b.client = bertymessenger.NewMessengerServiceClient(cc)
		return nil
	}
}

// WithInsecureMessengerGRPCAddr tries to open a new gRPC connection against the passed TCP address.
// It uses grpc.WithInsecure as dialer option and won't check any certificate.
func WithInsecureMessengerGRPCAddr(addr string) NewOption {
	return func(b *Bot) error {
		cc, err := grpc.Dial(addr, grpc.WithInsecure())
		if err != nil {
			return fmt.Errorf("dial error: %w", err)
		}
		b.client = bertymessenger.NewMessengerServiceClient(cc)
		return nil
	}
}

// WithLogger passes a configured zap Logger.
func WithLogger(logger *zap.Logger) NewOption {
	return func(b *Bot) error {
		b.logger = logger
		return nil
	}
}

// WithDisplayName sets the name of the bot, by default, the name will be named "My Berty Bot".
func WithDisplayName(name string) NewOption {
	return func(b *Bot) error {
		b.displayName = name
		return nil
	}
}

// WithSkipReplay will ignore all events that were already processed before starting to listen to Messenger events.
func WithSkipReplay() NewOption {
	return func(b *Bot) error {
		b.skipReplay = true
		return nil
	}
}

// WithHandler append a new Handler for the specified HandlerType.
func WithHandler(typ HandlerType, handler Handler) NewOption {
	return func(b *Bot) error {
		b.addHandler(typ, handler)
		return nil
	}
}

// WithRecipe configures the passed recipe.
func WithRecipe(recipe Recipe) NewOption {
	return func(b *Bot) error {
		for typ, handlers := range recipe {
			for _, handler := range handlers {
				b.addHandler(typ, handler)
			}
		}
		return nil
	}
}

// WithSkipAcknowledge disables sending Acknowledge events.
func WithSkipAcknowledge() NewOption {
	return func(b *Bot) error {
		b.skipAcknowledge = true
		return nil
	}
}

// WithSkipMyself disables sending events sent by myself.
func WithSkipMyself() NewOption {
	return func(b *Bot) error {
		b.skipMyself = true
		return nil
	}
}

// WithCommand registers a new command that can be called with the '/' prefix.
// If name was already used, the preview command is replaced by the new one.
func WithCommand(name, description string, handler CommandFn) NewOption {
	return func(b *Bot) error {
		b.commands[name] = command{
			name:        name,
			description: description,
			handler:     handler,
		}
		if _, found := b.commands["help"]; !found {
			b.commands["help"] = command{
				name:        "help",
				description: "show this help",
				handler: func(ctx Context) {
					lines := []string{}
					for _, command := range b.commands {
						lines = append(lines, fmt.Sprintf("  /%-20s %s", command.name, command.description))
					}
					sort.Strings(lines)
					msg := "Available commands:\n" + strings.Join(lines, "\n")
					_ = ctx.ReplyString(msg)
					// FIXME: submit suggestions
				},
			}
		}
		return nil
	}
}
