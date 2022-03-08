package accountutils

import (
	"context"
	crand "crypto/rand"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"sync"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	"github.com/gogo/protobuf/proto"
	"github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	encrepo "berty.tech/go-ipfs-repo-encrypted"
)

const (
	InMemoryDir                 = ":memory:"
	DefaultPushKeyFilename      = "push.key"
	AccountMetafileName         = "account_meta"
	AccountNetConfFileName      = "account_net_conf"
	MessengerDatabaseFilename   = "messenger.sqlite"
	ReplicationDatabaseFilename = "replication.sqlite"
	StorageKeyName              = "storage"
	StorageKeySize              = 32
	StorageSaltName             = "storage_salt"
	StorageSaltSize             = 16
)

func GetDevicePushKeyForPath(filePath string, createIfMissing bool) (pk *[cryptoutil.KeySize]byte, sk *[cryptoutil.KeySize]byte, err error) {
	contents, err := ioutil.ReadFile(filePath)
	if os.IsNotExist(err) && createIfMissing {
		if err := os.MkdirAll(path.Dir(filePath), 0o700); err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(err)
		}

		pk, sk, err = box.GenerateKey(crand.Reader)
		if err != nil {
			return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		contents = make([]byte, cryptoutil.KeySize*2)
		for i := 0; i < cryptoutil.KeySize; i++ {
			contents[i] = pk[i]
			contents[i+cryptoutil.KeySize] = sk[i]
		}

		if _, err := os.Create(filePath); err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(err)
		}

		if err := ioutil.WriteFile(filePath, contents, 0o600); err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(err)
		}

		return pk, sk, nil
	} else if err != nil {
		return nil, nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("unable to get device push key"))
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
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	subitems, err := ioutil.ReadDir(accountsDir)
	if err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
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
				accounts = append(accounts, &accounttypes.AccountMetadata{Error: err.Error(), AccountID: subitem.Name()})
				continue
			}
		}

		var storageSalt []byte
		if ks != nil {
			var err error
			if storageSalt, err = GetOrCreateStorageSaltForAccount(ks, subitem.Name()); err != nil {
				accounts = append(accounts, &accounttypes.AccountMetadata{Error: err.Error(), AccountID: subitem.Name()})
				continue
			}
		}

		account, err := GetAccountMetaForName(ctx, rootDir, subitem.Name(), storageKey, storageSalt, logger)
		if err != nil {
			accounts = append(accounts, &accounttypes.AccountMetadata{Error: err.Error(), AccountID: subitem.Name()})
		} else {
			accounts = append(accounts, account)
		}
	}

	return accounts, nil
}

var storageKeyMutex = sync.Mutex{}

func getOrCreateKeystoreKey(ks NativeKeystore, keyName string, keySize int) ([]byte, error) {
	storageKeyMutex.Lock()
	defer storageKeyMutex.Unlock()

	key, getErr := ks.Get(keyName)
	if getErr != nil {
		keyData := make([]byte, keySize)
		if _, err := crand.Read(keyData); err != nil {
			return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		if err := ks.Put(keyName, keyData); err != nil {
			return nil, errcode.ErrKeystorePut.Wrap(multierr.Append(getErr, err))
		}

		var err error
		if key, err = ks.Get(keyName); err != nil {
			return nil, errcode.ErrKeystoreGet.Wrap(multierr.Append(getErr, err))
		}
	}
	return key, nil
}

func GetOrCreateMasterStorageKey(ks NativeKeystore) ([]byte, error) {
	return getOrCreateKeystoreKey(ks, StorageKeyName, StorageKeySize)
}

func GetOrCreateStorageKeyForAccount(ks NativeKeystore, accountID string) ([]byte, error) {
	return getOrCreateKeystoreKey(ks, fmt.Sprintf("%s/%s", StorageKeyName, accountID), StorageKeySize)
}

func GetOrCreateMasterStorageSalt(ks NativeKeystore) ([]byte, error) {
	return getOrCreateKeystoreKey(ks, StorageSaltName, StorageSaltSize)
}

func GetOrCreateStorageSaltForAccount(ks NativeKeystore, accountID string) ([]byte, error) {
	return getOrCreateKeystoreKey(ks, fmt.Sprintf("%s/%s/salt", StorageKeyName, accountID), StorageSaltSize)
}

func GetAccountMetaForName(ctx context.Context, rootDir string, accountID string, storageKey []byte, storageSalt []byte, logger *zap.Logger) (*accounttypes.AccountMetadata, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	ds, err := GetRootDatastoreForPath(GetAccountDir(rootDir, accountID), storageKey, storageSalt, logger)
	if err != nil {
		return nil, errcode.ErrBertyAccountFSError.Wrap(err)
	}

	metaBytes, err := ds.Get(ctx, datastore.NewKey(AccountMetafileName))
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrBertyAccountDataNotFound
	} else if err != nil {
		logger.Warn("unable to read account metadata", zap.Error(err), logutil.PrivateString("account-id", accountID))
		return nil, errcode.ErrBertyAccountFSError.Wrap(fmt.Errorf("unable to read account metadata: %w", err))
	}

	if err := ds.Close(); err != nil {
		return nil, errcode.ErrDBClose.Wrap(err)
	}

	meta := &accounttypes.AccountMetadata{}
	if err := proto.Unmarshal(metaBytes, meta); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshal account metadata: %w", err))
	}

	meta.AccountID = accountID

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

func GetDatastoreDir(dir string) (string, error) {
	switch {
	case dir == "":
		return "", errcode.TODO.Wrap(fmt.Errorf("--store.dir is empty"))
	case dir == InMemoryDir:
		return InMemoryDir, nil
	}

	_, err := os.Stat(dir)
	switch {
	case os.IsNotExist(err):
		if err := os.MkdirAll(dir, 0o700); err != nil {
			return "", errcode.TODO.Wrap(err)
		}
	case err != nil:
		return "", errcode.TODO.Wrap(err)
	}

	return dir, nil
}

func GetAccountAppStorage(rootDir string, accountID string, key []byte, salt []byte) (datastore.Datastore, error) {
	dbPath := filepath.Join(GetAccountDir(rootDir, accountID), "app-account.sqlite")
	return encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "data", key, salt)
}

func GetRootDatastoreForPath(dir string, key []byte, salt []byte, logger *zap.Logger) (datastore.Batching, error) {
	inMemory := dir == InMemoryDir

	var ds datastore.Batching
	if inMemory {
		ds = datastore.NewMapDatastore()
	} else {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		dbPath := filepath.Join(dir, "datastore.sqlite")
		ds, err = encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "blocks", key, salt)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	ds = sync_ds.MutexWrap(ds)

	return ds, nil
}

func GetMessengerDBForPath(dir string, key []byte, logger *zap.Logger) (*gorm.DB, func(), error) {
	if dir != InMemoryDir {
		dir = path.Join(dir, MessengerDatabaseFilename)
	}

	return GetGormDBForPath(dir, key, logger)
}

func GetReplicationDBForPath(dir string, logger *zap.Logger) (*gorm.DB, func(), error) {
	if dir != InMemoryDir {
		dir = path.Join(dir, ReplicationDatabaseFilename)
	}

	return GetGormDBForPath(dir, nil, logger)
}

func GetGormDBForPath(dbPath string, key []byte, logger *zap.Logger) (*gorm.DB, func(), error) {
	var sqliteConn string
	if dbPath == InMemoryDir {
		sqliteConn = fmt.Sprintf("file:memdb%d?mode=memory&cache=shared", time.Now().UnixNano())
	} else {
		sqliteConn = dbPath
		if len(key) != 0 {
			hexKey := hex.EncodeToString(key)
			sqliteConn = fmt.Sprintf("%s?_pragma_key=x'%s'&_pragma_cipher_page_size=4096", sqliteConn, hexKey)
		}
	}

	cfg := &gorm.Config{
		Logger:                                   zapgorm2.New(logger.Named("gorm")),
		DisableForeignKeyConstraintWhenMigrating: true,
	}
	db, err := gorm.Open(sqlite.Open(sqliteConn), cfg)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return db, func() {
		sqlDB, _ := db.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}, nil
}
