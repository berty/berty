package bertyaccount

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) LogfileList(ctx context.Context, req *accounttypes.LogfileList_Request) (*accounttypes.LogfileList_Reply, error) {
	rootDir := s.appRootDir

	accounts, err := s.ListAccounts(ctx, nil)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ret := accounttypes.LogfileList_Reply{}

	for _, account := range accounts.Accounts {
		logsDir := filepath.Join(accountutils.GetAccountDir(rootDir, account.AccountID), "logs")
		files, err := logutil.LogfileList(logsDir)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
		for _, file := range files {
			errs := ""
			if file.Errs != nil {
				errs = file.Errs.Error()
			}
			ret.Entries = append(ret.Entries, &accounttypes.LogfileList_Reply_Logfile{
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

func (s *service) StreamLogfile(req *accounttypes.StreamLogfile_Request, server accounttypes.AccountService_StreamLogfileServer) error {
	if req.AccountID == "" {
		return errcode.TODO.Wrap(fmt.Errorf("AccountID is required"))
	}

	rootDir := s.appRootDir

	accounts, err := s.ListAccounts(s.rootCtx, nil)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	var account *accounttypes.AccountMetadata
	{
		for _, a := range accounts.Accounts {
			if req.AccountID == a.GetAccountID() {
				account = a
				break
			}
		}

		if account == nil {
			return errcode.TODO.Wrap(fmt.Errorf("AccoundID is not found"))
		}
	}

	logsDir := filepath.Join(accountutils.GetAccountDir(rootDir, account.AccountID), "logs")

	logfilePath, err := logutil.CurrentLogfilePath(logsDir)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	file, err := os.Open(logfilePath)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	defer file.Close()

	// send filename
	if err := server.Send(&accounttypes.StreamLogfile_Reply{
		FileName: logfilePath,
	}); err != nil {
		return errcode.TODO.Wrap(err)
	}

	// stream log file
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		err := server.Send(&accounttypes.StreamLogfile_Reply{
			Line: scanner.Text(),
		})

		switch err {
		case nil: // ok
		case io.EOF:
			return nil
		default:
			return errcode.TODO.Wrap(err)
		}
	}
	return nil
}
