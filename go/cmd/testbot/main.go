package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"os"
	"os/user"

	qrterminal "github.com/mdp/qrterminal/v3"
	"go.uber.org/zap"
	"moul.io/srand"
	"moul.io/u"
	"moul.io/zapconfig"

	"berty.tech/berty/v2/go/pkg/bertybot"
	"berty.tech/berty/v2/go/pkg/bertyversion"
)

var (
	nodeAddr    = flag.String("addr", "127.0.0.1:9091", "remote 'berty daemon' address")
	displayName = flag.String("display-name", safeDefaultDisplayName(), "bot's display name")
	debug       = flag.Bool("debug", false, "debug mode")
	skipReplay  = flag.Bool("skip-replay", true, "skip replay")
	replyDelay  = flag.Duration("reply-delay", 0, "reply delay")
)

func main() {
	flag.Parse()
	rand.Seed(srand.MustSecure())
	if err := Main(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

func Main() error {
	rootLogger := zapconfig.Configurator{}.MustBuildLogger()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	logger := rootLogger.Named("testbot")

	// init bot
	opts := []bertybot.NewOption{}
	opts = append(opts,
		bertybot.WithLogger(logger.Named("botlib")),                              // configure a logger
		bertybot.WithDisplayName(*displayName),                                   // bot name
		bertybot.WithInsecureMessengerGRPCAddr(*nodeAddr),                        // connect to running berty messenger daemon
		bertybot.WithSkipAcknowledge(),                                           // skip acknowledge events
		bertybot.WithSkipMyself(),                                                // skip my own interactions
		bertybot.WithRecipe(bertybot.DelayResponseRecipe(*replyDelay)),           // add a delay before sending replies
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingContactRequestRecipe()),   // accept incoming contact requests
		bertybot.WithRecipe(bertybot.WelcomeMessageRecipe("welcome to testbot")), // send welcome message to new contacts and new conversations
		bertybot.WithRecipe(bertybot.EchoRecipe("you said: ")),                   // reply to messages with the same message
		bertybot.WithCommand("version", "show version", func(ctx bertybot.Context) {
			_ = ctx.ReplyString("version: " + bertyversion.Version)
		}),
	)
	if *skipReplay {
		opts = append(opts, bertybot.WithSkipReplay()) // skip old events, only consume fresh ones
	}
	if *debug {
		opts = append(opts, bertybot.WithRecipe(bertybot.DebugEventRecipe(rootLogger.Named("debug")))) // debug events
	}
	bot, err := bertybot.New(opts...)
	if err != nil {
		return fmt.Errorf("bot initialization failed: %w", err)
	}
	// display link and qr code
	logger.Info("retrieve instance Berty ID",
		zap.String("pk", bot.PublicKey()),
		zap.String("link", bot.BertyIDURL()),
	)
	qrterminal.GenerateHalfBlock(bot.BertyIDURL(), qrterminal.L, os.Stdout)

	// signal handling
	go func() {
		u.WaitForCtrlC()
		cancel()
	}()

	// start bot
	return bot.Start(ctx)
}

func safeDefaultDisplayName() string {
	var name string
	current, err := user.Current()
	if err == nil {
		name = current.Username
	}
	if name == "" {
		name = os.Getenv("USER")
	}
	if name == "" {
		name = "anon"
	}
	return fmt.Sprintf("%s (testbot)", name)
}
