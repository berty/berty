package bertyaccount_test

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"moul.io/godev"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestSyncFlow(t *testing.T) {
	// prepare deps
	tempdir, err := ioutil.TempDir("", "berty-account")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx := context.Background()

	// init service
	svc, err := bertyaccount.NewService(&bertyaccount.Options{
		RootDirectory: filepath.Join(tempdir, "root"),
		Logger:        logger,
	})
	require.NoError(t, err)
	defer svc.Close()

	cl := bertyaccount.TestingAccountClient(ctx, t, svc)

	// no account by default
	{
		rep, err := cl.ListAccounts(ctx, &accounttypes.ListAccounts_Request{})
		require.NoError(t, err)
		require.Empty(t, rep.Accounts)
	}

	// no logs by default
	{
		rep, err := cl.LogfileList(ctx, &accounttypes.LogfileList_Request{})
		require.NoError(t, err)
		require.Empty(t, rep.Entries)
	}

	// try closing an account even if none were loaded
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.Equal(t, err, io.EOF)
		// FIXME: should return an error?
	}

	// try to open a non-existing account
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID: "account 1",
		})
		require.NoError(t, err)

		// check that we only have init or ErrBertyAccountDataNotFound error.
		// retry up to 10s.
		var gotErr bool
		for i := 0; i < 1000; i++ {
			msg, err := stream.Recv()
			if err != nil {
				require.Nil(t, msg)
				require.True(t, errcode.Has(err, errcode.ErrBertyAccountDataNotFound))
				gotErr = true
				break
			}

			// the only kind of non-error message accepted is "init"
			if msg != nil && msg.Progress != nil && msg.Progress.Doing != "" {
				require.Equal(t, msg.Progress.Doing, "init")
				require.NoError(t, err)
				continue
			}

			time.Sleep(10 * time.Millisecond)
		}
		require.True(t, gotErr)
	}

	// create and load a new account
	{
		rep, err := cl.CreateAccount(ctx, &accounttypes.CreateAccount_Request{
			AccountID:   "account 1",
			AccountName: "my first account",
		})
		require.NoError(t, err)
		require.Equal(t, "account 1", rep.AccountMetadata.AccountID)
		require.Equal(t, "my first account", rep.AccountMetadata.Name)
		require.NotZero(t, rep.AccountMetadata.LastOpened)
	}

	// 1 account now
	{
		rep, err := cl.ListAccounts(ctx, &accounttypes.ListAccounts_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Accounts, 1)
		require.Equal(t, rep.Accounts[0].AccountID, "account 1")
		require.Equal(t, rep.Accounts[0].Name, "my first account")
		require.NotZero(t, rep.Accounts[0].LastOpened)
		require.NotZero(t, rep.Accounts[0].CreationDate)
	}

	// try to open an account while we already have an account loaded
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID: "account 1",
		})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.True(t, errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened))
	}

	// one log file
	{
		rep, err := cl.LogfileList(ctx, &accounttypes.LogfileList_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Entries, 1)
		require.Equal(t, rep.Entries[0].AccountID, "account 1")
		require.Equal(t, rep.Entries[0].Kind, "mobile")
		require.True(t, strings.HasPrefix(rep.Entries[0].Name, "mobile-"))
		require.NotEmpty(t, rep.Entries[0].Path)
		require.NotEmpty(t, rep.Entries[0].Time)
		require.NotEmpty(t, rep.Entries[0].Size)
		require.True(t, rep.Entries[0].Latest)
	}

	// close the account
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"close-client-conn" progress:0.115384616 completed:1 total:13 delay:113
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:206
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:210
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:212
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:215
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:217
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:220
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:222
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:224
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:226
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:228
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:231
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:233
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:235
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:237
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:239
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:242
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:244
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:355
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:371
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:379
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:385
			// state:"in progress" doing:"cleanup-messenger-db" progress:0.5769231 completed:7 total:13 delay:495
			// state:"in progress" doing:"close-protocol-server" progress:0.65384614 completed:8 total:13 delay:522
			// state:"in progress" doing:"cleanup-ipfs-webui" progress:0.7307692 completed:9 total:13 delay:535
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:544
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:548
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:551
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:554
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:557
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:561
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:564
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:567
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:570
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17792
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17819
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 100us and 1m
		// in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Microsecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// try closing the account again, even if no account should be loaded anymore
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.Equal(t, err, io.EOF)
		// FIXME: should return an error?
	}

	// load the account
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID: "account 1",
		})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"init" progress:0.125 total:4 delay:24
			// state:"in progress" doing:"setup-logger" progress:0.375 completed:2 total:4 delay:152
			// state:"in progress" doing:"setup-manager" progress:0.625 completed:2 total:4 delay:173
			// state:"done" progress:1 completed:4 total:4 delay:622311
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, int(lastProgress.Completed), 11) // this test can be disabled if it breaks, the test just above can be considered as enough
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 50ms and 1m
		// in general, it's around 600ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(50*time.Millisecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// try closing the account again, even if no account should be loaded anymore
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"close-client-conn" progress:0.115384616 completed:1 total:13 delay:113
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:206
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:210
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:212
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:215
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:217
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:220
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:222
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:224
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:226
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:228
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:231
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:233
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:235
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:237
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:239
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:242
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:244
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:355
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:371
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:379
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:385
			// state:"in progress" doing:"cleanup-messenger-db" progress:0.5769231 completed:7 total:13 delay:495
			// state:"in progress" doing:"close-protocol-server" progress:0.65384614 completed:8 total:13 delay:522
			// state:"in progress" doing:"cleanup-ipfs-webui" progress:0.7307692 completed:9 total:13 delay:535
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:544
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:548
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:551
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:554
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:557
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:561
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:564
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:567
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:570
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17792
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17819
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, int(lastProgress.Completed), 16) // this test can be disabled if it breaks, the test just above can be considered as enough
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 100us and 1m
		// in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Microsecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// two log files
	{
		rep, err := cl.LogfileList(ctx, &accounttypes.LogfileList_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Entries, 2)
	}
}

func TestSyncImportExportFlow(t *testing.T) {
	// prepare deps
	tempdir, err := ioutil.TempDir("", "berty-account")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx := context.Background()

	// init service
	svc, err := bertyaccount.NewService(&bertyaccount.Options{
		RootDirectory: filepath.Join(tempdir, "root"),
		Logger:        logger,
	})
	require.NoError(t, err)
	defer svc.Close()

	cl := bertyaccount.TestingAccountClient(ctx, t, svc)

	// no account by default
	{
		rep, err := cl.ListAccounts(ctx, &accounttypes.ListAccounts_Request{})
		require.NoError(t, err)
		require.Empty(t, rep.Accounts)
	}

	// create and load a new account
	{
		rep, err := cl.CreateAccount(ctx, &accounttypes.CreateAccount_Request{
			AccountID:   "account 1",
			AccountName: "my first account",
		})
		require.NoError(t, err)
		require.Equal(t, "account 1", rep.AccountMetadata.AccountID)
		require.Equal(t, "my first account", rep.AccountMetadata.Name)
		require.NotZero(t, rep.AccountMetadata.LastOpened)
	}

	// export account
	exportPath := filepath.Join(tempdir, "export.tar")
	{
		messenger, err := svc.GetMessengerClient()
		require.NoError(t, err)

		f, err := os.Create(exportPath)
		require.NoError(t, err)

		cl, err := messenger.InstanceExportData(ctx, &messengertypes.InstanceExportData_Request{})
		require.NoError(t, err)
		for {
			chunk, err := cl.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)

			_, err = f.Write(chunk.ExportedData)
			require.NoError(t, err)
		}

		err = f.Close()
		require.NoError(t, err)
	}

	// close the account
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"close-client-conn" progress:0.115384616 completed:1 total:13 delay:113
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:206
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:210
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:212
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:215
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:217
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:220
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:222
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:224
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:226
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:228
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:231
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:233
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:235
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:237
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:239
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:242
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:244
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:355
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:371
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:379
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:385
			// state:"in progress" doing:"cleanup-messenger-db" progress:0.5769231 completed:7 total:13 delay:495
			// state:"in progress" doing:"close-protocol-server" progress:0.65384614 completed:8 total:13 delay:522
			// state:"in progress" doing:"cleanup-ipfs-webui" progress:0.7307692 completed:9 total:13 delay:535
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:544
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:548
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:551
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:554
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:557
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:561
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:564
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:567
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:570
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17792
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17819
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 100us and 1m
		// in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Microsecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// 1 account now
	{
		rep, err := cl.ListAccounts(ctx, &accounttypes.ListAccounts_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Accounts, 1)
		require.Equal(t, rep.Accounts[0].AccountID, "account 1")
		require.Equal(t, rep.Accounts[0].Name, "my first account")
		require.NotZero(t, rep.Accounts[0].LastOpened)
		require.NotZero(t, rep.Accounts[0].CreationDate)
	}

	// FIXME: test to create an account with existing account id to raise an error

	// init a new account based on previous export
	{
		stream, err := cl.ImportAccount(ctx, &accounttypes.ImportAccount_Request{
			AccountID:   "account 2",
			AccountName: "restored",
			BackupPath:  exportPath,
			// Args: []string{},
			// LoggerFilters: "",
		})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		var lastMsg *accounttypes.ImportAccount_Reply
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			if msg.Progress != nil {
				lastProgress = msg.Progress
			}
			lastMsg = msg

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// TODO, but similar with open account while we don't have import-specific steps
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, int(lastProgress.Completed), 11) // this test can be disabled if it breaks, the test just above can be considered as enough
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 50ms and 5m
		// in general, it's around 600ms on Manfred's Linux server
		require.Greater(t, time.Microsecond*time.Duration(lastProgress.Delay), 50*time.Millisecond)
		require.Less(t, time.Microsecond*time.Duration(lastProgress.Delay), 5*time.Minute)

		require.NotEmpty(t, lastMsg)
		require.Equal(t, lastMsg.AccountMetadata.AccountID, "account 2")
		require.Equal(t, lastMsg.AccountMetadata.Name, "restored")
		require.NotEmpty(t, lastMsg.AccountMetadata.PublicKey)
		require.NotZero(t, lastMsg.AccountMetadata.LastOpened)
		require.NotZero(t, lastMsg.AccountMetadata.CreationDate)
		// FIXME: compare public key
	}

	// 2 accounts now
	{
		rep, err := cl.ListAccounts(ctx, &accounttypes.ListAccounts_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Accounts, 2)

		require.Equal(t, rep.Accounts[0].AccountID, "account 1")
		require.Equal(t, rep.Accounts[0].Name, "my first account")
		require.NotZero(t, rep.Accounts[0].LastOpened)
		require.NotZero(t, rep.Accounts[0].CreationDate)

		require.Equal(t, rep.Accounts[1].AccountID, "account 2")
		require.Equal(t, rep.Accounts[1].Name, "restored")
		require.NotZero(t, rep.Accounts[1].LastOpened)
		require.NotZero(t, rep.Accounts[1].CreationDate)
	}

	// try to open an account while we already have an account loaded
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID: "account 2",
		})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.True(t, errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened))
	}

	// close the account
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// not very useful to know this here
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 100us and 1m
		// in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Microsecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// load the restored account
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID: "account 2",
		})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"init" progress:0.125 total:4 delay:24
			// state:"in progress" doing:"setup-logger" progress:0.375 completed:2 total:4 delay:152
			// state:"in progress" doing:"setup-manager" progress:0.625 completed:2 total:4 delay:173
			// state:"done" progress:1 completed:4 total:4 delay:622311
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, int(lastProgress.Completed), 11) // this test can be disabled if it breaks, the test just above can be considered as enough
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 50ms and 1m
		// in general, it's around 600ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(50*time.Millisecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}
}

func TestAsyncFlow(t *testing.T) {
	// prepare deps
	tempdir, err := ioutil.TempDir("", "berty-account")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx := context.Background()

	// init service
	svc, err := bertyaccount.NewService(&bertyaccount.Options{
		RootDirectory: filepath.Join(tempdir, "root"),
		Logger:        logger,
	})
	require.NoError(t, err)
	defer svc.Close()

	cl := bertyaccount.TestingAccountClient(ctx, t, svc)

	// create and load a new account
	{
		rep, err := cl.CreateAccount(ctx, &accounttypes.CreateAccount_Request{
			AccountID:        "account 1",
			AccountName:      "my first account",
			SkipProtocolInit: true,
		})
		require.NoError(t, err)
		require.Equal(t, "account 1", rep.AccountMetadata.AccountID)
		require.Equal(t, "my first account", rep.AccountMetadata.Name)
		require.NotZero(t, rep.AccountMetadata.LastOpened)
	}

	// 1 account now
	{
		rep, err := cl.ListAccounts(ctx, &accounttypes.ListAccounts_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Accounts, 1)
		require.Equal(t, rep.Accounts[0].AccountID, "account 1")
		require.Equal(t, rep.Accounts[0].Name, "my first account")
		require.NotZero(t, rep.Accounts[0].LastOpened)
		require.NotZero(t, rep.Accounts[0].CreationDate)
	}

	// try to open an account while we already have an account loaded
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID:        "account 1",
			SkipProtocolInit: true,
		})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.True(t, errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened))
	}

	// call a dummy messenger call to prove that it's loaded and ready
	{
		messenger, err := svc.GetMessengerClient()
		require.NoError(t, err)

		ret, err := messenger.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{})
		require.NoError(t, err)
		require.NotNil(t, ret)
		require.NotEmpty(t, ret.InternalURL)
		require.NotEmpty(t, ret.WebURL)

	}

	// check that protocol is not yet loaded
	{
		protocol, err := svc.GetProtocolClient()
		require.NoError(t, err)
		require.Nil(t, protocol)
	}

	// FIXME: check that a messenger call depending on protocol returns an error
	// FIXME: REMOVE
	if false {
		fmt.Println(godev.PrettyJSON(42))
	}
	// FIXME: TRY TO CALL A PROTOCOL ENDPOINT, FAIL
	// FIXME: LOAD THE PROTOCOL
	// FIXME: CALL A PROTOCOL ENDPOINT

	// close the account
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"close-client-conn" progress:0.115384616 completed:1 total:13 delay:113
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:206
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:210
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:212
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:215
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:217
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:220
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:222
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:224
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:226
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:228
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:231
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:233
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:235
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:237
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:239
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:242
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:244
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:355
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:371
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:379
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:385
			// state:"in progress" doing:"cleanup-messenger-db" progress:0.5769231 completed:7 total:13 delay:495
			// state:"in progress" doing:"close-protocol-server" progress:0.65384614 completed:8 total:13 delay:522
			// state:"in progress" doing:"cleanup-ipfs-webui" progress:0.7307692 completed:9 total:13 delay:535
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:544
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:548
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:551
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:554
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:557
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:561
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:564
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:567
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:570
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17792
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17819
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 100us and 1m
		// in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Microsecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// try closing the account again, even if no account should be loaded anymore
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.Equal(t, err, io.EOF)
		// FIXME: should return an error?
	}

	// load the account
	{
		stream, err := cl.OpenAccount(ctx, &accounttypes.OpenAccount_Request{
			AccountID:        "account 1",
			SkipProtocolInit: true,
		})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"init" progress:0.125 total:4 delay:24
			// state:"in progress" doing:"setup-logger" progress:0.375 completed:2 total:4 delay:152
			// state:"in progress" doing:"setup-manager" progress:0.625 completed:2 total:4 delay:173
			// state:"done" progress:1 completed:4 total:4 delay:622311
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, int(lastProgress.Completed), 11) // this test can be disabled if it breaks, the test just above can be considered as enough
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 50ms and 1m
		// in general, it's around 600ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(50*time.Millisecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// FIXME: TRY TO CALL A PROTOCOL ENDPOINT, FAIL
	// FIXME: LOAD THE PROTOCOL
	// FIXME: CALL A PROTOCOL ENDPOINT

	// try closing the account again, even if no account should be loaded anymore
	{
		stream, err := cl.CloseAccount(ctx, &accounttypes.CloseAccount_Request{})
		require.NoError(t, err)
		steps := 0
		var lastProgress *protocoltypes.Progress
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				break
			}
			require.NoError(t, err)
			steps++
			lastProgress = msg.Progress

			// Debug
			// fmt.Println(msg.Progress)
			// Outputs something like:
			// state:"in progress" doing:"close-client-conn" progress:0.115384616 completed:1 total:13 delay:113
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:206
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:210
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:212
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:215
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:217
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:220
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:222
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:224
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:226
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:228
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:231
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:233
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:235
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:237
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:239
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:242
			// state:"in progress" doing:"stop-buf-server" progress:0.1923077 completed:2 total:13 delay:244
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:355
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:371
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:379
			// state:"in progress" doing:"close-messenger-protocol-client" progress:0.5 completed:6 total:13 delay:385
			// state:"in progress" doing:"cleanup-messenger-db" progress:0.5769231 completed:7 total:13 delay:495
			// state:"in progress" doing:"close-protocol-server" progress:0.65384614 completed:8 total:13 delay:522
			// state:"in progress" doing:"cleanup-ipfs-webui" progress:0.7307692 completed:9 total:13 delay:535
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:544
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:548
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:551
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:554
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:557
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:561
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:564
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:567
			// state:"in progress" doing:"close-ipfs-node" progress:0.8076923 completed:10 total:13 delay:570
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17792
			// state:"in progress" doing:"close-datastore" progress:0.88461536 completed:11 total:13 delay:17819
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
			// state:"done" progress:1 completed:13 total:13 delay:41878
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, int(lastProgress.Completed), 16) // this test can be disabled if it breaks, the test just above can be considered as enough
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))

		// check if duration is between 100us and 1m
		// in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Microsecond).Microseconds()))
		require.True(t, lastProgress.Delay < uint64(time.Duration(1*time.Minute).Microseconds()))
	}

	// two log files
	{
		rep, err := cl.LogfileList(ctx, &accounttypes.LogfileList_Request{})
		require.NoError(t, err)
		require.Len(t, rep.Entries, 2)
	}
}
