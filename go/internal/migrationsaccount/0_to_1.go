package migrationsaccount

import (
	"os"
	"path/filepath"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/migrationutils"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/weshnet/pkg/ipfsutil"
)

var migration0To1 = migration{
	From:  "0",
	To:    "1",
	Apply: apply0To1,
}

func apply0To1(opts Options) error {
	// get secrets
	var storageKey, appStorageSalt, ipfsSalt, messengerDBSalt, rootDatastoreSalt []byte
	if opts.NativeKeystore != nil {
		opts.Logger.Info("getting account secrets")

		var err error
		storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		appStorageSalt, err = accountutils.GetOrCreateAppStorageSaltForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		ipfsSalt, err = accountutils.GetOrCreateIPFSDatastoreSaltForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		messengerDBSalt, err = accountutils.GetOrCreateMessengerDBSaltForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		rootDatastoreSalt, err = accountutils.GetOrCreateRootDatastoreSaltForAccount(opts.NativeKeystore, opts.AccountID)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	// create root dirs
	opts.Logger.Info("creating account root directories", zap.String("account-app-dir", opts.accountAppDir), zap.String("account-shared-dir", opts.accountSharedDir))
	if err := os.MkdirAll(opts.accountAppDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := os.MkdirAll(opts.accountSharedDir, 0o700); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create account app storage db
	opts.Logger.Info("creating account app storage")
	appStorage, err := accountutils.GetAccountAppStorage(opts.AppDir, opts.AccountID, storageKey, appStorageSalt)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := appStorage.Close(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create account ipfs repo
	opts.Logger.Info("creating account ipfs repo")
	dbPath := filepath.Join(opts.accountAppDir, "ipfs.sqlite")
	ipfsRepo, err := ipfsutil.LoadEncryptedRepoFromPath(dbPath, storageKey, ipfsSalt)
	if err != nil {
		return errcode.ErrIPFSSetupRepo.Wrap(err)
	}
	if err := ipfsRepo.Close(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create messenger db
	opts.Logger.Info("creating account messenger db")
	_, closeMessengerDB, err := accountutils.GetMessengerDBForPath(opts.accountSharedDir, storageKey, messengerDBSalt, opts.Logger)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	closeMessengerDB()

	// create root datastore
	opts.Logger.Info("creating account root datastore")
	rootDS, err := accountutils.GetRootDatastoreForPath(opts.accountSharedDir, storageKey, rootDatastoreSalt, opts.Logger)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	if err := rootDS.Close(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// create logs directory
	logsDir := filepath.Join(opts.accountAppDir, "logs")
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
