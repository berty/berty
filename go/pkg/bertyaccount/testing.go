package bertyaccount

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
)

func TestingAccountClient(ctx context.Context, t *testing.T, s accounttypes.AccountServiceServer) accounttypes.AccountServiceClient {
	t.Helper()

	srv := grpc.NewServer()
	accounttypes.RegisterAccountServiceServer(srv, s)

	l := grpcutil.NewBufListener(ctx, 2048)

	cc, err := l.NewClientConn()
	assert.NoError(t, err)

	cl := accounttypes.NewAccountServiceClient(cc)

	go srv.Serve(l.Listener)

	t.Cleanup(func() { l.Close() })

	return cl
}
