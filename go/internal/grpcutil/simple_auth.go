package grpcutil

import (
	"context"

	"google.golang.org/grpc/credentials"
)

const headerAuthorize = "authorization"

var _ credentials.PerRPCCredentials = (*simpleAuthAccess)(nil)

// simpleAuthAccess supplies PerRPCCredentials from a given token.
type simpleAuthAccess struct {
	token string
}

// NewSimpleAuthAccess constructs the PerRPCCredentials using a given token.
func NewSimpleAuthAccess(token string) credentials.PerRPCCredentials {
	return simpleAuthAccess{token: token}
}

func (sa *simpleAuthAccess) GetRequestMetadata(ctx context.Context, uri ...string) (map[string]string, error) {
	return map[string]string{
		headerAuthorize: sa.token,
	}, nil
}

func (simpleAuthAccess) RequireTransportSecurity() bool {
	// @FIXME(gfanton): this is very insecure
	return false
}
