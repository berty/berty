package bridge

import (
	"context"
	mrand "math/rand"
	"sync"
	"sync/atomic"
	"time"

	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const bufListenerSize = 256 * 1024

var _ LifeCycleHandler = (*Bridge)(nil)

type Bridge struct {
	service             bertyaccount.Service
	bridgeServiceClient *grpcutil.LazyClient
	grpcServer          *grpc.Server
	closec              chan struct{}
	onceCloser          sync.Once
	workers             run.Group
	errc                chan error
	logger              *zap.Logger
	lifecycleManager    *lifecycle.Manager

	// initManager        *initutil.Manager
	// initManagerCleanup func()
	// node               *core.IpfsNode
	// notification       notification.Manager

	// client             *client

	handleStateMutex sync.Mutex
	currentAppState  int
	lifecycleDriver  LifeCycleDriver
}

func New(config *Config) (*Bridge, error) {
	ctx := context.Background()

	// create bridge instance
	b := &Bridge{
		errc:   make(chan error),
		closec: make(chan struct{}),
		// service:         service,
		// lifecycleDriver: config.lc,
		// grpcServer:         grpcServer,
		// logger:             logger,
		// initManager:        manager,
		// initManagerCleanup: managerCleanup,
		// notification:       notifmanager,

		// lifecycleManager:   manager.GetLifecycleManager(),
		// node:               node,
	}

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

	// setup logger
	{

		var err error
		if b.logger, err = newLogger(config.dLogger); err != nil {
			return nil, err
		}
	}

	// setup berty bridge service
	{
		opts := bertyaccount.Options{
			NotificationManager: newNotificationManagerAdaptater(b.logger, config.notifdriver),
			Logger:              b.logger,
			RootDirectory:       config.rootDir,
		}

		var err error
		if b.service, err = bertyaccount.NewService(&opts); err != nil {
			return nil, err
		}
	}

	// setup bridge client
	{
		// register services for bridge client
		s := grpc.NewServer()
		bertyaccount.RegisterAccountServiceServer(s, b.service)

		bl := grpcutil.NewBufListener(ctx, bufListenerSize)
		b.workers.Add(func() error {
			return s.Serve(bl)
		}, func(error) {
			bl.Close()
			b.service.Close()
		})

		b.grpcServer = s

		// create native bridge client
		ccBridge, err := bl.NewClientConn()
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		b.bridgeServiceClient = grpcutil.NewLazyClient(ccBridge)
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
	// time.Sleep(10 * time.Millisecond) // let some time to the goroutine to warm up

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
		b.logger.Info("starting background task", zap.Int("counter", int(counter)))

		started := time.Now()
		n := time.Duration(mrand.Intn(60) + 5) // nolint:gosec
		ctx, cancel := context.WithTimeout(ctx, time.Second*n)
		defer cancel()

		// background task started

		<-ctx.Done()

		// background task ended

		b.logger.Info("ending background task",
			zap.Int("counter", int(counter)),
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

func (b *Bridge) isClosed() bool {
	select {
	case <-b.closec:
		return true
	default:
		return false
	}
}

func (b *Bridge) InvokeBridgeMethod(method string, b64message string) (string, error) {
	in, err := grpcutil.NewLazyMessage().FromBase64(b64message)
	if err != nil {
		return "", err
	}
	desc := &grpcutil.LazyMethodDesc{
		Name: method,
	}

	out, err := b.bridgeServiceClient.InvokeUnary(context.Background(), desc, in)
	if err != nil {
		return "", err
	}

	return out.Base64(), nil
}

// // func (b *Bridge) GRPCListenerAddr() string          { return b.getGRPCAddrFor("ip4/tcp/grpc") }
// func (b *Bridge) GRPCWebListenerAddr() string       { return b.getGRPCAddrFor("ip4/tcp/grpcweb") }
// func (b *Bridge) GRPCWebSocketListenerAddr() string { return b.getGRPCAddrFor("ip4/tcp/grpcws") }

// getGRPCAddrFor the given protocols, if not found return an empty string
// func (b *Bridge) getGRPCAddrFor(protos string) string {
// 	for _, l := range b.initManager.GetGRPCListeners() {
// 		ps := make([]string, 0)
// 		ma.ForEach(l.GRPCMultiaddr(), func(c ma.Component) bool {
// 			ps = append(ps, c.Protocol().Name)
// 			return true
// 		})

// 		if strings.Join(ps, "/") == protos {
// 			return l.Addr().String()
// 		}
// 	}

// 	return ""
// }
