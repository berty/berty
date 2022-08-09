package bertybot

import (
	"context"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type Bot struct {
	client            messengertypes.MessengerServiceClient
	logger            *zap.Logger
	displayName       string
	bertyID           *messengertypes.InstanceShareableBertyID_Reply
	withReplay        bool
	withFromMyself    bool
	withEntityUpdates bool
	handlers          map[HandlerType][]Handler
	isReplaying       bool
	handledEvents     uint
	commands          map[string]command
	store             struct {
		conversations map[string]*messengertypes.Conversation
		mutex         sync.Mutex
	}
}

// New initializes a new Bot.
// The order of the passed options may have an impact.
func New(opts ...NewOption) (*Bot, error) {
	b := Bot{
		logger:   zap.NewNop(),
		handlers: make(map[HandlerType][]Handler),
		commands: make(map[string]command),
	}
	b.store.conversations = make(map[string]*messengertypes.Conversation)

	// configure bot with options
	for _, opt := range opts {
		if err := opt(&b); err != nil {
			return nil, fmt.Errorf("bot: opt failed: %w", err)
		}
	}

	// check minimal requirements
	if b.client == nil {
		return nil, fmt.Errorf("bot: missing messenger client")
	}

	// apply defaults
	if b.displayName == "" {
		b.displayName = "My Berty Bot"
	}

	// retrieve Berty ID to check if everything is well configured, and cache it for easy access
	{
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		req := &messengertypes.InstanceShareableBertyID_Request{
			DisplayName: b.displayName,
		}
		ret, err := b.client.InstanceShareableBertyID(ctx, req)
		if err != nil {
			return nil, fmt.Errorf("bot: cannot retrieve berty ID: %w", err)
		}
		b.bertyID = ret
	}

	return &b, nil
}

// BertyIDURL returns the shareable Berty ID in the form of `https://berty.tech/id#xxx`.
func (b *Bot) BertyIDURL() string {
	return b.bertyID.WebURL
}

// PublicKey returns the public key of the messenger node.
func (b *Bot) PublicKey() string {
	return u.B64Encode(b.bertyID.Link.BertyID.AccountPK)
}

// Start starts the main event loop and can be stopped by canceling the passed context.
func (b *Bot) Start(ctx context.Context) error {
	b.logger.Info("connecting to the event stream")
	s, err := b.client.EventStream(ctx, &messengertypes.EventStream_Request{})
	if err != nil {
		return fmt.Errorf("failed to listen to EventStream: %w", err)
	}

	b.isReplaying = true
	for {
		gme, err := s.Recv()
		if err != nil {
			return fmt.Errorf("stream error: %w", err)
		}

		if b.isReplaying {
			if gme.Event.Type == messengertypes.StreamEvent_TypeListEnded {
				b.logger.Info("finished replaying logs from the previous sessions", zap.Uint("count", b.handledEvents))
				b.isReplaying = false
			}
			b.handledEvents++

			if !b.withReplay {
				continue
			}
		}

		if err := b.handleEvent(ctx, gme.Event); err != nil {
			b.logger.Error("bot.handleEvent failed", zap.Error(err))
		}
	}
}
