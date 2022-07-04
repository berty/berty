package migrations

import (
	"path"

	"berty.tech/berty/v2/go/internal/migrationutils"
	"berty.tech/berty/v2/go/pkg/errcode"
)

var migration1To2 = migration{
	From:  "1",
	To:    "2",
	Apply: apply1To2,
}

func apply1To2(opts Options) error {
	// move global app storage from shared dir to app dir
	appStorageDBName := "app.sqlite"
	if err := migrationutils.Move(path.Join(opts.SharedDir, appStorageDBName), path.Join(opts.AppDir, appStorageDBName), "global app storage", opts.Logger); err != nil {
		return errcode.TODO.Wrap(err) // Replace by ErrDBMove
	}

	// write new version
	if err := migrationutils.WriteDataVersion(opts.AppDir, "2"); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}
