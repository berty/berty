package chatbridge

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"

	_ "berty.tech/go/internal/buildconstraints" // fail if bad go version
	_ "github.com/jinzhu/gorm/dialects/sqlite"  // required by gorm

	"berty.tech/go/internal/bridgeutil"
	"berty.tech/go/pkg/bertychat"
	"berty.tech/go/pkg/bertyprotocol"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/jinzhu/gorm"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
)

type Bridge struct {
	cerr           chan error
	cclose         chan struct{}
	once           sync.Once
	workers        run.Group
	grpcServer     *grpc.Server
	logger         *zap.Logger
	chatDB         *gorm.DB
	protocolDB     *gorm.DB
	chatClient     bertychat.Client
	protocolClient bertyprotocol.Client
}

// NewBridge is the main entrypoint for gomobile and should only take simple configuration as argument
func NewBridge(logLevel string) (*Bridge, error) {
	logger, err := setupLogger(logLevel)
	if err != nil {
		return nil, errors.Wrap(err, "logger setup")
	}
	return newBridge(logger)
}

func newBridge(logger *zap.Logger) (*Bridge, error) {
	b := &Bridge{
		cerr:       make(chan error),
		cclose:     make(chan struct{}),
		grpcServer: grpc.NewServer(),
		logger:     logger,
	}

	// Create cancel service
	b.workers.Add(func() error {
		// wait for closing signal
		<-b.cclose
		return ErrInterrupted
	}, func(error) {
		b.once.Do(func() { close(b.cclose) })
	})

	// setup protocol
	{
		var err error
		b.protocolDB, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, errors.Wrap(err, "failed to initialize gorm")
		}

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger: b.logger.Named("bertyprotocol"),
		}

		b.protocolClient, err = bertyprotocol.New(b.protocolDB, protocolOpts)
		if err != nil {
			return nil, errors.Wrap(err, "failed to initialize protocol")
		}
	}

	// setup chat
	{
		var err error
		// initialize sqlite3 gorm database
		b.chatDB, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, errors.Wrap(err, "failed to initialize gorm")
		}

		// initialize bertychat client
		chatOpts := bertychat.Opts{
			Logger: b.logger.Named("bertychat"),
		}

		b.chatClient, err = bertychat.New(b.chatDB, b.protocolClient, chatOpts)
		if err != nil {
			return nil, errors.Wrap(err, "failed to initialize chat")
		}
	}

	// register service
	bertychat.RegisterAccountServer(b.grpcServer, b.chatClient)

	return b, nil
}

func setupLogger(level string) (*zap.Logger, error) {
	config := zap.NewDevelopmentConfig()
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	switch level {
	case "warn":
		config.Level.SetLevel(zap.WarnLevel)
	case "info":
		config.Level.SetLevel(zap.InfoLevel)
	case "debug":
		config.Level.SetLevel(zap.DebugLevel)
	default:
		return nil, fmt.Errorf("unsupported log level: %q", level)
	}
	return config.Build()
}

// Start bridge
func (b *Bridge) Start() {
	b.logger.Debug("starting bridge")
	go func() {
		b.cerr <- b.workers.Run()
	}()
}

func (b *Bridge) isClosed() bool {
	select {
	case <-b.cclose:
		return true
	default:
		return false
	}
}

// Close bridge, once the bridge is closed you will not be able to start it
// again until you create a new bridge instance
func (b *Bridge) Close() (err error) {
	// is bridge closed
	if b.isClosed() {
		return ErrNotRunning
	}

	b.logger.Info("bridge.Close called")

	// send close signal
	b.once.Do(func() { close(b.cclose) })

	// set close timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*4)
	defer cancel()

	// wait or die
	select {
	case err = <-b.cerr:
	case <-ctx.Done():
		err = ctx.Err()
	}

	// close clients and dbs after listeners
	b.chatClient.Close()
	b.chatDB.Close()
	b.protocolClient.Close()
	b.protocolDB.Close()

	if err != ErrInterrupted {
		return errors.Wrap(err, "failed close bridge gracefully")
	}

	return nil
}

// AddGRPCListener start a new grpc listener
// `:0` will listen on localhost with a random port
// Return current listening port on success
func (b *Bridge) AddGRPCListener(addr string) (string, error) {
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return "", errors.Wrap(err, "failed to listen")
	}

	b.workers.Add(func() error {
		b.logger.Info("starting grpc server", zap.String("addr", l.Addr().String()))
		return b.grpcServer.Serve(l)
	}, func(error) {
		b.logger.Debug("closing grpc server")
		l.Close()

	})

	return l.Addr().String(), nil
}

// AddGRPCWebListener start a new grpc listener
// `:0` will listen on localhost with a random port
// Return current listening port on success
func (b *Bridge) AddGRPCWebListener(addr string) (string, error) {
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return "", errors.Wrap(err, "failed to listen")
	}

	// setup grpc web
	wgrpc := grpcweb.WrapServer(
		b.grpcServer,
		// @TODO: do something smarter here
		grpcweb.WithOriginFunc(func(string) bool {
			return true
		}),
		// @TODO: check if this can be use by every platform; setting to
		// false for the moment
		grpcweb.WithWebsockets(false),
	)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Handle preflight CORS

		// FIXME: enable tls, add authentification and remove wildcard on Allow-Origin
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, XMLHttpRequest, x-user-agent, x-grpc-web, grpc-status, grpc-message, x-method")
		w.Header().Add("Access-Control-Expose-Headers", "grpc-status, grpc-message")

		if r.Method == "OPTIONS" {
			return
		}

		// handle grpc web
		if wgrpc.IsGrpcWebRequest(r) {
			// set this headers to avoid unsafe header
			w.Header().Set("grpc-status", "")
			w.Header().Set("grpc-message", "")

			wgrpc.ServeHTTP(w, r)
			return
		}

		http.DefaultServeMux.ServeHTTP(w, r)
	})

	s := &http.Server{
		Addr:    addr,
		Handler: handler,
	}

	b.workers.Add(func() error {
		b.logger.Info("starting grpc web server", zap.String("addr", l.Addr().String()))
		return s.Serve(l)
	}, func(error) {
		b.logger.Debug("closing grpc web server")
		s.Close()
		l.Close()
	})

	return l.Addr().String(), nil
}

// NewGRPCClient return client service on success
func (b *Bridge) NewGRPCClient() (client *Client, err error) {
	var grpcClient *grpc.ClientConn

	// create pipe listener
	listener := bridgeutil.NewPipeListener()

	// create pipe dialer
	dialer := func(context.Context, string) (net.Conn, error) {
		cclient, cserver := net.Pipe()
		listener.AddConn(cserver)
		return cclient, nil
	}

	dialOpts := []grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithContextDialer(dialer), // set pipe dialer
	}

	b.workers.Add(func() error {
		return b.grpcServer.Serve(listener)
	}, func(error) {
		listener.Close()
	})

	grpcClient, err = grpc.Dial("pipe", dialOpts...)
	client = &Client{grpcClient}
	return
}
