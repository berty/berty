package bertyaccount

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/zapcoregorm"
)

const (
	logDriverSQLite = "sqlite"
	logDriverFiles  = "files"
)

type logSessionFetcher = func(rootDir, accountID string, storageKey []byte, logger *zap.Logger) (entries []*accounttypes.LogSessionList_Reply_LogSession)

var logSessionFetchers = []logSessionFetcher{
	logSessionFetchFiles,
	logSessionFetchSQLite,
}

func (s *service) LogSessionList(ctx context.Context, req *accounttypes.LogSessionList_Request) (*accounttypes.LogSessionList_Reply, error) {
	if !u.DirExists(s.rootdir) {
		if err := os.MkdirAll(s.rootdir, 0o700); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	accounts, err := s.ListAccounts(ctx, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ret := accounttypes.LogSessionList_Reply{}

	for _, account := range accounts.Accounts {
		for _, fetchSessions := range logSessionFetchers {
			ret.Entries = append(ret.Entries, fetchSessions(s.rootdir, account.AccountID, s.storageKey, s.logger)...)
		}
	}

	return &ret, nil
}

func logSessionFetchFiles(rootDir, accountID string, storageKey []byte, logger *zap.Logger) (entries []*accounttypes.LogSessionList_Reply_LogSession) {
	logsDir := filepath.Join(accountutils.GetAccountDir(rootDir, accountID), "logs")

	files, err := logutil.LogfileList(logsDir)
	if err != nil {
		return append(entries, &accounttypes.LogSessionList_Reply_LogSession{
			Driver:    logDriverFiles,
			AccountID: accountID,
			Path:      logsDir,
			Errs:      err.Error(),
		})
	}

	for _, file := range files {
		errs := ""
		if file.Errs != nil {
			errs = file.Errs.Error()
		}
		entries = append(entries, &accounttypes.LogSessionList_Reply_LogSession{
			AccountID:       accountID,
			Path:            file.Path(),
			DriverSessionID: file.Name,
			Size_:           file.Size,
			Kind:            file.Kind,
			Time:            file.Time.Unix(),
			Latest:          file.Latest,
			Errs:            errs,
		})
	}

	return entries
}

func logSessionFetchSQLite(rootDir, accountID string, storageKey []byte, logger *zap.Logger) (entries []*accounttypes.LogSessionList_Reply_LogSession) {
	dbPath := filepath.Join(accountutils.GetAccountDir(rootDir, accountID), "logs.sqlite")

	if _, err := os.Stat(dbPath); err != nil {
		return entries
	}

	var sessions []zapcoregorm.LogSession
	db, closeDB, err := accountutils.GetGormDBForPath(dbPath, storageKey, logger)
	if err == nil {
		defer closeDB()
		sessions, err = zapcoregorm.LogSessionList(db)
		if err != nil {
			err = errcode.ErrDBRead.Wrap(err)
		}
	} else {
		err = errcode.ErrDBOpen.Wrap(err)
	}
	if err != nil {
		return append(entries, &accounttypes.LogSessionList_Reply_LogSession{
			Driver:    logDriverSQLite,
			AccountID: accountID,
			Errs:      err.Error(),
			Path:      dbPath,
		})
	}

	for _, sess := range sessions {
		entries = append(entries, &accounttypes.LogSessionList_Reply_LogSession{
			Driver:          logDriverSQLite,
			AccountID:       accountID,
			DriverSessionID: fmt.Sprint(sess.ID),
			Kind:            sess.Kind,
			Time:            sess.Time.Unix(),
			Path:            dbPath,
		})
	}

	if len(sessions) != 0 {
		entries[len(entries)-1].Latest = true
	}

	return entries
}
