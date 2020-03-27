package bertybridge

import (
	"context"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

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

	pipeListener *grpcutil.PipeListener
	listeners    []grpcutil.Listener
}

// newBridge is the main entrypoint for gomobile and should only take simple configuration as argument
func newBridge(s *grpc.Server, logger *zap.Logger, config *Config) (*Bridge, error) {
	if config == nil {
		config = NewConfig()
	}

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
		b.once.Do(func() { close(b.cclose) })
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

	// setup lazy grpc listener
	pipeListener := grpcutil.NewPipeListener()
	b.workers.Add(func() error {
		return b.grpcServer.Serve(pipeListener)
	}, func(error) {
		pipeListener.Close()
	})

	b.pipeListener = pipeListener

	// start Bridge
	b.logger.Debug("starting Bridge")
	go func() {
		b.cerr <- b.workers.Run()
	}()

	return b, nil
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
func (b *Bridge) NewGRPCClient() (client *Client, err error) {
	var grpcClient *grpc.ClientConn
	if grpcClient, err = b.pipeListener.NewClientConn(grpc.WithInsecure()); err != nil {
		return
	}

	client = &Client{grpcClient}
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

	if err != errcode.ErrBridgeInterrupted {
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
	m, err := parseAddr(maddr)
	if err != nil {
		return err
	}

	b.logger.Info(m.String())
	l, err := grpcutil.Listen(m)
	if err != nil {
		return err
	}

	server := &grpcutil.Server{Server: b.grpcServer}
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

// helpers
func parseAddr(addr string) (maddr ma.Multiaddr, err error) {
	maddr, err = ma.NewMultiaddr(addr)
	if err != nil {
		// try to get a tcp multiaddr from host:port
		host, port, serr := net.SplitHostPort(addr)
		if serr != nil {
			return
		}

		if host == "" {
			host = "127.0.0.1"
		}

		addr = fmt.Sprintf("/ip4/%s/tcp/%s/grpcweb", host, port)
		maddr, err = ma.NewMultiaddr(addr)
	}

	return
}
