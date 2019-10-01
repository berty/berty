package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"berty.tech/go/internal/banner"
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
		logger      *zap.Logger
		globalFlags = flag.NewFlagSet("bertychat", flag.ExitOnError)
		globalDebug = globalFlags.Bool("debug", false, "debug mode")
		bannerFlags = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight = bannerFlags.Bool("light", false, "light mode")
		clientFlags = flag.NewFlagSet("client", flag.ExitOnError)
		clientURN   = clientFlags.String("urn", ":memory:", "sqlite URN")
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

			// initialize sqlite3 gorm
			db, err := gorm.Open("sqlite3", *clientURN)
			if err != nil {
				return errors.Wrap(err, "failed to initialize gorm")
			}
			defer db.Close()

			// Opts is optional
			opts := bertyprotocol.Opts{
				Logger: logger,
			}

			// initialize new protocol client
			protocol := bertyprotocol.New(db, opts)
			defer protocol.Close()

			// initialize bertychat client
			// FIXME: TODO

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
