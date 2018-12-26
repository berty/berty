package errorcodes

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
)

// RecoveryHandler implements github.com/grpc-ecosystem/go-grpc-middleware/recovery.RecoveryHandlerFunc
func RecoveryHandler(p interface{}) error {
	return ErrPanic.NewArgs(
		map[string]string{
			"p": fmt.Sprintf("%#v", p),
		})
}

// UnaryServerInterceptor returns a new unary server interceptor that enrichs an error before passing it through gRPC
func UnaryServerInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		resp, err := handler(ctx, req)
		if err != nil {
			return resp, Convert(err)
		}
		return resp, nil
	}
}

// StreamServerInterceptor returns a new stream server interceptor that enrichs an error before passing it through gRPC
func StreamServerInterceptor() grpc.StreamServerInterceptor {
	return func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) (err error) {
		if err := handler(srv, stream); err != nil {
			return Convert(err)
		}
		return nil
	}
}
