package account

import (
	"net/http"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpc_ot "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	opentracing "github.com/opentracing/opentracing-go"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/jaeger"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/pkg/zapring"
	mock "berty.tech/core/test/mock/network"
	"berty.tech/network"
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
		a.network = mock.NewEnqueuer(a.rootContext)
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
			var err error
			a.tracer, a.tracingCloser, err = jaeger.InitTracer(addr, name)
			if err != nil {
				logger().Warn("fallback on nooptracer: jaeger init failed", zap.String("error", err.Error()))
				a.tracer = opentracing.NoopTracer{}
				opentracing.SetGlobalTracer(a.tracer)
			} else {
				logger().Info("jaeger client init succeeded")
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
			grpcLogger := zap.L().Named("vendor.grpc")
			serverStreamOpts = append(serverStreamOpts,
				// grpc_auth.StreamServerInterceptor(myAuthFunction),
				// grpc_prometheus.StreamServerInterceptor,
				grpc_ctxtags.StreamServerInterceptor(),
				grpc_zap.StreamServerInterceptor(grpcLogger),
			)
			serverUnaryOpts = append(serverUnaryOpts,
				// grpc_prometheus.UnaryServerInterceptor,
				// grpc_auth.UnaryServerInterceptor(myAuthFunction),
				grpc_ctxtags.UnaryServerInterceptor(),
				grpc_zap.UnaryServerInterceptor(grpcLogger),
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

type GrpcWebOptions struct {
	Bind         string
	Interceptors bool
}

func WithGrpcWeb(opts *GrpcWebOptions) NewOption {
	return func(a *Account) error {
		if opts == nil {
			opts = &GrpcWebOptions{}
		}

		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Handle preflight CORS
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, XMLHttpRequest, x-user-agent, x-grpc-web, grpc-status, grpc-message, x-method")
			w.Header().Add("Access-Control-Expose-Headers", "grpc-status, grpc-message")

			if r.Method == "OPTIONS" {
				return
			}

			if a.grpcWebGrpcServerWrapper.IsGrpcWebRequest(r) {
				// set this headers to avoid unsafe header
				w.Header().Set("grpc-status", "")
				w.Header().Set("grpc-message", "")

				a.grpcWebGrpcServerWrapper.ServeHTTP(w, r)
				return
			}

			http.DefaultServeMux.ServeHTTP(w, r)
		})

		a.GrpcWebBind = opts.Bind
		if a.GrpcWebBind == "" {
			a.GrpcWebBind = ":8737"
		}
		a.grpcWebServer = &http.Server{
			Addr:    a.GrpcWebBind,
			Handler: handler,
		}
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

func WithNetwork(net network.Driver, err error) NewOption {
	return func(a *Account) error {
		if err != nil {
			return errors.Wrap(err, "account with network error")
		}
		a.network = net
		a.metric = net.Metric()
		return nil
	}
}
