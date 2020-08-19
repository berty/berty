package bertymessenger

import (
	"io"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func isGRPCCanceledError(err error) bool {
	grpcStatus, ok := status.FromError(err)
	return ok && grpcStatus.Code() == codes.Canceled
}

func (svc *service) logStreamingError(name string, err error) {
	switch {
	case err == nil:
		// noop
	case err == io.EOF:
		svc.logger.Warn("stream EOF", zap.String("name", name))
	case isGRPCCanceledError(err):
		svc.logger.Debug("stream context canceled", zap.String("name", name))
	default:
		svc.logger.Error("stream error", zap.String("name", name), zap.Error(err))
	}
}
