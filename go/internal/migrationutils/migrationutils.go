package migrationutils

import (
	"fmt"
	"os"
	"path"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
)

const (
	dataVersionFileName = "data-version"
)

func GetDataVersion(dir string) (string, error) {
	dataVersionPath := path.Join(dir, dataVersionFileName)

	_, err := os.Stat(dataVersionPath)
	if os.IsNotExist(err) {
		return "0", nil
	}
	if err != nil {
		return "", errcode.ErrCode_TODO.Wrap(err)
	}

	versionBytes, err := os.ReadFile(dataVersionPath)
	if err != nil {
		return "", errcode.ErrCode_TODO.Wrap(err)
	}

	return (string)(versionBytes), nil
}

func WriteDataVersion(dir, version string) error {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	return os.WriteFile(path.Join(dir, dataVersionFileName), []byte(version), 0o600)
}

func Move(from string, to string, label string, logger *zap.Logger) error {
	if from == to {
		return nil
	}
	logger.Info(fmt.Sprintf("moving %s", label), zap.String("from", from), zap.String("to", to))
	return os.Rename(from, to)
}
