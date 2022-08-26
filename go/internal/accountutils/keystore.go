package accountutils

import (
	crand "crypto/rand"
	"fmt"
	"sync"

	"go.uber.org/multierr"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type NativeKeystore interface {
	Put(key string, data []byte) error
	Get(key string) ([]byte, error)
}

type MemNativeKeystore struct {
	dict map[string][]byte
}

var _ NativeKeystore = (*MemNativeKeystore)(nil)

func (ks *MemNativeKeystore) Get(key string) ([]byte, error) {
	value, ok := ks.dict[key]
	if !ok {
		return nil, errcode.ErrNotFound
	}
	return value, nil
}

func (ks *MemNativeKeystore) Put(key string, value []byte) error {
	ks.dict[key] = value
	return nil
}

func NewMemNativeKeystore() NativeKeystore {
	return &MemNativeKeystore{dict: make(map[string][]byte)}
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

func GetOrCreateGlobalSalt(ks NativeKeystore, name string) ([]byte, error) {
	return getOrCreateKeystoreKey(ks, fmt.Sprintf("%s/global/salt/%s", StorageKeyName, name), StorageSaltSize)
}

func GetOrCreateGlobalAppStorageSalt(ks NativeKeystore) ([]byte, error) {
	return GetOrCreateGlobalSalt(ks, "app-storage")
}

func GetOrCreateSaltForAccount(ks NativeKeystore, accountID string, name string) ([]byte, error) {
	return getOrCreateKeystoreKey(ks, fmt.Sprintf("%s/%s/salt/%s", StorageKeyName, accountID, name), StorageSaltSize)
}

func GetOrCreateAppStorageSaltForAccount(ks NativeKeystore, accountID string) ([]byte, error) {
	return GetOrCreateSaltForAccount(ks, accountID, "app-storage")
}

func GetOrCreateMessengerDBSaltForAccount(ks NativeKeystore, accountID string) ([]byte, error) {
	return GetOrCreateSaltForAccount(ks, accountID, "messenger-db")
}

func GetOrCreateRootDatastoreSaltForAccount(ks NativeKeystore, accountID string) ([]byte, error) {
	return GetOrCreateSaltForAccount(ks, accountID, "root-datastore")
}

func GetOrCreateIPFSDatastoreSaltForAccount(ks NativeKeystore, accountID string) ([]byte, error) {
	return GetOrCreateSaltForAccount(ks, accountID, "ipfs-datastore")
}
