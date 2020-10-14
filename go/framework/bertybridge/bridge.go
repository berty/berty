package bertybridge

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/framework/bertybridge/internal/bridgepb"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const ClientBufferSize = 256 * 1024

type PromiseBlock interface {
	CallResolve(reply string)
	CallReject(error error)
}

type Config struct {
	bridgeGrpcAddrs []string
}

func NewConfig() *Config {
	return &Config{
		bridgeGrpcAddrs: make([]string, 0),
	}
}

// AddGRPCListener create a grpc listener with the given multiaddr
// if a normal addr is given, it will listen by default on grpcweb
// (ex: ":0" -> "/ip4/127.0.0.1/tcp/0/grpcweb")
func (c *Config) AddGRPCListener(addr string) {
	c.bridgeGrpcAddrs = append(c.bridgeGrpcAddrs, addr)
}

type Bridge struct {
	cerr       chan error
	cclose     chan struct{}
	once       sync.Once
	workers    run.Group
	grpcServer *grpc.Server
	logger     *zap.Logger

	clientBridgeService *Client

	bufListener *grpcutil.BufListener
	listeners   []grpcutil.Listener
}

func newBridge(m *initutil.Manager) (*Bridge, error) {
	b := &Bridge{
		cerr:   make(chan error),
		cclose: make(chan struct{}),

		// noop opt
		grpcServer: s,
		logger:     logger,
	}

	// Create cancel service
	b.workers.Add(func() error {
		// wait for closing signal
		<-b.cclose
		return errcode.ErrBridgeInterrupted
	}, func(error) {
		b.once.Do(func() {
			close(b.cclose)
		})
	})

	// setup grpc listeners
	{
		var err error
		for _, addr := range config.bridgeGrpcAddrs {
			if addr == "" {
				err = fmt.Errorf("addr can't be empty")
			} else {
				err = b.addGRPCListenner(addr)
			}

			if err != nil {
				return nil, errors.Wrap(err, "init gRPC listener failed")
			}
		}
	}

	ctx := m.GetContext()

	// setup lazy grpc listener
	bl := grpcutil.NewBufListener(ctx, ClientBufferSize)
	b.workers.Add(func() error {
		return b.grpcServer.Serve(bl)
	}, func(error) {
		bl.Close()
	})

	// setup lazy grpc listener for services
	var ccServices *grpc.ClientConn
	var bufListener *grpcutil.BufListener
	{
		var err error

		bufListener = grpcutil.NewBufListener(ctx, ClientBufferSize)
		b.workers.Add(func() error {
			return b.grpcServer.Serve(bufListener)
		}, func(error) {
			bufListener.Close()
		})

		if ccServices, err = bufListener.NewClientConn(); err != nil {
			return nil, errors.Wrap(err, "unable to get services gRPC ClientConn")
		}
	}
	b.bufListener = bufListener

	// setup bridge client
	var ccBridge *grpc.ClientConn
	{
		var err error

		service := NewServiceFromClientConn(ccServices)
		s := grpc.NewServer()
		bridgepb.RegisterBridgeServiceServer(s, service)

		bl := grpcutil.NewBufListener(ctx, ClientBufferSize)
		b.workers.Add(func() error {
			return s.Serve(bl)
		}, func(error) {
			bl.Close()
			service.Close()
		})

		if ccBridge, err = bl.NewClientConn(); err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}
	}
	b.clientBridgeService = &Client{ccBridge}

	// start Bridge
	b.logger.Debug("starting Bridge")
	go func() {
		b.cerr <- b.workers.Run()
	}()

	return b, nil
}

func (b *Bridge) InvokeBridgeMethodWithPromiseBlock(promise PromiseBlock, method string, b64message string) {
	go func() {
		res, err := b.InvokeBridgeMethod(method, b64message)
		// if an internal error occure generate a new bridge error
		if err != nil {
			err = errors.Wrap(err, "unable to invoke bridge method")
			promise.CallReject(err)
			return
		}

		promise.CallResolve(res)
	}()
}

func (b *Bridge) InvokeBridgeMethod(method string, b64message string) (string, error) {
	return b.clientBridgeService.UnaryRequestFromBase64(method, b64message)
}

func (b *Bridge) GRPCListenerAddr() string          { return b.GetGRPCAddrFor("ip4/tcp/grpc") }
func (b *Bridge) GRPCWebListenerAddr() string       { return b.GetGRPCAddrFor("ip4/tcp/grpcweb") }
func (b *Bridge) GRPCWebSocketListenerAddr() string { return b.GetGRPCAddrFor("ip4/tcp/grpcws") }

// GetGRPCAddrFor the given protocols, if not found return an empty string
func (b *Bridge) GetGRPCAddrFor(protos string) string {
	for _, l := range b.listeners {
		ps := make([]string, 0)
		ma.ForEach(l.GRPCMultiaddr(), func(c ma.Component) bool {
			ps = append(ps, c.Protocol().Name)
			return true
		})

		if strings.Join(ps, "/") == protos {
			return l.Addr().String()
		}
	}

	return ""
}

// NewGRPCClient return client service on success
func (b *Bridge) NewGRPCClient() (client *Client, cleanup func(), err error) {
	var grpcClient *grpc.ClientConn
	if grpcClient, err = b.bufListener.NewClientConn(); err != nil {
		return
	}

	client = &Client{grpcClient}
	cleanup = func() {
		_ = client.Close()
	}

	return
}

// Close Bridge
func (b *Bridge) Close() (err error) {
	if b.isClosed() {
		return errcode.ErrBridgeNotRunning
	}

	b.logger.Info("Bridge.Close called")

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

	b.grpcServer.Stop()
	b.bufListener.Close()

	if !errcode.Is(err, errcode.ErrBridgeInterrupted) {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func (b *Bridge) isClosed() bool {
	select {
	case <-b.cclose:
		return true
	default:
		return false
	}
}

func (b *Bridge) addGRPCListenner(maddr string) error {
	m, err := ipfsutil.ParseAddr(maddr)
	if err != nil {
		return err
	}

	b.logger.Info("add gRPC listener", zap.Stringer("addr", m))
	l, err := grpcutil.Listen(m)
	if err != nil {
		return err
	}

	server := &grpcutil.Server{GRPCServer: b.grpcServer}
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

	b.listeners = append(b.listeners, l)
	return nil
}
