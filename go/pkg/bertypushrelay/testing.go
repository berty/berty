package bertypushrelay

import (
	"context"
	crand "crypto/rand"
	"net"
	"testing"

	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

func PushServerForTests(ctx context.Context, t testing.TB, dispatchers []PushDispatcher, logger *zap.Logger) (PushService, *[32]byte, string, context.CancelFunc) {
	secret := make([]byte, cryptoutil.KeySize)
	_, err := crand.Read(secret)
	require.NoError(t, err)

	pushPK, pushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	pushService, err := NewPushService(pushSK, dispatchers, logger)
	require.NoError(t, err)

	ctx, cancel := context.WithCancel(ctx)
	server := grpc.NewServer()

	mux := grpcgw.NewServeMux()

	pushtypes.RegisterPushServiceServer(server, pushService)
	err = pushtypes.RegisterPushServiceHandlerServer(ctx, mux, pushService)
	require.NoError(t, err)

	l, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)

	go func() {
		err := server.Serve(l)
		if err != nil {
			cancel()
		}
	}()

	return pushService, pushPK, l.Addr().String(), cancel
}
