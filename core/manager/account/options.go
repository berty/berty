package account

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/99designs/gqlgen/graphql"
	gqlhandler "github.com/99designs/gqlgen/handler"
	"github.com/gorilla/websocket"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpc_ot "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	"github.com/pkg/errors"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/gqlerror"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	nodeapi "berty.tech/core/api/node"
	gql "berty.tech/core/api/node/graphql"
	graph "berty.tech/core/api/node/graphql/graph/generated"
	"berty.tech/core/network/mock"
	"berty.tech/core/network/netutil"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/jaeger"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/pkg/zapring"
)

func WithRing(ring *zapring.Ring) NewOption {
	return func(a *Account) error {
		a.ring = ring
		return nil
	}
}

func WithName(name string) NewOption {
	return func(a *Account) error {
		a.Name = name
		if a.Name == "" {
			return errorcodes.ErrValidationInput.Wrap(errors.New("cannot have empty name"))
		}
		return nil
	}
}

func WithPassphrase(passphrase string) NewOption {
	return func(a *Account) error {
		a.Passphrase = passphrase
		if a.Passphrase == "" {
			return errorcodes.ErrValidationInput.Wrap(errors.New("cannot have empty passphrase"))
		}
		return nil
	}
}

type DatabaseOptions struct {
	Path string
	Drop bool
}

func WithBanner(banner string) NewOption {
	return func(a *Account) error {
		a.banner = banner
		return nil
	}
}

func WithEnqueurNetwork() NewOption {
	return func(a *Account) error {
		tracer := tracing.EnterFunc(a.rootContext)
		defer tracer.Finish()
		ctx := tracer.Context()

		a.network = mock.NewEnqueuer(ctx)
		return nil
	}
}

func WithInitOnly() NewOption {
	return func(a *Account) error {
		a.initOnly = true
		return nil
	}
}

func WithJaegerAddrName(addr string, name string) NewOption {
	return func(a *Account) error {
		go func() {
		re:
			var err error
			a.tracer, a.tracingCloser, err = jaeger.InitTracer(addr, name)
			if err != nil {
				logger().Error("jaeger init error", zap.Error(err))
				goto re
			}
		}()
		return nil
	}
}

func WithNotificationDriver(driver notification.Driver) NewOption {
	return func(a *Account) error {
		a.notification = driver
		return nil
	}
}

type GrpcServerOptions struct {
	Bind         string
	Interceptors bool
}

func WithGrpcServer(opts *GrpcServerOptions) NewOption {
	return func(a *Account) error {
		if opts == nil {
			opts = &GrpcServerOptions{}
		}

		serverStreamOpts := []grpc.StreamServerInterceptor{
			grpc_recovery.StreamServerInterceptor(grpc_recovery.WithRecoveryHandler(errorcodes.RecoveryHandler)),
		}
		serverUnaryOpts := []grpc.UnaryServerInterceptor{
			grpc_recovery.UnaryServerInterceptor(grpc_recovery.WithRecoveryHandler(errorcodes.RecoveryHandler)),
		}
		if opts.Interceptors {
			gqlLogger := zap.L().Named("vendor.grpc")
			serverStreamOpts = append(serverStreamOpts,
				// grpc_auth.StreamServerInterceptor(myAuthFunction),
				// grpc_prometheus.StreamServerInterceptor,
				grpc_ctxtags.StreamServerInterceptor(),
				grpc_zap.StreamServerInterceptor(gqlLogger),
			)
			serverUnaryOpts = append(serverUnaryOpts,
				// grpc_prometheus.UnaryServerInterceptor,
				// grpc_auth.UnaryServerInterceptor(myAuthFunction),
				grpc_ctxtags.UnaryServerInterceptor(),
				grpc_zap.UnaryServerInterceptor(gqlLogger),
			)

			if a.tracer != nil {
				tracerOpts := grpc_ot.WithTracer(a.tracer)
				serverStreamOpts = append(serverStreamOpts, grpc_ot.StreamServerInterceptor(tracerOpts))
				serverUnaryOpts = append(serverUnaryOpts, grpc_ot.UnaryServerInterceptor(tracerOpts))
			}

		}

		// should be the last interceptor
		serverUnaryOpts = append(serverUnaryOpts, errorcodes.UnaryServerInterceptor())
		serverStreamOpts = append(serverStreamOpts, errorcodes.StreamServerInterceptor())

		interceptors := []grpc.ServerOption{
			grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(serverStreamOpts...)),
			grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(serverUnaryOpts...)),
		}

		a.GrpcServer = grpc.NewServer(interceptors...)
		reflection.Register(a.GrpcServer)

		a.GrpcBind = opts.Bind
		if a.GrpcBind == "" {
			a.GrpcBind = ":1337"
		}
		return nil
	}
}

type GQLOptions struct {
	Bind         string
	Interceptors bool
}

func WithGQL(opts *GQLOptions) NewOption {
	return func(a *Account) error {
		var err error
		if opts == nil {
			opts = &GQLOptions{}
		}

		interceptors := []grpc.DialOption{}
		gqlLogger := zap.L().Named("vendor.graphql")
		if opts.Interceptors {
			clientStreamOpts := []grpc.StreamClientInterceptor{
				grpc_zap.StreamClientInterceptor(gqlLogger),
			}
			clientUnaryOpts := []grpc.UnaryClientInterceptor{
				grpc_zap.UnaryClientInterceptor(gqlLogger),
			}

			if a.tracer != nil {
				tracerOpts := grpc_ot.WithTracer(a.tracer)
				clientStreamOpts = append(clientStreamOpts, grpc_ot.StreamClientInterceptor(tracerOpts))
				clientUnaryOpts = append(clientUnaryOpts, grpc_ot.UnaryClientInterceptor(tracerOpts))
			}

			interceptors = []grpc.DialOption{
				grpc.WithStreamInterceptor(grpc_middleware.ChainStreamClient(clientStreamOpts...)),
				grpc.WithUnaryInterceptor(grpc_middleware.ChainUnaryClient(clientUnaryOpts...)),
			}
		}

		a.ioGrpc = netutil.NewIOGrpc()
		icdialer := a.ioGrpc.NewDialer()

		dialOpts := append([]grpc.DialOption{
			grpc.WithInsecure(),
			grpc.WithDialer(icdialer),
		}, interceptors...)

		conn, err := grpc.Dial("", dialOpts...)
		if err != nil {
			return errorcodes.ErrNetDial.Wrap(err)
		}

		resolver := gql.New(nodeapi.NewServiceClient(conn))

		mux := http.NewServeMux()
		mux.Handle("/", gqlhandler.Playground("Berty", "/query"))
		var (
			gqlLogMutex    sync.Mutex
			gqlLogPrevious string
		)
		mux.Handle("/query", gqlhandler.GraphQL(
			graph.NewExecutableSchema(resolver),
			gqlhandler.WebsocketUpgrader(websocket.Upgrader{
				CheckOrigin: func(*http.Request) bool {
					return true
				},
			}),
			gqlhandler.ErrorPresenter(
				func(ctx context.Context, e error) *gqlerror.Error {
					exportedError := graphql.DefaultErrorPresenter(ctx, e)

					err := errorcodes.Convert(e)
					exportedError.Extensions = err.Extensions()

					return exportedError
				},
			),
			gqlhandler.RequestMiddleware(
				func(ctx context.Context, next func(ctx context.Context) []byte) []byte {
					req := graphql.GetRequestContext(ctx)
					if req == nil {
						resolver := graphql.GetResolverContext(ctx)
						gqlLogger.Error("gql req is nil (should not)",
							zap.String("req", fmt.Sprintf("%v", req)),
							zap.String("resolver", fmt.Sprintf("%v", resolver)),
						)

						return next(ctx)
					}
					//verb := strings.TrimSpace(strings.Split(req.RawQuery, "{")[1]) // verb can be used to filter-out

					// if subscription, only log lines when they differ from the previous one
					gqlLogMutex.Lock()
					if gqlLogPrevious != req.RawQuery {
						gqlLogger.Debug(
							"gql query",
							zap.String(
								"query",
								strings.Replace(req.RawQuery, "\n", "", -1),
							),
						)
						gqlLogPrevious = req.RawQuery
					}
					gqlLogMutex.Unlock()
					return next(ctx)
				},
			),
		))

		if opts.Bind == "" {
			opts.Bind = ":8700"
		}
		a.GQLBind = opts.Bind
		a.gqlHandler = cors.New(cors.Options{
			AllowedOrigins: []string{"*"}, // FIXME: use specific URLs?
			AllowedMethods: []string{"POST"},
			//AllowCredentials: true,
			AllowedHeaders: []string{"authorization", "content-type"},
			ExposedHeaders: []string{"Access-Control-Allow-Origin"},
			//Debug:            true,
		}).Handler(mux)

		return nil
	}
}

func WithBot() NewOption {
	return func(a *Account) error {
		a.withBot = true
		return nil
	}
}

func WithPrivateKeyFile(path string) NewOption {
	return func(a *Account) error {
		a.privateKeyPath = path
		return nil
	}
}
