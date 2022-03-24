package grpcserver

import (
	"context"
	"strings"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/oklog/run"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type GRPCOpts struct {
	Logger        *zap.Logger
	AuthPublicKey string
	AuthSecret    string
	Listeners     string
	ServiceID     string
}

func InitGRPCServer(workers *run.Group, opts *GRPCOpts) (*grpc.Server, *grpcgw.ServeMux, []grpcutil.Listener, error) {
	if opts == nil {
		opts = &GRPCOpts{}
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	logger := opts.Logger

	grpcLogger := logger.Named("grpc")
	// Define customfunc to handle panic
	panicHandler := func(p interface{}) (err error) {
		return status.Errorf(codes.Unknown, "panic recover: %v", p)
	}

	// Shared options for the logger, with a custom gRPC code to log level function.
	recoverOpts := []grpc_recovery.Option{
		grpc_recovery.WithRecoveryHandler(panicHandler),
	}

	zapOpts := []grpc_zap.Option{}

	// override grpc logger
	logutil.ReplaceGRPCLogger(grpcLogger)

	// noop auth func
	authFunc := func(ctx context.Context) (context.Context, error) { return ctx, nil }

	if opts.AuthSecret != "" || opts.AuthPublicKey != "" {
		man, err := bertyauth.GetAuthTokenVerifier(opts.AuthSecret, opts.AuthPublicKey)
		if err != nil {
			return nil, nil, nil, errcode.TODO.Wrap(err)
		}

		serviceID := opts.ServiceID
		switch serviceID {
		case authtypes.ServiceReplicationID:
			authFunc = man.GRPCAuthInterceptor(serviceID)
		case "":
			logger.Warn("GRPCAuth: Internal field ServiceID should not be empty", logutil.PrivateString("serviceID", serviceID))
		default:
		}
	}

	grpcOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_recovery.UnaryServerInterceptor(recoverOpts...),
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
			grpc_auth.UnaryServerInterceptor(authFunc),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_recovery.StreamServerInterceptor(recoverOpts...),
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
			grpc_auth.StreamServerInterceptor(authFunc),
		),
	}

	grpcServer := grpc.NewServer(grpcOpts...)
	grpcGatewayMux := grpcgw.NewServeMux()

	listeners := []grpcutil.Listener(nil)
	if opts.Listeners != "" {
		addrs := strings.Split(opts.Listeners, ",")
		maddrs, err := ipfsutil.ParseAddrs(addrs...)
		if err != nil {
			return nil, nil, nil, err
		}
		listeners = make([]grpcutil.Listener, len(maddrs))

		server := grpcutil.Server{
			GRPCServer: grpcServer,
			GatewayMux: grpcGatewayMux,
		}

		for idx, maddr := range maddrs {
			maddrStr := maddr.String()
			l, err := grpcutil.Listen(maddr)
			if err != nil {
				return nil, nil, nil, errcode.TODO.Wrap(err)
			}
			listeners[idx] = l

			workers.Add(func() error {
				logger.Info("serving", logutil.PrivateString("maddr", maddrStr))
				return server.Serve(l)
			}, func(error) {
				l.Close()
				server.Close()
				logger.Debug("closing done", logutil.PrivateString("maddr", maddrStr))
			})
		}
	}

	return grpcServer, grpcGatewayMux, listeners, nil
}
