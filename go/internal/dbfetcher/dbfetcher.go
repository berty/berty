package dbfetcher

import (
	"fmt"

	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type DBFetcher interface {
	GetAccount() (*messengertypes.Account, error)
	GetContactByPK(publicKey string) (*messengertypes.Contact, error)
	GetCurrentPushServers() ([]*messengertypes.PushServer, error)
	GetMuteStatusForConversation(key string) (accountMuted bool, conversationMuted bool, err error)
}

type dbFetcher struct {
	*messengerdb.DBWrapper
	accountPK string
}

func NewDBFetcher(accountPK string, db *messengerdb.DBWrapper) DBFetcher {
	return &dbFetcher{
		DBWrapper: db,
		accountPK: accountPK,
	}
}

func (f *dbFetcher) GetCurrentPushServers() ([]*messengertypes.PushServer, error) {
	pushServers := []*messengertypes.PushServer(nil)

	if f.DBWrapper == nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("db not initialized"))
	}

	if len(f.accountPK) == 0 {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("account group not initialized"))
	}

	pushServerRecords, err := f.GetPushServerRecords(f.accountPK)
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
