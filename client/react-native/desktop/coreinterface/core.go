package coreinterface

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"regexp"

	"github.com/asticode/go-astilectron"

	"berty.tech/client/react-native/gomobile/core"
	"go.uber.org/zap"

	"berty.tech/core/pkg/deviceinfo"
	"github.com/pkg/browser"
	"github.com/shibukawa/configdir"
)

var a *astilectron.Astilectron

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

func SetAstilectron(w *astilectron.Astilectron) {
	a = w
}

func InstallUpdate(url string) (interface{}, error) {
	out, err := os.Create("/tmp/bertydl.dmg")
	if err != nil {
		return nil, err
	}
	defer out.Close()

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check server response
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bad status: %s", resp.Status)
	}

	// Writer the body to file
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return nil, err
	}

	_, err = exec.LookPath("hdiutil")
	if err != nil {
		return nil, err
	}
	// hdiutil attach /tmp/1234.dmg
	cmd := exec.Command("hdiutil", "attach", "/tmp/bertydl.dmg")
	stdout, err := cmd.CombinedOutput()
	if err != nil {
		return nil, err
	}

	reg := regexp.MustCompile(`.*?Apple_HFS.*?(\/.*?Berty.*?)[\n|$]`)
	vol := reg.FindStringSubmatch(string(stdout))

	if len(vol) <= 1 {
		return nil, fmt.Errorf("can't find the right volumes")
	}
	// cp -rf //
	cmd = exec.Command("cp", "-rf", vol[1]+"/Berty.app", "/Applications/.")
	stdout, err = cmd.CombinedOutput()
	if err != nil {
		return nil, err
	}

	cmd = exec.Command("hdiutil", "detach", vol[1])
	stdout, err = cmd.CombinedOutput()
	if err != nil {
		return nil, err
	}

	cmd = exec.Command("open", "-nF", "/Applications/Berty.app")
	stdout, err = cmd.CombinedOutput()
	if err != nil {
		return nil, err
	}
	a.Stop()
	os.Exit(0)

	return nil, nil
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
