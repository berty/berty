package messengerdb

import (
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// implement bertypush.DBFetcher

type dbFetcher struct {
	db        *DBWrapper
	accountPK string
}

func NewDBFetcher(accountPK string, db *DBWrapper) *dbFetcher {
	return &dbFetcher{
		db:        db,
		accountPK: accountPK,
	}
}

func (f *dbFetcher) GetCurrentPushServers() ([]*messengertypes.PushServer, error) {
	pushServers := []*messengertypes.PushServer(nil)

	if f.db == nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("db not initialized"))
	}

	if len(f.accountPK) == 0 {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("account group not initialized"))
	}

	pushServerRecords, err := f.db.GetPushServerRecords(f.accountPK)
	if err != nil {
		return nil, errcode.ErrPushServerNotFound.Wrap(err)
	}

	for _, pushServerRecord := range pushServerRecords {
		pushServer := &messengertypes.PushServer{
			Addr: pushServerRecord.ServerAddr,
			Key:  pushServerRecord.ServerKey,
		}
		pushServers = append(pushServers, pushServer)
	}

	return pushServers, nil
}
