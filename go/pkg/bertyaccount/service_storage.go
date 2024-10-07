package bertyaccount

import (
	context "context"

	"github.com/ipfs/go-datastore"
	"go.uber.org/multierr"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) AppStorageGet(ctx context.Context, req *accounttypes.AppStorageGet_Request) (reply *accounttypes.AppStorageGet_Reply, outErr error) {
	var storage datastore.Datastore
	if req.GetGlobal() {
		if s.appStorage == nil {
			return nil, errcode.ErrCode_ErrAppStorageNotSupported
		}

		storage = s.appStorage
	} else {
		s.muService.Lock()
		defer s.muService.Unlock()

		accountID := s.accountData.GetAccountId()
		if accountID == "" {
			return nil, errcode.ErrCode_ErrBertyAccountDataNotFound
		}

		var storageKey []byte
		if s.nativeKeystore != nil {
			var err error
			if storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(s.nativeKeystore, accountID); err != nil {
				return nil, err
			}
		}

		var storageSalt []byte
		if s.nativeKeystore != nil {
			var err error
			if storageSalt, err = accountutils.GetOrCreateAppStorageSaltForAccount(s.nativeKeystore, accountID); err != nil {
				return nil, err
			}
		}

		var err error
		if storage, err = accountutils.GetAccountAppStorage(s.appRootDir, accountID, storageKey, storageSalt); err != nil {
			return nil, errcode.ErrCode_TODO.Wrap(err)
		}
		defer func() { outErr = multierr.Append(outErr, storage.Close()) }()
	}

	value, err := storage.Get(ctx, datastore.NewKey(req.GetKey()))
	if err != nil {
		return nil, errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	return &accounttypes.AppStorageGet_Reply{Value: value}, nil
}

func (s *service) AppStoragePut(ctx context.Context, req *accounttypes.AppStoragePut_Request) (reply *accounttypes.AppStoragePut_Reply, outErr error) {
	var storage datastore.Datastore
	if req.GetGlobal() {
		if s.appStorage == nil {
			return nil, errcode.ErrCode_ErrAppStorageNotSupported
		}

		storage = s.appStorage
	} else {
		s.muService.Lock()
		defer s.muService.Unlock()

		accountID := s.accountData.GetAccountId()
		if accountID == "" {
			return nil, errcode.ErrCode_ErrBertyAccountDataNotFound
		}

		var storageKey []byte
		if s.nativeKeystore != nil {
			var err error
			if storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(s.nativeKeystore, accountID); err != nil {
				return nil, err
			}
		}

		var storageSalt []byte
		if s.nativeKeystore != nil {
			var err error
			if storageSalt, err = accountutils.GetOrCreateAppStorageSaltForAccount(s.nativeKeystore, accountID); err != nil {
				return nil, err
			}
		}

		var err error
		if storage, err = accountutils.GetAccountAppStorage(s.appRootDir, accountID, storageKey, storageSalt); err != nil {
			return nil, errcode.ErrCode_TODO.Wrap(err)
		}
		defer func() { outErr = multierr.Append(outErr, storage.Close()) }()
	}

	err := storage.Put(ctx, datastore.NewKey(req.GetKey()), req.GetValue())
	if err != nil {
		return nil, errcode.ErrCode_ErrDBWrite.Wrap(err)
	}

	return &accounttypes.AppStoragePut_Reply{}, nil
}

func (s *service) AppStorageRemove(ctx context.Context, req *accounttypes.AppStorageRemove_Request) (reply *accounttypes.AppStorageRemove_Reply, outErr error) {
	var storage datastore.Datastore
	if req.GetGlobal() {
		if s.appStorage == nil {
			return nil, errcode.ErrCode_ErrAppStorageNotSupported
		}

		storage = s.appStorage
	} else {
		s.muService.Lock()
		defer s.muService.Unlock()

		accountID := s.accountData.GetAccountId()
		if accountID == "" {
			return nil, errcode.ErrCode_ErrBertyAccountDataNotFound
		}

		var storageKey []byte
		if s.nativeKeystore != nil {
			var err error
			if storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(s.nativeKeystore, accountID); err != nil {
				return nil, err
			}
		}

		var storageSalt []byte
		if s.nativeKeystore != nil {
			var err error
			if storageSalt, err = accountutils.GetOrCreateAppStorageSaltForAccount(s.nativeKeystore, accountID); err != nil {
				return nil, err
			}
		}

		var err error
		if storage, err = accountutils.GetAccountAppStorage(s.appRootDir, accountID, storageKey, storageSalt); err != nil {
			return nil, errcode.ErrCode_TODO.Wrap(err)
		}
		defer func() { outErr = multierr.Append(outErr, storage.Close()) }()
	}

	err := storage.Delete(ctx, datastore.NewKey(req.GetKey()))
	if err != nil {
		return nil, errcode.ErrCode_ErrDBWrite.Wrap(err)
	}

	return &accounttypes.AppStorageRemove_Reply{}, nil
}
