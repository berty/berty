package bertybot

import (
	"context"
	"testing"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func TestFlappyBotCommunication(t *testing.T) {
	testutil.FilterStability(t, testutil.Flappy)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	clients, _, cleanup := bertymessenger.TestingInfra(ctx, t, 2, logger)
	defer cleanup()

	botClient, userClient := clients[0], clients[1]

	var commandCalled bool

	// create bot
	var bot *Bot
	{
		botLogger := logger.Named("botlib")
		var err error
		bot, err = New(
			WithLogger(botLogger),
			WithMessengerClient(botClient),
			WithRecipe(DebugEventRecipe(botLogger)),
			WithRecipe(AutoAcceptIncomingContactRequestRecipe()),
			WithRecipe(EchoRecipe("hello ")),
			WithCommand("ping", "reply pong", func(ctx Context) {
				ctx.ReplyString("pong")
				commandCalled = true
			}),
		)
		require.NoError(t, err)
	}

	go func() {
		err := bot.Start(ctx)
		if err != nil {
			require.Contains(t, err.Error(), "is closing") // FIXME: better closing handling
		}
	}()

	// enable contact request on client
	{
		_, err := userClient.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{})
		require.NoError(t, err)
		time.Sleep(200 * time.Millisecond) // FIXME: replace with dynamic waiting
	}

	// send contact request
	{
		parsed, err := botClient.ParseDeepLink(ctx, &messengertypes.ParseDeepLink_Request{Link: bot.BertyIDURL()})
		require.NoError(t, err)
		_, err = userClient.SendContactRequest(ctx, &messengertypes.SendContactRequest_Request{
			BertyID: parsed.GetLink().GetBertyID(),
		})
		require.NoError(t, err)
		time.Sleep(200 * time.Millisecond) // FIXME: replace with dynamic waiting
	}

	require.Len(t, bot.store.conversations, 1)

	// get the conversation
	var theConv *messengertypes.Conversation
	{
		for _, conv := range bot.store.conversations {
			theConv = conv
		}
	}

	// send 'world!'
	{
		userMessage, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{Body: "world!"})
		require.NoError(t, err)
		req := &messengertypes.Interact_Request{
			Type:                  messengertypes.AppMessage_TypeUserMessage,
			Payload:               userMessage,
			ConversationPublicKey: theConv.PublicKey,
		}
		_, err = userClient.Interact(ctx, req)
		require.NoError(t, err)
		time.Sleep(200 * time.Millisecond) // FIXME: replace with dynamic waiting
	}

	// send /ping
	{
		userMessage, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{Body: "/ping"})
		require.NoError(t, err)
		req := &messengertypes.Interact_Request{
			Type:                  messengertypes.AppMessage_TypeUserMessage,
			Payload:               userMessage,
			ConversationPublicKey: theConv.PublicKey,
		}
		_, err = userClient.Interact(ctx, req)
		require.NoError(t, err)
		time.Sleep(200 * time.Millisecond) // FIXME: replace with dynamic waiting
	}

	require.True(t, commandCalled)
}
