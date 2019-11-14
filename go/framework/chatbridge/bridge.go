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
	"github.com/pkg/errors"

	"berty.tech/go/internal/grpcutil"
	"berty.tech/go/pkg/bertychat"
	"berty.tech/go/pkg/bertyprotocol"
	"berty.tech/go/pkg/errcode"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/jinzhu/gorm"
	"github.com/oklog/run"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type Bridge struct {
	cerr                chan error
	cclose              chan struct{}
	once                sync.Once
	workers             run.Group
	grpcServer          *grpc.Server
	logger              *zap.Logger
	chatDB              *gorm.DB
	protocolDB          *gorm.DB
	chatClient          bertychat.Client
	protocolClient      bertyprotocol.Client
	grpcListenerAddr    string
	grpcWebListenerAddr string
	grpcClient          *Client
}

type Opts struct {
	coreAPI         ipfs_interface.CoreAPI
	LogLevel        string
	GRPCListener    string
	GRPCWebListener string
	NoGRPCClient    bool
}

// NewBridge is the main entrypoint for gomobile and should only take simple configuration as argument
func NewBridge(opts Opts) (*Bridge, error) {
	var logger *zap.Logger
	{
		config := zap.NewDevelopmentConfig()
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		switch opts.LogLevel {
		case "warn":
			config.Level.SetLevel(zap.WarnLevel)
		case "info":
			config.Level.SetLevel(zap.InfoLevel)
		case "debug":
			config.Level.SetLevel(zap.DebugLevel)
		default:
			return nil, fmt.Errorf("unsupported log level: %q", opts.LogLevel)
		}
		var err error
		logger, err = config.Build()
		if err != nil {
			return nil, errors.Wrap(err, "logger setup")
		}
	}

	return newBridge(logger, opts)
}

func newBridge(logger *zap.Logger, opts Opts) (*Bridge, error) {
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
		return errcode.ErrBridgeInterrupted
	}, func(error) {
		b.once.Do(func() { close(b.cclose) })
	})

	// setup protocol
	{
		var err error
		b.protocolDB, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger:      b.logger.Named("bertyprotocol"),
			IpfsCoreAPI: opts.coreAPI,
		}

		b.protocolClient, err = bertyprotocol.New(b.protocolDB, protocolOpts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// setup chat
	{
		var err error
		// initialize sqlite3 gorm database
		b.chatDB, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// initialize bertychat client
		chatOpts := bertychat.Opts{
			Logger: b.logger.Named("bertychat"),
		}

		b.chatClient, err = bertychat.New(b.chatDB, b.protocolClient, chatOpts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// register service
	bertychat.RegisterChatServiceServer(b.grpcServer, b.chatClient)

	// optional gRPC listener
	if opts.GRPCListener != "" {
		var err error
		b.grpcListenerAddr, err = b.addGRPCListener(opts.GRPCListener)
		if err != nil {
			return nil, errors.Wrap(err, "add gRPC listener")
		}
	}

	// optional gRPC web listener
	if opts.GRPCWebListener != "" {
		var err error
		b.grpcWebListenerAddr, err = b.addGRPCWebListener(opts.GRPCWebListener)
		if err != nil {
			return nil, errors.Wrap(err, "add gRPC web listener")
		}
	}

	if !opts.NoGRPCClient {
		var err error
		b.grpcClient, err = b.newGRPCClient()
		if err != nil {
			return nil, errors.Wrap(err, "init gRPC client")
		}
	}

	// start bridge
	b.logger.Debug("starting bridge")
	go func() {
		b.cerr <- b.workers.Run()
	}()

	return b, nil
}

func (b *Bridge) GRPCListenerAddr() string    { return b.grpcListenerAddr }
func (b *Bridge) GRPCWebListenerAddr() string { return b.grpcWebListenerAddr }
func (b *Bridge) GRPCClient() *Client         { return b.grpcClient }

func (b *Bridge) isClosed() bool {
	select {
	case <-b.cclose:
		return true
	default:
		return false
	}
}

// Close bridge
func (b *Bridge) Close() (err error) {
	if b.isClosed() {
		return errcode.ErrBridgeNotRunning
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

	if err != errcode.ErrBridgeInterrupted {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

// AddGRPCListener start a new grpc listener
// `:0` will listen on localhost with a random port
// Return current listening port on success
func (b *Bridge) addGRPCListener(addr string) (string, error) {
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return "", errcode.TODO.Wrap(err)
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
func (b *Bridge) addGRPCWebListener(addr string) (string, error) {
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return "", errcode.TODO.Wrap(err)
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

	b.workers.Add(func() error {
		b.logger.Info("starting grpc web server", zap.String("addr", l.Addr().String()))
		return http.Serve(l, handler)
	}, func(error) {
		b.logger.Debug("closing grpc web server")
		l.Close()
	})

	return l.Addr().String(), nil
}

// NewGRPCClient return client service on success
func (b *Bridge) newGRPCClient() (client *Client, err error) {
	if b.isClosed() {
		return nil, errcode.ErrBridgeNotRunning
	}

	var grpcClient *grpc.ClientConn

	// create pipe listener
	listener := grpcutil.NewPipeListener()

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
