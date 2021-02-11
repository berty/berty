package bertyaccount_test

import (
	"context"
	"io"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"github.com/tj/assert"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestFlow(t *testing.T) {
	// prepare deps
	tempdir, err := ioutil.TempDir("", "berty-account")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx := context.Background()

	// init service
	svc, err := bertyaccount.NewService(&bertyaccount.Options{
		RootDirectory: tempdir,
		Logger:        logger,
	})
	require.NoError(t, err)
	defer svc.Close()

	cl := createAccountClient(ctx, t, svc)

	// no account by default
	{
		rep, err := cl.ListAccounts(ctx, &bertyaccount.ListAccounts_Request{})
		require.NoError(t, err)
		require.Empty(t, rep.Accounts)
	}

	// try closing an account even if none were loaded
	{
		stream, err := cl.CloseAccountWithProgress(ctx, &bertyaccount.CloseAccountWithProgress_Request{})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.Equal(t, err, io.EOF)
		// FIXME: should return an error?
	}

	// try to open a non-existing account
	{
		stream, err := cl.OpenAccountWithProgress(ctx, &bertyaccount.OpenAccountWithProgress_Request{
			AccountID: "account 1",
		})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.True(t, errcode.Has(err, errcode.ErrBertyAccountDataNotFound))
	}

	// create and load a new account
	{
		rep, err := cl.CreateAccount(ctx, &bertyaccount.CreateAccount_Request{
			AccountID:   "account 1",
			AccountName: "my first account",
		})
		require.NoError(t, err)
		require.Equal(t, "account 1", rep.AccountMetadata.AccountID)
		require.Equal(t, "my first account", rep.AccountMetadata.Name)
		require.NotZero(t, rep.AccountMetadata.LastOpened)
	}

	// try to open an account while we already have an account loaded
	{
		stream, err := cl.OpenAccountWithProgress(ctx, &bertyaccount.OpenAccountWithProgress_Request{
			AccountID: "account 1",
		})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.True(t, errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened))
	}

	// close the account
	{
		stream, err := cl.CloseAccountWithProgress(ctx, &bertyaccount.CloseAccountWithProgress_Request{})
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
		require.True(t, lastProgress.Delay > uint64(time.Duration(time.Millisecond).Microseconds())) // in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay < uint64(time.Duration(60*time.Second).Microseconds()))   // in general, it's around 40ms on Manfred's Linux server
	}

	// try closing the account again, even if no account should be loaded anymore
	{
		stream, err := cl.CloseAccountWithProgress(ctx, &bertyaccount.CloseAccountWithProgress_Request{})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.Equal(t, err, io.EOF)
		// FIXME: should return an error?
	}

	// load the account
	{
		stream, err := cl.OpenAccountWithProgress(ctx, &bertyaccount.OpenAccountWithProgress_Request{
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
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Progress, float32(1))
		require.True(t, lastProgress.Delay > uint64(time.Duration(50*time.Millisecond).Microseconds())) // in general, it's around 600ms on Manfred's Linux server
		require.True(t, lastProgress.Delay < uint64(time.Duration(60*time.Second).Microseconds()))      // in general, it's around 600ms on Manfred's Linux server
	}

	// try closing the account again, even if no account should be loaded anymore
	{
		stream, err := cl.CloseAccountWithProgress(ctx, &bertyaccount.CloseAccountWithProgress_Request{})
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
		require.True(t, lastProgress.Delay > uint64(time.Duration(10*time.Millisecond).Microseconds())) // in general, it's around 40ms on Manfred's Linux server
		require.True(t, lastProgress.Delay < uint64(time.Duration(60*time.Second).Microseconds()))      // in general, it's around 40ms on Manfred's Linux server
	}
}

func createAccountClient(ctx context.Context, t *testing.T, s bertyaccount.AccountServiceServer) bertyaccount.AccountServiceClient {
	t.Helper()

	srv := grpc.NewServer()
	bertyaccount.RegisterAccountServiceServer(srv, s)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn()
	assert.NoError(t, err)

	cl := bertyaccount.NewAccountServiceClient(cc)

	go srv.Serve(l.Listener)

	t.Cleanup(func() { l.Close() })

	return cl
}
