package logutil

import (
	"sync"

	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"go.uber.org/zap"
)

var (
	// grpc logger should be set only once.
	// without this singleton, we can raise race conditions in unit tests => https://github.com/grpc/grpc-go/issues/1084
	grpcLoggerConfigured   bool
	muGRPCLoggerConfigured sync.Mutex
)

func ReplaceGRPCLogger(l *zap.Logger) {
	muGRPCLoggerConfigured.Lock()

	if !grpcLoggerConfigured {
		grpc_zap.ReplaceGrpcLoggerV2(l)
		grpcLoggerConfigured = true
	}

	muGRPCLoggerConfigured.Unlock()
}
