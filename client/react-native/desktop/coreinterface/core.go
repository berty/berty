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

func OpenURL(url string) (interface{}, error) {
	logger().Info(fmt.Sprintf("opening URL %s", url))
	err := browser.OpenURL(url)
	if err != nil {
		logger().Error(fmt.Sprintf("unable to open URL %s", url), zap.Error(err))
	}

	return nil, err
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
