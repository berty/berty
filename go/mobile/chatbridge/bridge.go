package chatbridge

import (
	"context"
	"net"
	"net/http"
	"sync"
	"time"

	_ "berty.tech/go/internal/buildconstraints" // fail if bad go version
	_ "github.com/jinzhu/gorm/dialects/sqlite"  // required by gorm

	"berty.tech/go/internal/bridgeutil"
	"berty.tech/go/internal/chatdb"
	"berty.tech/go/internal/protocoldb"
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
	cerr   chan error
	cclose chan struct{}
	once   sync.Once

	serviceGroup run.Group
	grpcServer   *grpc.Server

	logger *zap.Logger
}

var ErrInterrupted = errors.New("bridge has been interrupted")

func NewBridge() (bridge *Bridge) {
	bridge = &Bridge{
		cerr:   make(chan error),
		cclose: make(chan struct{}),

		grpcServer: grpc.NewServer(),
		logger:     zap.NewNop(),
	}

	// Create cancel service
	bridge.serviceGroup.Add(func() error {
		// wait for closing signal
		<-bridge.cclose
		return ErrInterrupted
	}, func(error) {
		bridge.once.Do(func() { close(bridge.cclose) })
	})

	return
}

func (b *Bridge) SetupLogger() (err error) {
	// setup logger
	var logger *zap.Logger

	config := zap.NewDevelopmentConfig()
	config.Level.SetLevel(zap.DebugLevel)
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	if logger, err = config.Build(); err != nil {
		return

	}

	logger = logger.Named("bridge")
	logger.Debug("logger initialized in debug mode")

	b.logger = logger
	return

}

func (b *Bridge) run() error {
	var err error

	// setup protocol
	var protocol bertyprotocol.Client
	{
		var db *gorm.DB

		db, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return errors.Wrap(err, "failed to initialize gorm")
		}

		defer db.Close()

		// initialize datastore
		db, err = protocoldb.InitMigrate(db, b.logger.Named("datastore"))
		if err != nil {
			return errors.Wrap(err, "failed to initialize datastore")
		}

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger: b.logger.Named("bertyprotocol"),
		}

		protocol, err = bertyprotocol.New(db, protocolOpts)
		if err != nil {
			return errors.Wrap(err, "failed to initialize protocol")
		}

		defer protocol.Close()
	}

	// setup chat
	var chat bertychat.Client
	{
		var db *gorm.DB

		// initialize sqlite3 gorm database
		db, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return errors.Wrap(err, "failed to initialize gorm")
		}

		defer db.Close()

		// initialize datastore
		db, err = chatdb.InitMigrate(db, b.logger.Named("datastore"))
		if err != nil {
			return errors.Wrap(err, "failed to initialize datastore")
		}

		// initialize bertychat client
		chatOpts := bertychat.Opts{
			Logger: b.logger.Named("bertychat"),
		}

		chat, err = bertychat.New(db, protocol, chatOpts)
		if err != nil {
			return errors.Wrap(err, "failed to initialize chat")
		}

		defer chat.Close()

	}

	// register service
	bertychat.RegisterAccountServer(b.grpcServer, chat)

	// run
	return b.serviceGroup.Run()
}

// Start bridge
func (b *Bridge) Start() {
	b.logger.Debug("starting bridge")
	go func() {
		b.cerr <- b.run()
	}()
}

func (b *Bridge) isStopped() bool {
	select {
	case <-b.cclose:
		return true
	default:
		return false
	}
}

// Stop bridge, once the bridge is stopped you will not be able to start it
// again until you create a new bridge instance
func (b *Bridge) Stop() (err error) {
	// is bridge stopped
	if b.isStopped() {
		return errors.New("bridge is not running or has already been stopped")
	}

	b.logger.Warn("stopping bridge")

	// send close signal
	b.once.Do(func() { close(b.cclose) })

	// set stop timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*4)
	defer cancel()

	// wait or die
	select {
	case err = <-b.cerr:
	case <-ctx.Done():
		err = ctx.Err()
	}

	if err == ErrInterrupted {
		return nil
	}

	return errors.Wrap(err, "failed stop bridge gracefully")
}

// RegisterGRPCService start a new grpc listener
// `:0` will listen on localhost with a random port
// Return current listening port on success
func (b *Bridge) RegisterGRPCService(addr string) (string, error) {
	l, err := net.Listen("tcp", addr)
	if err != nil {
		return "", errors.Wrap(err, "failed to listen")
	}

	b.serviceGroup.Add(func() error {
		b.logger.Info("starting grpc server", zap.String("addr", l.Addr().String()))
		return b.grpcServer.Serve(l)
	}, func(error) {
		b.logger.Debug("closing grpc server")
		l.Close()

	})

	return l.Addr().String(), nil
}

// RegisterGRPCWebService start a new grpc listener
// `:0` will listen on localhost with a random port
// Return current listening port on success
func (b *Bridge) RegisterGRPCWebService(addr string) (string, error) {
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

		// FIXME: enable tls, add authentification and remove wildcard
		// on Allow-Origin
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

	b.serviceGroup.Add(func() error {
		b.logger.Info("starting grpc web server", zap.String("addr", l.Addr().String()))
		return s.Serve(l)
	}, func(error) {
		b.logger.Debug("closing grpc web server")
		s.Close()
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

	b.serviceGroup.Add(func() error {
		return b.grpcServer.Serve(listener)
	}, func(error) {
		listener.Close()
	})

	grpcClient, err = grpc.Dial("pipe", dialOpts...)
	client = &Client{grpcClient}
	return
}

type Client struct {
	grpcClient *grpc.ClientConn
}

// UnaryRequest request make an unary request to the given method.
// the request need to be already serialized
func (c *Client) UnaryRequest(method string, req []byte) (res []byte, err error) {
	codec := bridgeutil.NewLazyCodec()
	in := bridgeutil.NewLazyMessage().FromBytes(req)
	out := bridgeutil.NewLazyMessage()
	err = c.grpcClient.Invoke(context.Background(), method, in, out, grpc.ForceCodec(codec))
	res = out.Bytes()
	return
}
