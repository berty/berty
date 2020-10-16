package bertybridge

import (
	"context"
	"fmt"
	mrand "math/rand"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/core/bootstrap"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/framework/bertybridge/internal/bridgepb"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const bufListenerSize = 256 * 1024

type Bridge struct {
	initManager        *initutil.Manager
	initManagerCleanup func()
	node               *core.IpfsNode
	lifecycleDriver    LifeCycleDriver
	logger             *zap.Logger
	currentAppState    int
	notification       notification.Manager
	lifecycleManager   *lifecycle.Manager
	handleStateMutex   sync.Mutex
	errc               chan error
	closec             chan struct{}
	onceCloser         sync.Once
	workers            run.Group
	grpcServer         *grpc.Server
	client             *client
}

var _ LifeCycleHandler = (*Bridge)(nil)

func NewBridge(config *Config) (*Bridge, error) {
	manager, managerCleanup, err := config.manager()
	if err != nil {
		return nil, err
	}

	ctx := manager.GetContext()

	// get logger
	logger, err := manager.GetLogger()
	if err != nil {
		return nil, err
	}

	// get local IPFS
	_, node, err := manager.GetLocalIPFS()
	if err != nil {
		return nil, err
	}

	// get gRPC server
	grpcServer, _, err := manager.GetGRPCServer()
	if err != nil {
		return nil, err
	}

	_, err = manager.GetLocalMessengerServer()
	if err != nil {
		return nil, err
	}

	notifmanager, err := manager.GetNotificationManager()
	if err != nil {
		return nil, err
	}

	// create bridge instance
	b := &Bridge{
		errc:               make(chan error),
		closec:             make(chan struct{}),
		grpcServer:         grpcServer,
		logger:             logger,
		initManager:        manager,
		initManagerCleanup: managerCleanup,
		notification:       notifmanager,
		lifecycleDriver:    config.lc,
		lifecycleManager:   manager.GetLifecycleManager(),
		node:               node,
	}

	// gRPC services
	{
		// create cancel service
		{
			b.workers.Add(func() error {
				// wait for closing signal
				<-b.closec
				return errcode.ErrBridgeInterrupted
			}, func(error) {
				b.onceCloser.Do(func() { close(b.closec) })
			})
		}

		// setup bridge client
		{
			clientConn, err := manager.GetGRPCClientConn()
			if err != nil {
				return nil, err
			}

			// register services for bridge client
			service := newServiceFromClientConn(clientConn)
			s := grpc.NewServer()
			bridgepb.RegisterBridgeServiceServer(s, service)

			bl := grpcutil.NewBufListener(ctx, bufListenerSize)
			b.workers.Add(func() error {
				return s.Serve(bl)
			}, func(error) {
				bl.Close()
				service.Close()
			})

			// create native bridge client
			ccBridge, err := bl.NewClientConn()
			if err != nil {
				return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
			}
			b.client = &client{ccBridge}
		}
	}

	// hook the lifecycle manager
	{
		b.HandleState(config.lc.GetCurrentState())
		config.lc.RegisterHandler(b)
	}

	// start Bridge
	b.logger.Debug("starting Bridge")
	go func() {
		b.errc <- b.workers.Run()
	}()
	time.Sleep(10 * time.Millisecond) // let some time to the goroutine to warm up

	return b, nil
}

func (b *Bridge) HandleState(appstate int) {
	b.handleStateMutex.Lock()
	defer b.handleStateMutex.Unlock()

	if appstate != b.currentAppState {
		switch appstate {
		case AppStateBackground:
			b.lifecycleManager.UpdateState(bertymessenger.StateInactive)
			b.logger.Info("app is in Background State")
		case AppStateActive:
			b.lifecycleManager.UpdateState(bertymessenger.StateActive)
			b.logger.Info("app is in Active State")
			if b.node != nil {
				bootstrapConfig := bootstrap.BootstrapConfig{
					MinPeerThreshold:  5,
					Period:            10 * time.Second,
					ConnectionTimeout: 5 * time.Second, // Period / 2
				}
				if err := b.node.Bootstrap(bootstrapConfig); err != nil {
					b.logger.Warn("unable to boostrap node", zap.Error(err))
				}
			}
		case AppStateInactive:
			b.lifecycleManager.UpdateState(bertymessenger.StateInactive)
			b.logger.Info("app is in Inactive State")
		}
		b.currentAppState = appstate
	}
}

var backgroundCounter int32

func (b *Bridge) HandleTask() LifeCycleBackgroundTask {
	return newBackgroundTask(b.logger, func(ctx context.Context) error {
		counter := atomic.AddInt32(&backgroundCounter, 1)
		b.logger.Info("starting background task", zap.Int("counter", int(backgroundCounter)))

		started := time.Now()
		n := time.Duration(mrand.Intn(60) + 5) // nolint:gosec
		ctx, cancel := context.WithTimeout(ctx, time.Second*n)
		defer cancel()

		if err := b.notification.Notify(&notification.Notification{
			Title: fmt.Sprintf("GoBackgroundTask #%d", counter),
			Body:  "started",
		}); err != nil {
			b.logger.Error("unable to notify", zap.Error(err))
		}

		<-ctx.Done()

		if err := b.notification.Notify(&notification.Notification{
			Title: fmt.Sprintf("GoBackgroundTask #%d", counter),
			Body:  fmt.Sprintf("ended (duration: %s)", time.Since(started).Truncate(time.Second)),
		}); err != nil {
			b.logger.Error("unable to notify", zap.Error(err))
		}
		b.logger.Info("ending background task",
			zap.Int("counter", int(backgroundCounter)),
			zap.Duration("duration", time.Since(started)),
		)

		return nil
	})
}

func (b *Bridge) WillTerminate() {
	if err := b.Close(); err != nil {
		errs := multierr.Errors(err)
		errFields := make([]zap.Field, len(errs))
		for i, err := range errs {
			errFields[i] = zap.Error(err)
		}
		b.logger.Error("unable to close messenger properly", errFields...)
	} else {
		b.logger.Info("messenger has been closed")
	}
}

func (b *Bridge) Close() error {
	b.logger.Info("Bridge.Close called")

	var errs error

	// close gRPC bridge
	if !b.isClosed() {
		// send close signal
		b.onceCloser.Do(func() { close(b.closec) })

		// set close timeout
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*4)

		// wait or die
		var err error
		select {
		case err = <-b.errc:
		case <-ctx.Done():
			err = ctx.Err()
		}

		b.grpcServer.Stop()

		if !errcode.Is(err, errcode.ErrBridgeInterrupted) {
			errs = multierr.Append(errs, err)
		}

		cancel()
	}

	b.initManagerCleanup()
	return errs
}

type PromiseBlock interface {
	CallResolve(reply string)
	CallReject(error error)
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
	return b.client.UnaryRequestFromBase64(method, b64message)
}

// func (b *Bridge) GRPCListenerAddr() string          { return b.getGRPCAddrFor("ip4/tcp/grpc") }
func (b *Bridge) GRPCWebListenerAddr() string       { return b.getGRPCAddrFor("ip4/tcp/grpcweb") }
func (b *Bridge) GRPCWebSocketListenerAddr() string { return b.getGRPCAddrFor("ip4/tcp/grpcws") }

// getGRPCAddrFor the given protocols, if not found return an empty string
func (b *Bridge) getGRPCAddrFor(protos string) string {
	for _, l := range b.initManager.GetGRPCListeners() {
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

func (b *Bridge) isClosed() bool {
	select {
	case <-b.closec:
		return true
	default:
		return false
	}
}
