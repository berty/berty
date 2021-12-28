package main

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"strings"
	"syscall"

	qrterminal "github.com/mdp/qrterminal/v3"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"moul.io/srand"
	"moul.io/zapconfig"

	"berty.tech/berty/v2/go/pkg/bertybot"
	"berty.tech/berty/v2/go/pkg/bertyversion"
)

var (
	nodeAddr    = flag.String("addr", "127.0.0.1:9091", "remote 'berty daemon' address")
	displayName = flag.String("name", "CMCBot", "bot's display name")
	debug       = flag.Bool("debug", false, "debug mode")
	cmcKeyPath  = flag.String("cmc-key-file", "./cmc.key", "cmc key file path")
	logFormat   = flag.String("log-format", "console", strings.Join(zapconfig.AvailablePresets, ", "))
)

func main() {
	flag.Parse()
	rand.Seed(srand.MustSecure())
	if err := Main(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

type CMCBot struct {
	Bot    *bertybot.Bot
	ctx    context.Context
	logger *zap.Logger
}

func Main() error {
	config := zapconfig.Configurator{}
	config.SetPreset(*logFormat)
	logger := config.MustBuild()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// init cmcbot
	cmcbot := &CMCBot{ctx: ctx, logger: logger}
	if err := cmcbot.InitBot(); err != nil {
		return fmt.Errorf("init bot: %w", err)
	}

	// FIXME: bot1 and bot2 should be contact

	// start testbot
	var g run.Group
	g.Add(func() error { return cmcbot.Bot.Start(ctx) }, func(error) { cancel() })
	g.Add(run.SignalHandler(ctx, syscall.SIGKILL))
	return g.Run()
}

func (cmcbot *CMCBot) VersionCommand(ctx bertybot.Context) {
	_ = ctx.ReplyString("version: " + bertyversion.Version)
	// FIXME: also returns the version of the remote messenger and protocol
}

// InitBot1 initializes the entrypoint bot
func (cmcbot *CMCBot) InitBot() error {
	logger := cmcbot.logger.Named("bot")

	key, err := ioutil.ReadFile(*cmcKeyPath)
	if err != nil {
		return errors.Wrap(err, "read cmc key")
	}

	cmcPrices := loadCMCCachedPrices(cmcbot.logger.Named("cmc"), "./cache/cmcPrices.json", string(key))

	// init bot
	opts := []bertybot.NewOption{}
	opts = append(opts,
		bertybot.WithLogger(logger.Named("lib")),                               // configure a logger
		bertybot.WithDisplayName(*displayName),                                 // bot name
		bertybot.WithInsecureMessengerGRPCAddr(*nodeAddr),                      // connect to running berty messenger daemon
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingContactRequestRecipe()), // accept incoming contact requests
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingGroupInviteRecipe()),    // accept incoming group invitations
		bertybot.WithRecipe(bertybot.ReplyRecipe(func(message string) string {
			supported := []string{"BTC", "ETH", "ATOM", "AAVE", "XMR", "ZEC", "SHIBERTY"}
			lines := []string{}
			for _, symbol := range supported {
				if strings.Contains(strings.ToLower(message), "#"+strings.ToLower(symbol)) {
					val := 0.0
					if symbol != "SHIBERTY" {
						p := cmcPrices.get(symbol)
						val = p.Value
					}
					lines = append(lines, fmt.Sprintf("%s: %.2f€", symbol, val))
				}
			}
			return strings.Join(lines, "\n")
		})), // answer with prices
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
	cmcbot.Bot = bot
	return nil
}
