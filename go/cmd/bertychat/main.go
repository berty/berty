package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"berty.tech/go/internal/banner"
	"berty.tech/go/internal/chatdb"
	"berty.tech/go/internal/protocoldb"
	"berty.tech/go/pkg/bertychat"
	"berty.tech/go/pkg/bertyprotocol"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func main() {
	log.SetFlags(0)

	var (
		logger            *zap.Logger
		globalFlags       = flag.NewFlagSet("bertychat", flag.ExitOnError)
		globalDebug       = globalFlags.Bool("debug", false, "debug mode")
		bannerFlags       = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight       = bannerFlags.Bool("light", false, "light mode")
		clientFlags       = flag.NewFlagSet("client", flag.ExitOnError)
		clientProtocolURN = clientFlags.String("protocol-urn", ":memory:", "protocol sqlite URN")
		clientChatURN     = clientFlags.String("chat-urn", ":memory:", "chat sqlite URN")
	)

	globalPreRun := func() error {
		rand.Seed(time.Now().UnixNano())
		if *globalDebug {
			config := zap.NewDevelopmentConfig()
			config.Level.SetLevel(zap.DebugLevel)
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			var err error
			logger, err = config.Build()
			if err != nil {
				return errors.Wrap(err, "failed to initialize logger")
			}
			logger.Debug("logger initialized in debug mode")
		} else {
			config := zap.NewDevelopmentConfig()
			config.Level.SetLevel(zap.InfoLevel)
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			var err error
			logger, err = config.Build()
			if err != nil {
				return errors.Wrap(err, "failed to initialize logger")
			}
		}
		return nil
	}

	banner := &ffcli.Command{
		Name:    "banner",
		Usage:   "banner",
		FlagSet: bannerFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}
			if *bannerLight {
				fmt.Println(banner.QOTD())
			} else {
				fmt.Println(banner.OfTheDay())
			}
			return nil
		},
	}

	version := &ffcli.Command{
		Name:  "version",
		Usage: "version",
		Exec: func(args []string) error {
			fmt.Println("dev")
			return nil
		},
	}

	daemon := &ffcli.Command{
		Name:    "daemon",
		Usage:   "daemon",
		FlagSet: clientFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			// protocol
			var protocol bertyprotocol.Client
			{
				// initialize sqlite3 gorm database
				db, err := gorm.Open("sqlite3", *clientProtocolURN)
				if err != nil {
					return errors.Wrap(err, "failed to initialize gorm")
				}
				defer db.Close()

				// initialize datastore
				db, err = protocoldb.InitMigrate(db, logger.Named("datastore"))
				if err != nil {
					return errors.Wrap(err, "failed to initialize datastore")
				}

				// initialize new protocol client
				protocolOpts := bertyprotocol.Opts{
					Logger: logger.Named("bertyprotocol"),
				}
				protocol, err = bertyprotocol.New(db, protocolOpts)
				if err != nil {
					return errors.Wrap(err, "failed to initialize protocol")
				}
				defer protocol.Close()
			}

			// chat
			{
				// initialize sqlite3 gorm database
				db, err := gorm.Open("sqlite3", *clientChatURN)
				if err != nil {
					return errors.Wrap(err, "failed to initialize gorm")
				}
				defer db.Close()

				// initialize datastore
				db, err = chatdb.InitMigrate(db, logger.Named("datastore"))
				if err != nil {
					return errors.Wrap(err, "failed to initialize datastore")
				}

				// initialize bertychat client
				chatOpts := bertychat.Opts{
					Logger: logger.Named("bertychat"),
				}
				chat, err := bertychat.New(db, protocol, chatOpts)
				if err != nil {
					return errors.Wrap(err, "failed to initialize chat")
				}
				defer chat.Close()
			}

			logger.Info("client initialized, now starting... not implemented.")
			return nil
		},
	}

	root := &ffcli.Command{
		Usage:       "bertychat [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{daemon, banner, version},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}
