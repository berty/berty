package bertyaccount

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/logutil"
)

func (s *service) LogfileList(ctx context.Context, _ *accounttypes.LogfileList_Request) (*accounttypes.LogfileList_Reply, error) {
	rootDir := s.appRootDir

	accounts, err := s.ListAccounts(ctx, nil)
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(err)
	}

	ret := accounttypes.LogfileList_Reply{}

	for _, account := range accounts.Accounts {
		logsDir := filepath.Join(accountutils.GetAccountDir(rootDir, account.AccountId), "logs")
		files, err := logutil.LogfileList(logsDir)
		if err != nil {
			return nil, errcode.ErrCode_TODO.Wrap(err)
		}
		for _, file := range files {
			errs := ""
			if file.Errs != nil {
				errs = file.Errs.Error()
			}
			ret.Entries = append(ret.Entries, &accounttypes.LogfileList_Reply_Logfile{
				AccountId: account.AccountId,
				Path:      file.Path(),
				Name:      file.Name,
				Size:      file.Size,
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
	if req.AccountId == "" {
		return errcode.ErrCode_TODO.Wrap(fmt.Errorf("AccountId is required"))
	}

	rootDir := s.appRootDir

	accounts, err := s.ListAccounts(s.rootCtx, nil)
	if err != nil {
		return errcode.ErrCode_TODO.Wrap(err)
	}

	var account *accounttypes.AccountMetadata
	{
		for _, a := range accounts.Accounts {
			if req.AccountId == a.GetAccountId() {
				account = a
				break
			}
		}

		if account == nil {
			return errcode.ErrCode_TODO.Wrap(fmt.Errorf("AccoundID is not found"))
		}
	}

	logsDir := filepath.Join(accountutils.GetAccountDir(rootDir, account.AccountId), "logs")

	logfilePath, err := logutil.CurrentLogfilePath(logsDir)
	if err != nil {
		return errcode.ErrCode_TODO.Wrap(err)
	}

	file, err := os.Open(logfilePath)
	if err != nil {
		return errcode.ErrCode_TODO.Wrap(err)
	}
	defer file.Close()

	// send filename
	if err := server.Send(&accounttypes.StreamLogfile_Reply{
		FileName: logfilePath,
	}); err != nil {
		return errcode.ErrCode_TODO.Wrap(err)
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
			return errcode.ErrCode_TODO.Wrap(err)
		}
	}
	return nil
}
