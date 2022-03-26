package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"text/template"

	cp "github.com/otiai10/copy"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func main() {
	if err := errMain(); err != nil {
		panic(err)
	}
}

type packageJSONVars struct {
	Version string
}

func errMain() error {
	pathFlag := flag.String("path", "", "path to the package to be published")
	versionFlag := flag.String("version", "", "version to publish")
	dryrunFlag := flag.Bool("dry-run", false, "do not publish at the end")
	flag.Parse()

	path := *pathFlag
	if path == "" {
		flag.Usage()
		return errors.New("path flag is required")
	}
	path = filepath.Clean(path)

	version := *versionFlag
	if version == "" {
		flag.Usage()
		return errors.New("version flag is required")
	}

	logger, err := zap.NewDevelopment()
	if err != nil {
		return errors.Wrap(err, "init logger")
	}

	logger.Info("Publishing package", zap.String("path", path))

	buildDir, err := os.MkdirTemp("", "publish-npm-package_")
	if err != nil {
		return errors.Wrap(err, "get build dir")
	}
	logger.Info("Got build directory", zap.String("build-dir", buildDir))

	packageJSONTemplatePath := filepath.Join(path, "package.template.json")
	packageJSONPath := filepath.Join(buildDir, "package.json")
	packageJSONTemplateBytes, err := ioutil.ReadFile(packageJSONTemplatePath)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("read package.json template at %s", packageJSONTemplatePath))
	}
	logger.Info("Read package.json template")

	if err := cp.Copy(path, buildDir, cp.Options{
		Skip: func(src string) (bool, error) {
			if filepath.Clean(src) == filepath.Clean(packageJSONTemplatePath) {
				return true, nil
			}
			return false, nil
		},
	}); err != nil {
		return errors.Wrap(err, "copy package into build directory")
	}
	logger.Info("Copied package to build directory")

	packageJSONTemplate, err := template.New("package.json").Parse(string(packageJSONTemplateBytes))
	if err != nil {
		return errors.Wrap(err, "parse package.json template")
	}
	prd, pwr := io.Pipe()
	go func() {
		if err := packageJSONTemplate.Execute(pwr, packageJSONVars{
			Version: version,
		}); err != nil {
			if err := pwr.CloseWithError(errors.Wrap(err, "execute package.json template")); err != nil {
				logger.Error("Failed to close pipe", zap.Error(err))
			}
		} else if err := pwr.Close(); err != nil {
			logger.Error("Failed to close pipe", zap.Error(err))
		}
	}()
	packageJSONBytes, err := ioutil.ReadAll(prd)
	if err != nil {
		return errors.Wrap(err, "write package.json template")
	}
	if err := ioutil.WriteFile(packageJSONPath, packageJSONBytes, os.ModePerm); err != nil {
		return errors.Wrap(err, "write package.json")
	}
	logger.Info("Wrote package.json")

	cmd := exec.Command("npm", "i")
	cmd.Dir = buildDir
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return errors.Wrap(err, "run npm install")
	}
	logger.Info("Installed node modules")

	if !*dryrunFlag {
		pubcmd := exec.Command("npm", "publish")
		pubcmd.Dir = buildDir
		pubcmd.Stderr = os.Stderr
		pubcmd.Stdin = os.Stdin
		pubcmd.Stdout = os.Stdout
		if err := pubcmd.Run(); err != nil {
			return errors.Wrap(err, "run npm publish")
		}
		logger.Info("Published module!")
	}

	if err := os.RemoveAll(buildDir); err != nil {
		logger.Error("Failed to remove build directory", zap.Error(err))
	} else {
		logger.Info("Removed build directory", zap.String("build-dir", buildDir))
	}

	return nil
}
