package bertybot_test

import (
	"context"
	"os"
	"time"

	qrterminal "github.com/mdp/qrterminal/v3"
	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/pkg/bertybot"
)

func Example() {
	logger, _ := zap.NewDevelopment()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// init bot
	bot, _ := bertybot.New(
		bertybot.WithLogger(logger.Named("botlib")),                                  // configure a logger
		bertybot.WithDisplayName("example bot"),                                      // bot name
		bertybot.WithInsecureMessengerGRPCAddr("127.0.0.1:9091"),                     // connect to running berty messenger daemon
		bertybot.WithReplay(),                                                        // replay old events as if they are just happening
		bertybot.WithEntityUpdates(),                                                 // include entity updates; i.e., acknowledge
		bertybot.WithFromMyself(),                                                    // trigger hooks for events authored by the bot itself
		bertybot.WithRecipe(bertybot.DebugEventRecipe(logger.Named("debug"))),        // debug events
		bertybot.WithRecipe(bertybot.DelayResponseRecipe(time.Second)),               // add a delay before sending replies
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingContactRequestRecipe()),       // accept incoming contact requests
		bertybot.WithRecipe(bertybot.WelcomeMessageRecipe("welcome to example bot")), // send welcome message to new contacts and new conversations
		bertybot.WithRecipe(bertybot.EchoRecipe("you said: ")),                       // reply to messages with the same message
		bertybot.WithHandler(bertybot.UserMessageHandler, func(ctx bertybot.Context) { // custom handler
			ctx.ReplyString("hello world!")
		}),
	)

	// display link and qr code
	logger.Info("retrieve instance Berty ID", zap.String("pk", bot.PublicKey()), zap.String("link", bot.BertyIDURL()))
	qrterminal.GenerateHalfBlock(bot.BertyIDURL(), qrterminal.L, os.Stdout)

	// signal handling
	go func() {
		u.WaitForCtrlC()
		cancel()
	}()

	// start bot
	bot.Start(ctx)
}
