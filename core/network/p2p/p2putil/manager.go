package p2putil

import (
	"context"
	"sync"

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
	case connectivity.TransientFailure:
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
