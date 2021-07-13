package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"syscall"

	"berty.tech/berty/tool/tyber/go/bind"
	"berty.tech/berty/tool/tyber/go/bridge"
	"github.com/asticode/go-astikit"
	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
)

// Window properties
const (
	center    = true
	height    = 700
	minHeight = 350
	width     = 1200
	minWidth  = 500
)

// App properties
const singleInstance = true

// Vars injected via ldflags by bundler
var (
	AppName            string
	BuiltAt            string
	VersionAstilectron string
	VersionElectron    string
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
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
		l.Fatal(fmt.Errorf("Running bootstrap failed: %w", err))
	}
}
