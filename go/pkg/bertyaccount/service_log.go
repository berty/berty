package bertyaccount

import (
	"context"
	"os"
	"path/filepath"

	"moul.io/u"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) LogfileList(ctx context.Context, req *LogfileList_Request) (*LogfileList_Reply, error) {
	if !u.DirExists(s.rootdir) {
		if err := os.MkdirAll(s.rootdir, 0o700); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	accounts, err := s.ListAccounts(ctx, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ret := LogfileList_Reply{}

	for _, account := range accounts.Accounts {
		logsDir := filepath.Join(s.rootdir, account.AccountID, "logs")
		files, err := logutil.LogfileList(logsDir)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
		for _, file := range files {
			errs := ""
			if file.Errs != nil {
				errs = file.Errs.Error()
			}
			ret.Entries = append(ret.Entries, &LogfileList_Reply_Logfile{
				AccountID: account.AccountID,
				Path:      file.Path(),
				Name:      file.Name,
				Size_:     file.Size,
				Kind:      file.Kind,
				Time:      file.Time.Unix(),
				Latest:    file.Latest,
				Errs:      errs,
			})
		}
	}

	return &ret, nil
}
