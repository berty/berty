package bertyaccount

import (
	context "context"

	"github.com/ipfs/go-datastore"

	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) AppStorageGet(ctx context.Context, req *accounttypes.AppStorageGet_Request) (*accounttypes.AppStorageGet_Reply, error) {
	if s.appStorage == nil {
		return nil, errcode.ErrAppStorageNotSupported
	}

	value, err := s.appStorage.Get(datastore.NewKey(req.GetKey()))
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	return &accounttypes.AppStorageGet_Reply{Value: value}, nil
}

func (s *service) AppStoragePut(ctx context.Context, req *accounttypes.AppStoragePut_Request) (*accounttypes.AppStoragePut_Reply, error) {
	if s.appStorage == nil {
		return nil, errcode.ErrAppStorageNotSupported
	}

	err := s.appStorage.Put(datastore.NewKey(req.GetKey()), req.GetValue())
	if err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &accounttypes.AppStoragePut_Reply{}, nil
}

func (s *service) AppStorageRemove(ctx context.Context, req *accounttypes.AppStorageRemove_Request) (*accounttypes.AppStorageRemove_Reply, error) {
	if s.appStorage == nil {
		return nil, errcode.ErrAppStorageNotSupported
	}

	err := s.appStorage.Delete(datastore.NewKey(req.GetKey()))
	if err != nil {
		return nil, errcode.ErrDBWrite.Wrap(err)
	}

	return &accounttypes.AppStorageRemove_Reply{}, nil
}
