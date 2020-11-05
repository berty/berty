package bertybridge

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const bufListenerSize = 256 * 1024

var _ LifeCycleHandler = (*Bridge)(nil)

type Bridge struct {
	errc   chan error
	closec chan struct{}

	service             bertyaccount.Service
	bridgeServiceClient *grpcutil.LazyClient
	grpcServer          *grpc.Server
	onceCloser          sync.Once
	workers             run.Group
	logger              *zap.Logger

	lifecycleManager    *lifecycle.Manager
	notificationManager notification.Manager
}

func NewBridge(config *Config) (*Bridge, error) {
	ctx := context.Background()

	// create bridge instance
	b := &Bridge{
		errc:   make(chan error),
		closec: make(chan struct{}),
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
		if nativeLogger := config.dLogger; nativeLogger != nil {
			b.logger = newLogger(nativeLogger)
		} else {
			log.Println("WARN: no logger set")
			b.logger = zap.NewNop()
		}
	}

	// setup notification manager
	{
		if nativeNotification := config.notifdriver; nativeNotification != nil {
			b.notificationManager = newNotificationManagerAdaptater(b.logger, config.notifdriver)
		} else {
			b.logger.Warn("no native notification set")
			b.notificationManager = notification.NewLoggerManager(b.logger)
		}
	}

	// setup lifecycle manager
	{
		b.lifecycleManager = lifecycle.NewManager(bertymessenger.StateActive)
		if lifecycleHandler := config.lc; lifecycleHandler != nil {
			lifecycleHandler.RegisterHandler(b)
		}
	}

	// setup berty bridge service
	{
		opts := bertyaccount.Options{
			RootDirectory: config.rootDir,

			NotificationManager: b.notificationManager,
			Logger:              b.logger,
			LifecycleManager:    b.lifecycleManager,
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

	// start Bridge
	b.logger.Debug("starting Bridge")
	go func() {
		b.errc <- b.workers.Run()
	}()
	// time.Sleep(10 * time.Millisecond) // let some time to the goroutine to warm up

	return b, nil
}

func (b *Bridge) HandleState(appstate int) {
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
}

func (b *Bridge) HandleTask() LifeCycleBackgroundTask {
	return newBackgroundTask(b.logger, func(ctx context.Context) error {
		b.lifecycleManager.UpdateState(bertymessenger.StateActive)
		err := b.service.WakeUp(ctx)
		b.lifecycleManager.UpdateState(bertymessenger.StateInactive)
		return err
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
