package migrations

import (
	"os"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/migrationutils"
	"berty.tech/berty/v2/go/pkg/errcode"
)

var migration0To1 = migration{
	From:  "0",
	To:    "1",
	Apply: apply0To1,
}

func apply0To1(opts Options) error {
	// create root dirs
	opts.Logger.Info("creating root directories", zap.String("app-dir", opts.AppDir), zap.String("shared-dir", opts.SharedDir))
	if err := os.MkdirAll(opts.AppDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := os.MkdirAll(opts.SharedDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create global app storage db
	opts.Logger.Info("creating global app storage")
	_, closeAppStorage, err := accountutils.GetGlobalAppStorage(opts.AppDir, opts.NativeKeystore)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := closeAppStorage(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// write new version
	if err := migrationutils.WriteDataVersion(opts.AppDir, "1"); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}
