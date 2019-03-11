package main

import (
	"flag"
	"fmt"
	"os"

	"berty.tech/client/react-native/desktop/coreinterface"
	"berty.tech/core/pkg/logmanager"
	"go.uber.org/zap"

	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
)

// Vars
var (
	AppName  string
	BuiltAt  string
	debug    = astilectron.PtrBool(true) // flag.Bool("d", false, "enables the debug mode")
	homepage = flag.String("h", "index.html", "overrides default resource url (useful when having a local dev web build)")
)

func main() {
	// Init
	flag.Parse()

	t := true

	logman, err := logmanager.New(logmanager.Opts{
		RingSize:      10 * 1024 * 1024,
		LogLevel:      "debug",
		LogNamespaces: "core.*,vendor.gorm*,client.react-native.*",
		LogDirectory:  os.Getenv("HOME") + "/Library/Logs", // FIXME: win, linux
	})
	if err != nil {

	}
	logman.SetGlobal()

	zap.L().Debug("Berty desktop client started")

	homepageUrl := "index.html"
	if homepage != nil {
		homepageUrl = *homepage
	}

	// Run bootstrap
	logger().Debug(fmt.Sprintf("Running app built at %s", BuiltAt))
	if err := bootstrap.Run(bootstrap.Options{
		Asset:         Asset,
		AssetDir:      AssetDir,
		RestoreAssets: RestoreAssets,
		AstilectronOptions: astilectron.Options{
			AppName:            AppName,
			AppIconDarwinPath:  "resources/icon.icns",
			AppIconDefaultPath: "resources/icon.png",
		},
		Debug: *debug,
		MenuOptions: []*astilectron.MenuItemOptions{{
			Label: astilectron.PtrStr("File"),
			SubMenu: []*astilectron.MenuItemOptions{
				{Role: astilectron.MenuItemRoleClose},
				{Role: astilectron.MenuItemRoleQuit, Label: astilectron.PtrStr("Quit Berty")},
			},
		},
			{
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
		OnWait: coreinterface.SetNotificationDriver,
		Windows: []*bootstrap.Window{{
			Homepage:       homepageUrl,
			MessageHandler: handleMessages,
			Options: &astilectron.WindowOptions{
				BackgroundColor: astilectron.PtrStr("#333"),
				Width:           astilectron.PtrInt(1060),
				Height:          astilectron.PtrInt(640),
				WebPreferences: &astilectron.WebPreferences{
					DevTools: &t,
				},
			},
		}},
	}); err != nil {
		logger().Error("running bootstrap failed", zap.Error(err))
	}
}
