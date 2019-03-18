package coreinterface

import (
	"errors"
	"fmt"

	"berty.tech/client/react-native/gomobile/core"
	"go.uber.org/zap"

	"berty.tech/core/pkg/deviceinfo"
	"github.com/pkg/browser"
	"github.com/shibukawa/configdir"
)

func getStorageDir() (string, error) {
	storagePath := configdir.New("Berty Technologies", "Berty")
	storageDirs := storagePath.QueryFolders(configdir.Global)
	if len(storageDirs) == 0 {
		return "", errors.New("no storage path found")
	}

	if err := storageDirs[0].CreateParentDir(""); err != nil {
		return "", err
	}

	return storageDirs[0].Path, nil
}

func Initialize() (interface{}, error) {
	storageDir, err := getStorageDir()
	if err != nil {
		return nil, err
	}

	if err := deviceinfo.SetStoragePath(storageDir); err != nil {
		return nil, err
	}

	return nil, nil
}

func ListAccounts() (interface{}, error) {
	return core.ListAccounts()
}

func Start(nickname string) (interface{}, error) {
	cfg := &core.MobileOptions{}
	cfg = cfg.WithNickname(nickname)
	cfg = cfg.WithLoggerDriver(&CliLogger{})

	return nil, core.Start(cfg)
}

func Restart() (interface{}, error) {
	return nil, core.Restart()
}

func Panic() (interface{}, error) {
	panic("panicking")
}

func DropDatabase() (interface{}, error) {
	return nil, core.DropDatabase()
}

func GetPort() (interface{}, error) {
	return core.GetPort()
}

func GetNetworkConfig() (interface{}, error) {
	return core.GetNetworkConfig()
}

func UpdateNetworkConfig(config string) (interface{}, error) {
	return nil, core.UpdateNetworkConfig(config)
}

func OpenURL(url string) (interface{}, error) {
	logger().Info(fmt.Sprintf("opening URL %s", url))
	err := browser.OpenURL(url)
	if err != nil {
		logger().Error(fmt.Sprintf("unable to open URL %s", url), zap.Error(err))
	}

	return nil, err
}

func IsBotRunning() (interface{}, error) {
	return core.IsBotRunning(), nil
}

func StartBot() (interface{}, error) {
	return nil, core.StartBot()
}

func StopBot() (interface{}, error) {
	return nil, core.StopBot()
}

func GetLocalGRPCInfos() (interface{}, error) {
	return core.GetLocalGRPCInfos(), nil
}

func StartLocalGRPC() error {
	return core.StartLocalGRPC()
}

func StopLocalGRPC() error {
	return core.StopLocalGRPC()
}

func SetCurrentRoute(route string) {
	core.DeviceInfo.SetAppRoute(route)
}

type CliLogger struct {
}

func (*CliLogger) LevelEnabler(level string) bool {
	return true
}

func (*CliLogger) Log(level, namespace, message string) error {
	fmt.Printf("[%s] [%s]: %s\n", level, namespace, message)
	return nil
}

var _ core.NativeLogger = &CliLogger{}
