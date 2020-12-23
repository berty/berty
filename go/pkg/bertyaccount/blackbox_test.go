package bertyaccount_test

import (
	"context"
	"io"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/gogo/protobuf/codec"
	"github.com/stretchr/testify/require"
	"github.com/tj/assert"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	errcode "berty.tech/berty/v2/go/pkg/errcode"
	protocoltypes "berty.tech/berty/v2/go/pkg/protocoltypes"
)

func Test(t *testing.T) {
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
		rep, err := cl.CloseAccount(ctx, &bertyaccount.CloseAccount_Request{})
		require.NoError(t, err)
		require.Empty(t, rep)
		// FIXME: should return an error?
	}

	// try to open a non-existing account
	{
		stream, err := cl.OpenAccount(ctx, &bertyaccount.OpenAccount_Request{
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
		stream, err := cl.OpenAccount(ctx, &bertyaccount.OpenAccount_Request{
			AccountID: "account 1",
		})
		require.NoError(t, err)
		_, err = stream.Recv()
		require.True(t, errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened))
	}

	// close the account
	{
		rep, err := cl.CloseAccount(ctx, &bertyaccount.CloseAccount_Request{})
		require.NoError(t, err)
		require.Empty(t, rep)
	}

	// try closing the account again, even if no account should be loaded anymore
	{
		rep, err := cl.CloseAccount(ctx, &bertyaccount.CloseAccount_Request{})
		require.NoError(t, err)
		require.Empty(t, rep)
		// FIXME: should return an error?
	}

	// load the account
	{
		stream, err := cl.OpenAccount(ctx, &bertyaccount.OpenAccount_Request{
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
			// state:"in progress" doing:"init" percent:12.5 total:4 delay:24
			// state:"in progress" doing:"setup-logger" percent:37.5 completed:2 total:4 delay:152
			// state:"in progress" doing:"setup-manager" percent:62.5 completed:2 total:4 delay:173
			// state:"done" percent:100 completed:4 total:4 delay:622311
		}
		require.True(t, steps > 1)
		require.Equal(t, lastProgress.Doing, "")
		require.Equal(t, lastProgress.State, "done")
		require.True(t, lastProgress.Completed > 1)
		require.Equal(t, lastProgress.Completed, lastProgress.Total)
		require.Equal(t, lastProgress.Percent, float32(100))
		require.True(t, lastProgress.Delay > uint64(time.Duration(100*time.Millisecond).Microseconds())) // in general, it's around 600ms on Manfred's Linux server
	}
}

func createAccountClient(ctx context.Context, t *testing.T, s bertyaccount.AccountServiceServer) bertyaccount.AccountServiceClient {
	t.Helper()

	gogoCodec := codec.New(2048)

	srv := grpc.NewServer(grpc.CustomCodec(gogoCodec))
	bertyaccount.RegisterAccountServiceServer(srv, s)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn(grpc.WithCodec(gogoCodec))
	assert.NoError(t, err)

	cl := bertyaccount.NewAccountServiceClient(cc)

	go srv.Serve(l.Listener)

	t.Cleanup(func() { l.Close() })

	return cl
}
