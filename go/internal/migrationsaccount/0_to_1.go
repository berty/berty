package migrationsaccount

import (
	"os"
	"path/filepath"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/ipfsutil"
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
	opts.Logger.Info("creating account root directories", zap.String("account-app-dir", opts.accountAppDir), zap.String("account-shared-dir", opts.accountSharedDir))
	if err := os.MkdirAll(opts.accountAppDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := os.MkdirAll(opts.accountSharedDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// get secrets
	var storageKey, storageSalt []byte
	if opts.NativeKeystore != nil {
		opts.Logger.Info("getting account secrets")

		var err error
		storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		storageSalt, err = accountutils.GetOrCreateStorageSaltForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	// FIXME: using same salt for everything is bad, no?

	// create account app storage db
	opts.Logger.Info("creating account app storage")
	appStorage, err := accountutils.GetAccountAppStorage(opts.SharedDir, opts.AccountID, storageKey, storageSalt)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := appStorage.Close(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create account ipfs repo
	opts.Logger.Info("creating account ipfs repo")
	dbPath := filepath.Join(opts.accountSharedDir, "ipfs.sqlite")
	ipfsRepo, err := ipfsutil.LoadRepoFromPath(dbPath, storageKey, storageSalt)
	if err != nil {
		return errcode.ErrIPFSSetupRepo.Wrap(err)
	}
	if err := ipfsRepo.Close(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create messenger db
	opts.Logger.Info("creating account messenger db")
	_, closeMessengerDB, err := accountutils.GetMessengerDBForPath(opts.accountSharedDir, storageKey, opts.Logger)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	closeMessengerDB()

	// create root datastore
	opts.Logger.Info("creating account root datastore")
	rootDS, err := accountutils.GetRootDatastoreForPath(opts.accountSharedDir, storageKey, storageSalt, opts.Logger)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := rootDS.Close(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create logs directory
	logsDir := filepath.Join(opts.accountSharedDir, "logs")
	opts.Logger.Info("creating account logs directory", zap.String("path", logsDir))
	if err := os.MkdirAll(logsDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// write new version
	if err := migrationutils.WriteDataVersion(opts.accountAppDir, "1"); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}
