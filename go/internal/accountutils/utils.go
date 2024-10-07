package accountutils

import (
	"context"
	crand "crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	sqlite "berty.tech/berty/v2/go/internal/gorm-sqlcipher"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	encrepo "berty.tech/go-ipfs-repo-encrypted"
	"berty.tech/weshnet/v2/pkg/cryptoutil"
	"berty.tech/weshnet/v2/pkg/logutil"
)

const (
	InMemoryDir                      = ":memory:"
	DefaultPushKeyFilename           = "push.key"
	AccountMetafileName              = "account_meta"
	AccountNetConfFileName           = "account_net_conf"
	MessengerDatabaseFilename        = "messenger.sqlite"
	ReplicationDatabaseFilename      = "replication.sqlite"
	DirectoryServiceDatabaseFilename = "directoryservice.sqlite"
	StorageKeyName                   = "storage"
	StorageKeySize                   = 32
	StorageSaltSize                  = 16
)

func GetDevicePushKeyForPath(filePath string, createIfMissing bool) (pk *[cryptoutil.KeySize]byte, sk *[cryptoutil.KeySize]byte, err error) {
	contents, err := os.ReadFile(filePath)
	if os.IsNotExist(err) && createIfMissing {
		if err := os.MkdirAll(path.Dir(filePath), 0o700); err != nil {
			return nil, nil, errcode.ErrCode_ErrInternal.Wrap(err)
		}

		pk, sk, err = box.GenerateKey(crand.Reader)
		if err != nil {
			return nil, nil, errcode.ErrCode_ErrCryptoKeyGeneration.Wrap(err)
		}

		contents = make([]byte, cryptoutil.KeySize*2)
		for i := 0; i < cryptoutil.KeySize; i++ {
			contents[i] = pk[i]
			contents[i+cryptoutil.KeySize] = sk[i]
		}

		if _, err := os.Create(filePath); err != nil {
			return nil, nil, errcode.ErrCode_ErrInternal.Wrap(err)
		}

		if err := os.WriteFile(filePath, contents, 0o600); err != nil {
			return nil, nil, errcode.ErrCode_ErrInternal.Wrap(err)
		}

		return pk, sk, nil
	} else if err != nil {
		return nil, nil, errcode.ErrCode_ErrPushUnableToDecrypt.Wrap(fmt.Errorf("unable to get device push key"))
	}

	pkVal := [cryptoutil.KeySize]byte{}
	skVal := [cryptoutil.KeySize]byte{}

	for i := 0; i < cryptoutil.KeySize; i++ {
		pkVal[i] = contents[i]
		skVal[i] = contents[i+cryptoutil.KeySize]
	}

	return &pkVal, &skVal, nil
}

func ListAccounts(ctx context.Context, rootDir string, ks NativeKeystore, logger *zap.Logger) ([]*accounttypes.AccountMetadata, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	accountsDir := GetAccountsDir(rootDir)

	if _, err := os.Stat(accountsDir); os.IsNotExist(err) {
		return []*accounttypes.AccountMetadata{}, nil
	} else if err != nil {
		return nil, errcode.ErrCode_ErrBertyAccountFSError.Wrap(err)
	}

	subitems, err := os.ReadDir(accountsDir)
	if err != nil {
		return nil, errcode.ErrCode_ErrBertyAccountFSError.Wrap(err)
	}

	var accounts []*accounttypes.AccountMetadata

	for _, subitem := range subitems {
		if !subitem.IsDir() {
			continue
		}

		var storageKey []byte
		if ks != nil {
			var err error
			if storageKey, err = GetOrCreateStorageKeyForAccount(ks, subitem.Name()); err != nil {
				accounts = append(accounts, &accounttypes.AccountMetadata{Error: err.Error(), AccountId: subitem.Name()})
				continue
			}
		}

		var storageSalt []byte
		if ks != nil {
			var err error
			if storageSalt, err = GetOrCreateRootDatastoreSaltForAccount(ks, subitem.Name()); err != nil {
				accounts = append(accounts, &accounttypes.AccountMetadata{Error: err.Error(), AccountId: subitem.Name()})
				continue
			}
		}

		account, err := GetAccountMetaForName(ctx, rootDir, subitem.Name(), storageKey, storageSalt, logger)
		if err != nil {
			accounts = append(accounts, &accounttypes.AccountMetadata{Error: err.Error(), AccountId: subitem.Name()})
		} else {
			accounts = append(accounts, account)
		}
	}

	return accounts, nil
}

func GetAccountMetaForName(ctx context.Context, rootDir string, accountID string, storageKey []byte, storageSalt []byte, logger *zap.Logger) (*accounttypes.AccountMetadata, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	ds, err := GetRootDatastoreForPath(GetAccountDir(rootDir, accountID), storageKey, storageSalt, logger)
	if err != nil {
		return nil, errcode.ErrCode_ErrBertyAccountFSError.Wrap(err)
	}

	metaBytes, err := ds.Get(ctx, datastore.NewKey(AccountMetafileName))
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrCode_ErrBertyAccountDataNotFound
	} else if err != nil {
		logger.Warn("unable to read account metadata", zap.Error(err), logutil.PrivateString("account-id", accountID))
		return nil, errcode.ErrCode_ErrBertyAccountFSError.Wrap(fmt.Errorf("unable to read account metadata: %w", err))
	}

	if err := ds.Close(); err != nil {
		return nil, errcode.ErrCode_ErrDBClose.Wrap(err)
	}

	meta := &accounttypes.AccountMetadata{}
	if err := proto.Unmarshal(metaBytes, meta); err != nil {
		return nil, errcode.ErrCode_ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshal account metadata: %w", err))
	}

	meta.AccountId = accountID

	return meta, nil
}

func GetAccountsDir(rootDir string) string {
	if rootDir == InMemoryDir {
		return rootDir
	}
	return filepath.Join(rootDir, "accounts")
}

func GetAccountDir(rootDir, accountID string) string {
	if rootDir == InMemoryDir {
		return rootDir
	}
	return filepath.Join(GetAccountsDir(rootDir), accountID)
}

func CreateDataDir(dir string) error {
	switch {
	case dir == "":
		return errcode.ErrCode_TODO.Wrap(fmt.Errorf("missing data dir argument"))
	case dir == InMemoryDir:
		return nil
	}

	_, err := os.Stat(dir)
	switch {
	case os.IsNotExist(err):
		if err := os.MkdirAll(dir, 0o700); err != nil {
			return errcode.ErrCode_TODO.Wrap(err)
		}
	case err != nil:
		return errcode.ErrCode_TODO.Wrap(err)
	}

	return nil
}

func GetGlobalAppStorage(rootDir string, ks NativeKeystore) (datastore.Batching, func() error, error) {
	dbPath := filepath.Join(rootDir, "app.sqlite")
	if err := os.MkdirAll(rootDir, 0o700); err != nil {
		return nil, nil, errcode.ErrCode_TODO.Wrap(err)
	}

	var err error

	storageKey := ([]byte)(nil)
	if ks != nil {
		storageKey, err = GetOrCreateMasterStorageKey(ks)
		if err != nil {
			return nil, nil, errcode.ErrCode_TODO.Wrap(err)
		}
	}

	storageSalt := ([]byte)(nil)
	if ks != nil {
		storageSalt, err = GetOrCreateGlobalAppStorageSalt(ks)
		if err != nil {
			return nil, nil, errcode.ErrCode_TODO.Wrap(err)
		}
	}

	sqldsOpts := encrepo.SQLCipherDatastoreOptions{JournalMode: "WAL", PlaintextHeader: len(storageSalt) != 0, Salt: storageSalt}
	appDatastore, err := encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "data", storageKey, sqldsOpts)
	if err != nil {
		return nil, nil, errcode.ErrCode_ErrDBOpen.Wrap(err)
	}

	return encrepo.NewNamespacedDatastore(appDatastore, datastore.NewKey("app-storage")), appDatastore.Close, nil
}

func GetAccountAppStorage(rootDir string, accountID string, key []byte, salt []byte) (datastore.Datastore, error) {
	dbPath := filepath.Join(GetAccountDir(rootDir, accountID), "app-account.sqlite")
	sqldsOpts := encrepo.SQLCipherDatastoreOptions{JournalMode: "WAL", PlaintextHeader: len(salt) != 0, Salt: salt}
	return encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "data", key, sqldsOpts)
}

func GetRootDatastoreForPath(dir string, key []byte, salt []byte, _ *zap.Logger) (datastore.Batching, error) {
	inMemory := dir == InMemoryDir

	var ds datastore.Batching
	if inMemory {
		ds = datastore.NewMapDatastore()
	} else {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			return nil, errcode.ErrCode_TODO.Wrap(err)
		}

		dbPath := filepath.Join(dir, "datastore.sqlite")
		sqldsOpts := encrepo.SQLCipherDatastoreOptions{JournalMode: "WAL", PlaintextHeader: len(salt) != 0, Salt: salt}
		ds, err = encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "blocks", key, sqldsOpts)
		if err != nil {
			return nil, errcode.ErrCode_TODO.Wrap(err)
		}
	}

	ds = sync_ds.MutexWrap(ds)

	return ds, nil
}

func GetMessengerDBForPath(dir string, key []byte, salt []byte, logger *zap.Logger) (*gorm.DB, func(), error) {
	if dir != InMemoryDir {
		dir = path.Join(dir, MessengerDatabaseFilename)
	}

	return GetGormDBForPath(dir, key, salt, logger)
}

func GetReplicationDBForPath(dir string, logger *zap.Logger) (*gorm.DB, func(), error) {
	return getServiceDBForPath(dir, ReplicationDatabaseFilename, logger)
}

func GetDirectoryServiceDBForPath(dir string, logger *zap.Logger) (*gorm.DB, func(), error) {
	return getServiceDBForPath(dir, DirectoryServiceDatabaseFilename, logger)
}

func getServiceDBForPath(dir string, serviceFilename string, logger *zap.Logger) (*gorm.DB, func(), error) {
	if dir != InMemoryDir {
		dir = path.Join(dir, serviceFilename)
	}

	return GetGormDBForPath(dir, nil, nil, logger)
}

const (
	saltLength = 16
	keyLength  = 32
)

func GetGormDBForPath(dbPath string, key []byte, salt []byte, logger *zap.Logger) (*gorm.DB, func(), error) {
	var sqliteConn string
	if dbPath == InMemoryDir {
		sqliteConn = fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())
	} else {
		sqliteConn = dbPath
		args := []string{
			"_journal_mode=WAL",
		}
		if len(key) != 0 {
			if len(key) != keyLength {
				return nil, nil, errcode.ErrCode_TODO.Wrap(fmt.Errorf("bad key, expected %d bytes, got %d", keyLength, len(key)))
			}
			if len(salt) != saltLength {
				return nil, nil, errcode.ErrCode_TODO.Wrap(fmt.Errorf("bad salt, expected %d bytes, got %d", saltLength, len(salt)))
			}
			args = append(args,
				fmt.Sprintf("_pragma_key=x'%s'", hex.EncodeToString(key)),
				"_pragma_cipher_plaintext_header_size=32",
				fmt.Sprintf("_pragma_cipher_salt=x'%s'", hex.EncodeToString(salt)),
				"_pragma_cipher_page_size=4096",
			)
		}
		sqliteConn += fmt.Sprintf("?%s", strings.Join(args, "&"))
	}

	cfg := &gorm.Config{
		Logger:                                   zapgorm2.New(logger.Named("gorm")),
		DisableForeignKeyConstraintWhenMigrating: true,
	}
	db, err := gorm.Open(sqlite.Open(sqliteConn), cfg)
	if err != nil {
		return nil, nil, errcode.ErrCode_TODO.Wrap(err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, fmt.Errorf("unable to gorm underlying db: %w", err)
	}

	sqlDB.SetMaxOpenConns(1)

	return db, func() {
		_ = sqlDB.Close()
	}, nil
}
