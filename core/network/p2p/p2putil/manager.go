package p2putil

import (
	"context"
	"fmt"
	"net"
	"sync"

	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	protocol "github.com/libp2p/go-libp2p-protocol"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
)

type client struct {
	target string
	client *grpc.ClientConn
	m      *Manager
	mu     sync.Mutex
}

type Manager struct {
	mu   sync.Mutex
	opts []grpc.DialOption
	pool map[string]*client
}

func NewNetManager(opts ...grpc.DialOption) *Manager {
	return &Manager{
		opts: opts,
		pool: make(map[string]*client),
	}
}

func newClient(m *Manager, target string) *client {
	return &client{
		m:      m,
		target: target,
		client: nil,
	}
}

func (c *client) GetClient(ctx context.Context) (*grpc.ClientConn, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	c.mu.Lock()
	defer c.mu.Unlock()

	var err error
	if c.client == nil {
		c.client, err = grpc.DialContext(ctx, c.target, c.m.opts...)
		if err != nil {
			return nil, err
		}
	}

	return c.client, nil
}

func (c *client) Close() (err error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.client != nil {
		err = c.client.Close()

	}

	return
}

func (m *Manager) GetConn(ctx context.Context, target string) (*grpc.ClientConn, error) {
	tracer := tracing.EnterFunc(ctx, target)
	defer tracer.Finish()
	ctx = tracer.Context()

	m.mu.Lock()
	var c *client

	c, ok := m.pool[target]
	if !ok {
		logger().Debug("Creating new connection with", zap.String("target", target))
		c = newClient(m, target)
		m.pool[target] = c
	}
	m.mu.Unlock()

	cl, err := c.GetClient(ctx)
	if err != nil {
		return nil, err
	}

	switch cl.GetState() {
	// @TODO: it appears that, sometimes,
	// connectivity cannot recover from TransientFailure state on IOS
	case connectivity.Shutdown:
		m.mu.Lock()
		if err = c.Close(); err != nil {
			logger().Warn("Failed to close connection", zap.Error(err))
		}

		delete(m.pool, target)
		m.mu.Unlock()
		return m.GetConn(ctx, target)
	}

	return cl, nil
}

func NewDialer(host host.Host, pid protocol.ID) func(context.Context, string) (net.Conn, error) {
	return func(ctx context.Context, target string) (net.Conn, error) {
		peerID, err := peer.IDB58Decode(target)
		if err != nil {
			return nil, fmt.Errorf("failed to parse `%s`: %s", target, err.Error())
		}

		// No stream exist, creating a new one
		logger().Debug("Dialing", zap.String("addr", target))

		s, err := host.NewStream(ctx, peerID, pid)
		if err != nil {
			logger().Error("new stream failed", zap.Error(err))
			return nil, errorcodes.ErrNetStream.Wrap(err)
		}

		return NewConnFromStream(s)
	}
}
