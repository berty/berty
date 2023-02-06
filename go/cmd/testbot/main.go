package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"syscall"

	qrterminal "github.com/mdp/qrterminal/v3"
	"github.com/oklog/run"
	"go.uber.org/zap"
	"moul.io/srand"
	"moul.io/u"
	"moul.io/zapconfig"

	"berty.tech/berty/v2/go/pkg/bertybot"
	"berty.tech/berty/v2/go/pkg/bertyversion"
)

var (
	username     = u.CurrentUsername("anon")
	node1Addr    = flag.String("addr1", "127.0.0.1:9091", "first remote 'berty daemon' address")
	node2Addr    = flag.String("addr2", "127.0.0.1:9092", "second remote 'berty daemon' address")
	displayName1 = flag.String("name1", username+" (testbot1)", "first bot's display name")
	displayName2 = flag.String("name2", username+" (testbot2)", "second bot's display name")
	debug        = flag.Bool("debug", false, "debug mode")
	logFormat    = flag.String("log-format", "console", strings.Join(zapconfig.AvailablePresets, ", "))
)

func main() {
	flag.Parse()
	rand.Seed(srand.MustSecure())
	if err := Main(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

type TestBot struct {
	Bot1, Bot2 *bertybot.Bot
	ctx        context.Context
	logger     *zap.Logger
}

func Main() error {
	config := zapconfig.Configurator{}
	config.SetPreset(*logFormat)
	logger := config.MustBuild()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// init testbot
	testbot := &TestBot{ctx: ctx, logger: logger}
	if err := testbot.InitBot1(); err != nil {
		return fmt.Errorf("init bot 1: %w", err)
	}
	if err := testbot.InitBot2(); err != nil {
		return fmt.Errorf("init bot 2: %w", err)
	}

	// FIXME: bot1 and bot2 should be contact

	// start testbot
	var g run.Group
	g.Add(func() error { return testbot.Bot1.Start(ctx) }, func(error) { cancel() })
	g.Add(func() error { return testbot.Bot2.Start(ctx) }, func(error) { cancel() })
	g.Add(run.SignalHandler(ctx, syscall.SIGKILL))
	return g.Run()
}

func (testbot *TestBot) VersionCommand(ctx bertybot.Context) {
	_ = ctx.ReplyString("version: " + bertyversion.Version)
	// FIXME: also returns the version of the remote messenger and protocol
}

// InitBot1 initializes the entrypoint bot
func (testbot *TestBot) InitBot1() error {
	logger := testbot.logger.Named("bot1")

	// init bot
	opts := []bertybot.NewOption{}
	opts = append(opts,
		bertybot.WithLogger(logger.Named("lib")),                                  // configure a logger
		bertybot.WithDisplayName(*displayName1),                                   // bot name
		bertybot.WithInsecureMessengerGRPCAddr(*node1Addr),                        // connect to running berty messenger daemon
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingContactRequestRecipe()),    // accept incoming contact requests
		bertybot.WithRecipe(bertybot.WelcomeMessageRecipe("welcome to testbot1")), // send welcome message to new contacts and new conversations
		bertybot.WithRecipe(bertybot.EchoRecipe("you said1: ")),                   // reply to messages with the same message
		// FIXME: with auto-send `/help` suggestion on welcome
		bertybot.WithCommand("version", "show version", testbot.VersionCommand),
	)
	if *debug {
		opts = append(opts, bertybot.WithRecipe(bertybot.DebugEventRecipe(logger.Named("debug")))) // debug events
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
	testbot.Bot1 = bot
	return nil
}

// InitBot2 initializes the companion bot
func (testbot *TestBot) InitBot2() error {
	logger := testbot.logger.Named("bot2")

	// init bot
	opts := []bertybot.NewOption{}
	opts = append(opts,
		bertybot.WithLogger(logger.Named("lib")),                                  // configure a logger
		bertybot.WithDisplayName(*displayName2),                                   // bot name
		bertybot.WithInsecureMessengerGRPCAddr(*node2Addr),                        // connect to running berty messenger daemon
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingContactRequestRecipe()),    // accept incoming contact requests
		bertybot.WithRecipe(bertybot.WelcomeMessageRecipe("welcome to testbot2")), // send welcome message to new contacts and new conversations
		bertybot.WithRecipe(bertybot.EchoRecipe("you said2: ")),                   // reply to messages with the same message
	)
	if *debug {
		opts = append(opts, bertybot.WithRecipe(bertybot.DebugEventRecipe(logger.Named("debug")))) // debug events
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
	testbot.Bot2 = bot
	return nil
}
