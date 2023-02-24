package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"syscall"

	"berty.tech/berty/v2/tool/tyber/go/bind"
	"berty.tech/berty/v2/tool/tyber/go/bridge"
	"berty.tech/berty/v2/tool/tyber/go/cmd"
	"berty.tech/berty/v2/tool/tyber/go/parser"
	"github.com/asticode/go-astikit"
	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
	"github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
)

// Window properties
const (
	center    = true
	height    = 700
	minHeight = 500
	width     = 1200
	minWidth  = 1180
)

// App properties
const singleInstance = true

var manager *cmd.Manager

// Vars injected via ldflags by bundler
var (
	AppName            string
	BuiltAt            string
	VersionAstilectron string
	VersionElectron    string
)

type AppSession struct {
	ID   string `json:"id"`
	Path string `json:"path"`
}

func main() {
	err := runMain(os.Args[1:])

	switch {
	case err == nil:
		// noop
	case err == flag.ErrHelp || strings.Contains(err.Error(), flag.ErrHelp.Error()):
		os.Exit(2)
	default:
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

func runMain(args []string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	manager = cmd.New(ctx, cancel)

	// setup flags
	var fs *flag.FlagSet
	{
		fs = flag.NewFlagSet("tyber", flag.ContinueOnError)

		defaultDataPath, err := os.UserConfigDir()
		if err != nil {
			return err
		}
		fs.StringVar(&manager.DataPath, "dataPath", defaultDataPath, "data path directory")
	}

	var root *ffcli.Command
	{
		root = &ffcli.Command{
			ShortUsage:  "tyber [flags] <subcommand> [flags] [args...]",
			ShortHelp:   "start a log parse tool",
			FlagSet:     fs,
			Options:     ffCommandOptions(),
			Subcommands: []*ffcli.Command{delete(), list(), parse(), analyze()},
			Exec: func(ctx context.Context, args []string) error {
				return runGui(ctx)
			},
		}
	}

	if err := root.ParseAndRun(ctx, args); err != nil {
		log.Fatal(err)
	}

	return nil
}

func list() *ffcli.Command {
	fs := flag.NewFlagSet("tyber list [flags]", flag.ExitOnError)
	output := fs.String("o", "", "Path of the file to write the output")

	return &ffcli.Command{
		Name:       "list",
		ShortUsage: "tyber [global flags] list [flags]",
		ShortHelp:  "List parsed files",
		Options:    ffCommandOptions(),
		FlagSet:    fs,
		Exec: func(ctx context.Context, args []string) error {
			if err := manager.Init(); err != nil {
				return err
			}
			defer manager.Cancel()

			var sessions []parser.CreateSessionEvent
			go manager.Parser.ListSessionEvents()

			// waiting parser returns the session list
			select {
			case evt := <-manager.Parser.EventChan:
				var ok bool
				sessions, ok = evt.([]parser.CreateSessionEvent)
				if !ok {
					return errors.New("list: wrong event received")
				}
			case <-ctx.Done():
				return ctx.Err()
			}

			appSessions := []AppSession{}
			for _, session := range sessions {
				session := AppSession{
					ID:   session.ID,
					Path: session.SrcName,
				}
				appSessions = append(appSessions, session)
			}

			jsonSessions, err := json.MarshalIndent(appSessions, "", "  ")
			if err != nil {
				return err
			}

			if *output != "" {
				return ioutil.WriteFile(*output, jsonSessions, 0o644)
			}

			fmt.Println(string(jsonSessions))
			return nil
		},
	}
}

func parse() *ffcli.Command {
	fs := flag.NewFlagSet("tyber parse [flags] args", flag.ExitOnError)

	return &ffcli.Command{
		Name:       "parse",
		ShortUsage: "tyber [global flags] parse [flags] args...",
		ShortHelp:  "Parse log files",
		Options:    ffCommandOptions(),
		FlagSet:    fs,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			if err := manager.Init(); err != nil {
				return err
			}
			defer manager.Cancel()

			return _parse(ctx, args)
		},
	}
}

func _parse(ctx context.Context, args []string) error {
	for _, path := range args {
		cerr := make(chan error)

		go func() {
			if err := manager.Parser.ParseFile(path); err != nil {
				cerr <- err
			}
		}()

		// waiting to finish parsing
	EVENT_LOOP: // label
		for {
			select {
			case evt := <-manager.Parser.EventChan:
				switch evt.(type) {
				case parser.CreateSessionEvent:
					break EVENT_LOOP
				default: // digest unwanted events
				}
			case err := <-cerr:
				return err
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	}

	return nil
}

func analyze() *ffcli.Command {
	fs := flag.NewFlagSet("tyber analyze [flags] <session_id>...", flag.ExitOnError)
	parse := fs.Bool("p", false, "takes Berty logs as arguments and parse them before analyze")
	output := fs.String("o", "", "Path of the file to write the output")

	return &ffcli.Command{
		Name:       "analyze",
		ShortUsage: "tyber [global flags] analyze [flags] <session_id>...",
		ShortHelp:  "Analyze Tyber's session files",
		Options:    ffCommandOptions(),
		FlagSet:    fs,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) < 2 {
				return flag.ErrHelp
			}

			if err := manager.Init(); err != nil {
				return err
			}
			defer manager.Cancel()

			if *parse {
				if err := _parse(ctx, args); err != nil {
					return err
				}
			}

			sessions, err := manager.Parser.ListSessions()
			if err != nil {
				return err
			}

			// check if session requests are available and pick sessions
			var requestedSessions []*parser.Session
		LOOP_ARGS:
			for _, arg := range args {
				for _, session := range sessions {
					if *parse {
						if session.SrcName == arg {
							requestedSessions = append(requestedSessions, session)
							continue LOOP_ARGS
						}
					} else {
						if session.ID == arg {
							requestedSessions = append(requestedSessions, session)
							continue LOOP_ARGS
						}
					}
				}
				return errors.New(fmt.Sprintf("session=%s is not found", arg))
			}

			report, err := manager.Analyzer.Analyze(requestedSessions)
			if err != nil {
				return err
			}

			jsonReport, err := json.MarshalIndent(report, "", "  ")
			if err != nil {
				return err
			}

			if *output != "" {
				return ioutil.WriteFile(*output, jsonReport, 0o644)
			}

			fmt.Println(string(jsonReport))

			return nil
		},
	}
}

func delete() *ffcli.Command {
	fs := flag.NewFlagSet("tyber delete", flag.ExitOnError)
	all := fs.Bool("a", false, "Delete all sessions")

	return &ffcli.Command{
		Name:       "delete",
		ShortUsage: "tyber [global flags] delete [flags] <file id>...",
		ShortHelp:  "Delete parsed files",
		Options:    ffCommandOptions(),
		FlagSet:    fs,
		Exec: func(ctx context.Context, args []string) error {
			if !*all && len(args) == 0 {
				return flag.ErrHelp
			}

			if err := manager.Init(); err != nil {
				return err
			}
			defer manager.Cancel()

			if *all {
				go manager.Parser.DeleteAllSessions()

				// waiting parser deletes all sessions
				select {
				case evt := <-manager.Parser.EventChan:
					if _, ok := evt.([]parser.CreateSessionEvent); !ok {
						return errors.New("delete: wrong event received")
					}
				case <-ctx.Done():
					return ctx.Err()
				}

				return nil
			}

			for _, sessionID := range args {
				go manager.Parser.DeleteSession(sessionID)

				// waiting parser deletes this session
				select {
				case evt := <-manager.Parser.EventChan:
					var ok bool
					_, ok = evt.(parser.DeleteSessionEvent)
					if !ok {
						return errors.New("delete: wrong event received")
					}
				case <-ctx.Done():
					return ctx.Err()
				}
			}

			return nil
		},
	}
}

func runGui(ctx context.Context) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	// Create logger
	l := log.New(log.Writer(), log.Prefix(), log.Flags())

	// Init Go <-> JS bridge
	b := bridge.New(ctx, l, nil)
	defer b.Close()

	// Run bootstrap
	l.Printf("Running app built at %s\n", BuiltAt)
	if err := bootstrap.Run(bootstrap.Options{
		Asset:    bind.Asset,
		AssetDir: bind.AssetDir,
		AstilectronOptions: astilectron.Options{
			AppName:            AppName,
			AppIconDarwinPath:  "bundler/resources/icons/icon.icns",
			AppIconDefaultPath: "bundler/resources/icons/icon.png",
			SingleInstance:     singleInstance,
			VersionAstilectron: VersionAstilectron,
			VersionElectron:    VersionElectron,
		},
		Logger: l,
		MenuOptions: []*astilectron.MenuItemOptions{{
			Label: astikit.StrPtr("File"),
			SubMenu: []*astilectron.MenuItemOptions{
				{
					Label:       astikit.StrPtr("Open File(s)"),
					OnClick:     b.OpenFiles,
					Accelerator: astilectron.NewAccelerator("CommandOrControl", "o"),
				},
				{Type: astilectron.MenuItemTypeSeparator},
				{
					Label:       astikit.StrPtr("Preferences..."),
					OnClick:     b.OpenPreferences,
					Accelerator: astilectron.NewAccelerator("CommandOrControl", ","),
				},
				{
					Label:       astikit.StrPtr("Developer Tools"),
					OnClick:     b.ToggleDevTools,
					Accelerator: astilectron.NewAccelerator("CommandOrControl", "Alt", "i"),
				},
				{Type: astilectron.MenuItemTypeSeparator},
				{
					Label: astikit.StrPtr(fmt.Sprintf("Quit %s", AppName)),
					Role:  astilectron.MenuItemRoleQuit,
				},
			},
		}, {
			Role: astilectron.MenuItemRoleEditMenu,
			SubMenu: []*astilectron.MenuItemOptions{
				{Role: astilectron.MenuItemRoleUndo},
				{Role: astilectron.MenuItemRoleRedo},
				{Role: astilectron.MenuItemRoleCut},
				{Role: astilectron.MenuItemRoleCopy},
				{Role: astilectron.MenuItemRolePaste},
				{Role: astilectron.MenuItemRoleDelete},
				{Role: astilectron.MenuItemRoleSelectAll},
			},
		}},
		OnWait:        b.Init,
		RestoreAssets: bind.RestoreAssets,
		ResourcesPath: "bundler/resources",
		Windows: []*bootstrap.Window{{
			Homepage: "index.html",
			MessageHandler: func(w *astilectron.Window, m bootstrap.MessageIn) (interface{}, error) {
				return nil, b.HandleMessages(m.Name, m.Payload)
			},
			Options: &astilectron.WindowOptions{
				Center:    astikit.BoolPtr(center),
				MinHeight: astikit.IntPtr(minHeight),
				Height:    astikit.IntPtr(height),
				MinWidth:  astikit.IntPtr(minWidth),
				Width:     astikit.IntPtr(width),
				WebPreferences: &astilectron.WebPreferences{
					EnableRemoteModule: astikit.BoolPtr(true),
				},
			},
		}},
		IgnoredSignals: []os.Signal{syscall.SIGURG},
	}); err != nil {
		return fmt.Errorf("Running bootstrap failed: %w", err)
	}

	return nil
}

func ffCommandOptions() []ff.Option {
	return []ff.Option{
		ff.WithEnvVarPrefix("TYBER"),
		ff.WithConfigFileFlag("config"),
		ff.WithConfigFileParser(ff.PlainParser),
	}
}
