package migrationsaccount

import (
	"path/filepath"

	"berty.tech/berty/v2/go/internal/migrationutils"
	"berty.tech/berty/v2/go/pkg/errcode"
)

var migration1To2 = migration{
	From:  "1",
	To:    "2",
	Apply: apply1To2,
}

func apply1To2(opts Options) error {
	// move ipfs db
	ipfsDBName := "ipfs.sqlite"
	if err := migrationutils.Move(filepath.Join(opts.accountSharedDir, ipfsDBName), filepath.Join(opts.accountAppDir, ipfsDBName), "account ipfs repo", opts.Logger); err != nil {
		return errcode.TODO.Wrap(err) // Replace by ErrDBMove
	}

	// move account app storage
	storageDBName := "app-account.sqlite"
	if err := migrationutils.Move(filepath.Join(opts.accountSharedDir, storageDBName), filepath.Join(opts.accountAppDir, storageDBName), "account app storage", opts.Logger); err != nil {
		return errcode.TODO.Wrap(err) // Replace by ErrDBMove
	}

	// move logs
	logsDirName := "logs"
	if err := migrationutils.Move(filepath.Join(opts.accountSharedDir, logsDirName), filepath.Join(opts.accountAppDir, logsDirName), "account logs dir", opts.Logger); err != nil {
		return errcode.TODO.Wrap(err) // Replace by ErrFolderMove
	}

	// write new version
	if err := migrationutils.WriteDataVersion(opts.accountAppDir, "2"); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}
