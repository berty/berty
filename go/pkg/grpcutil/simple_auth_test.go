package grpcutil

import (
	"context"
	"net"
	"testing"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	pb "google.golang.org/grpc/examples/helloworld/helloworld"
	"google.golang.org/grpc/status"
)

const testGoodToken = "hellobuddy"

func validateToken(token string) bool {
	return token == testGoodToken
}

// exampleAuthFunc is used by a middleware to authenticate requests
func testAuthFunc(ctx context.Context) (context.Context, error) {
	token, err := grpc_auth.AuthFromMD(ctx, "bearer")
	if err != nil {
		return nil, err
	}

	if !validateToken(token) {
		return nil, status.Errorf(codes.Unauthenticated, "invalid auth token: %s", token)
	}

	tags := grpc_ctxtags.Extract(ctx).Set("auth.secret", token)
	newCtx := grpc_ctxtags.SetInContext(ctx, tags)
	return newCtx, nil
}

func SayHelloAuthenticated(ctx context.Context, request *pb.HelloRequest) (*pb.HelloReply, error) {
	return &pb.HelloReply{Message: "pong authenticated"}, nil
}

func TestSimpleAuth(t *testing.T) {
	cases := []struct {
		name       string
		token      string
		assertFunc assert.ErrorAssertionFunc
	}{
		{name: "Authenticated", token: testGoodToken, assertFunc: assert.NoError},
		{name: "Unauthenticated", token: "badtoken", assertFunc: assert.Error},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			grpcServer := grpc.NewServer(
				grpc_middleware.WithUnaryServerChain(
					grpc_auth.UnaryServerInterceptor(testAuthFunc),
				),
				grpc_middleware.WithStreamServerChain(
					grpc_auth.StreamServerInterceptor(testAuthFunc),
				),
			)

			pb.RegisterGreeterService(grpcServer, &pb.GreeterService{SayHello: SayHelloAuthenticated})

			l, err := net.Listen("tcp", "127.0.0.1:0")
			require.NoError(t, err)
			defer l.Close()

			cc, err := grpc.DialContext(ctx, l.Addr().String(), []grpc.DialOption{
				grpc.WithPerRPCCredentials(NewUnsecureSimpleAuthAccess("bearer", tc.token)),
				grpc.WithInsecure(), // TODO: remove this, enforce security
			}...)
			require.NoError(t, err)

			go grpcServer.Serve(l)

			client := pb.NewGreeterClient(cc)
			res, err := client.SayHello(ctx, &pb.HelloRequest{})
			if tc.assertFunc(t, err) && err == nil {
				assert.Equal(t, "pong authenticated", res.Message)
			}
		})
	}
}
