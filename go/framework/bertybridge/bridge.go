package bertybridge

import (
	"context"
	"fmt"
	"sync"
	"time"

	"berty.tech/berty/go/internal/grpcutil"
	"berty.tech/berty/go/pkg/errcode"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
)

type Bridge interface {
	GRPCClient() *Client
	GRPCListenerAddr() string
	GRPCWebListenerAddr() string
	GRPCWebSocketListenerAddr() string

	Close() error
}

type bridge struct {
	cerr       chan error
	cclose     chan struct{}
	once       sync.Once
	workers    run.Group
	grpcServer *grpc.Server
	logger     *zap.Logger

	grpcClient                *Client
	grpcListenerAddr          string
	grpcWebListenerAddr       string
	grpcWebSocketListenerAddr string
}

type BridgeOpts struct {
	GRPCListener          bool
	GRPCWebListener       bool
	GRPCWebSocketListener bool
	NoGRPCClient          bool
}

func newLogger(loglevel string) (logger *zap.Logger, err error) {
	config := zap.NewDevelopmentConfig()
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder

	switch loglevel {
	case "", "warn":
		config.Level.SetLevel(zap.WarnLevel)
	case "info":
		config.Level.SetLevel(zap.InfoLevel)
	case "debug":
		config.Level.SetLevel(zap.DebugLevel)
	default:
		err = fmt.Errorf("unsupported log level: %q", loglevel)
		return
	}

	logger, err = config.Build()
	return
}

// NewBridge is the main entrypoint for gomobile and should only take simple configuration as argument
func newBridge(s *grpc.Server, logger *zap.Logger, opts *BridgeOpts) (Bridge, error) {
	if opts == nil {
		opts = &BridgeOpts{}
	}

	b := &bridge{
		cerr:       make(chan error),
		cclose:     make(chan struct{}),
		grpcServer: s,
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

	// optional gRPC listener
	if opts.GRPCListener {
		var err error
		b.grpcListenerAddr, err = b.addGRPCListenner("/ip4/127.0.0.1/tcp/0/grpc")
		if err != nil {
			return nil, errors.Wrap(err, "init gRPC listener")
		}
	}

	// optional gRPC web listener
	if opts.GRPCWebListener {
		var err error
		b.grpcWebListenerAddr, err = b.addGRPCListenner("/ip4/127.0.0.1/tcp/0/grpcweb")
		if err != nil {
			return nil, errors.Wrap(err, "init gRPC listener")
		}
	}

	// optional gRPC web listener
	if opts.GRPCWebSocketListener {
		var err error
		b.grpcWebSocketListenerAddr, err = b.addGRPCListenner("/ip4/127.0.0.1/tcp/0/grpcw")
		if err != nil {
			return nil, errors.Wrap(err, "init gRPC listener")
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

func (b *bridge) GRPCListenerAddr() string          { return b.grpcListenerAddr }
func (b *bridge) GRPCWebListenerAddr() string       { return b.grpcWebListenerAddr }
func (b *bridge) GRPCWebSocketListenerAddr() string { return b.grpcWebSocketListenerAddr }
func (b *bridge) GRPCClient() *Client               { return b.grpcClient }

func (b *bridge) isClosed() bool {
	select {
	case <-b.cclose:
		return true
	default:
		return false
	}
}

// Close bridge
func (b *bridge) Close() (err error) {
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

	if err != errcode.ErrBridgeInterrupted {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func (b *bridge) addGRPCListenner(maddr string) (string, error) {
	m, err := ma.NewMultiaddr(maddr)
	if err != nil {
		return "", err
	}

	l, err := grpcutil.Listen(m)
	if err != nil {
		return "", err
	}

	server := &grpcutil.Server{b.grpcServer}
	b.workers.Add(func() (err error) {
		if err = server.Serve(l); err != nil {
			b.logger.Error("grpc serve server",
				zap.String("maddr", maddr),
				zap.Error(err))
		}

		return
	}, func(err error) {
		l.Close()
	})

	return l.Addr().String(), nil
}

// NewGRPCClient return client service on success
func (b *bridge) newGRPCClient() (client *Client, err error) {
	if b.isClosed() {
		return nil, errcode.ErrBridgeNotRunning
	}

	listener := grpcutil.NewPipeListener()

	b.workers.Add(func() error {
		return b.grpcServer.Serve(listener)
	}, func(error) {
		listener.Close()
	})

	var grpcClient *grpc.ClientConn
	grpcClient, err = listener.NewClientConn(grpc.WithInsecure())
	client = &Client{grpcClient}
	return
}
