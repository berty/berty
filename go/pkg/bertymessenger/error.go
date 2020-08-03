package bertymessenger

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func grpcIsCanceled(err error) bool {
	grpcStatus, ok := status.FromError(err)
	return ok && grpcStatus.Code() == codes.Canceled
}
