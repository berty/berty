package bertybridge

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"

	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	account_svc "berty.tech/berty/v2/go/pkg/bertyaccount"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/tyber"
)

const bufListenerSize = 256 * 1024

var _ LifeCycleHandler = (*Bridge)(nil)

type Bridge struct {
	errc   chan error
	closec chan struct{}

	serviceAccount account_svc.Service
	serviceBridge  bridge_svc.Service
	client         *grpcutil.LazyClient
	grpcServer     *grpc.Server
	onceCloser     sync.Once
	workers        run.Group
	bleDriver      proximity.NativeDriver
	nbDriver       proximity.NativeDriver
	logger         *zap.Logger
	closeLogger    func()

	lifecycleManager    *lifecycle.Manager
	notificationManager notification.Manager
}

func randomID() string {
	bytes := make([]byte, 256/8)
	_, _ = rand.Read(bytes)
	return base64.RawURLEncoding.EncodeToString(bytes)
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

	cores := []zapcore.Core(nil)

	// tyber core
	if config.TyberHost != "" {
		mutex := &sync.Mutex{}
		canceled := false
		ch := make(chan struct{})
		go func() {
			defer func() { ch <- struct{}{}; close(ch) }()
			logger, clean, err := logutil.NewLogger(logutil.NewTyberStream(config.TyberHost))
			if err == nil {
				mutex.Lock()
				defer mutex.Unlock()
				if canceled {
					clean()
					return
				}
				b.closeLogger = clean
				cores = append(cores, logger.Core())
			}
		}()
		select {
		case <-time.After(time.Second * 2):
			mutex.Lock()
			canceled = true
			mutex.Unlock()
		case <-ch:
		}
	}

	// native core
	if nativeLogger := config.dLogger; nativeLogger != nil {
		nl := newLogger(nativeLogger)
		cores = append(cores, nl.Core())
	}

	// create logger
	if len(cores) == 0 {
		b.logger = zap.NewNop()
	} else {
		b.logger = zap.New(
			zapcore.NewTee(cores...),
			zap.AddCaller(),
		)
		b.logger.Debug("logger initialized", zap.Any("manager", &initutil.Manager{
			SessionID: randomID(),
		}))
	}

	// @NOTE(gfanton): replace grpc logger as soon as possible to avoid DATA_RACE
	initutil.ReplaceGRPCLogger(b.logger.Named("grpc"))

	{
		tyberCtx, _ := tyber.ContextWithTraceID(context.TODO())
		tyber.LogTraceStart(tyberCtx, b.logger, "Initializing Berty framework")
		tyber.LogStep(tyberCtx, b.logger, "Berty framework config", tyber.WithJSONDetail("Config", config))
		tyber.LogTraceEnd(tyberCtx, b.logger, "Done")
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

	// setup ble driver
	{
		b.bleDriver = config.bleDriver
	}

	// setup nearby driver
	{
		b.nbDriver = config.nbDriver
	}

	// setup lifecycle manager
	{
		b.lifecycleManager = lifecycle.NewManager(bertymessenger.StateActive)
		if lifecycleHandler := config.lc; lifecycleHandler != nil {
			lifecycleHandler.RegisterHandler(b)
		}
	}

	// setup native bridge client
	{
		opts := &bridge_svc.Options{
			Logger: b.logger,
		}

		b.serviceBridge = bridge_svc.NewService(opts)
		b.grpcServer = grpc.NewServer()

		bridge_svc.RegisterBridgeServiceServer(b.grpcServer, b.serviceBridge)

		bl := grpcutil.NewBufListener(ctx, bufListenerSize)
		b.workers.Add(func() error {
			return b.grpcServer.Serve(bl)
		}, func(error) {
			b.serviceBridge.Close()
			bl.Close()
		})

		// create native bridge client
		ccBridge, err := bl.NewClientConn()
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		b.client = grpcutil.NewLazyClient(ccBridge)
	}

	// setup berty account service
	{
		opts := account_svc.Options{
			RootDirectory: config.RootDirPath,

			ServiceClientRegister: b.serviceBridge,
			NotificationManager:   b.notificationManager,
			Logger:                b.logger,
			LifecycleManager:      b.lifecycleManager,
			BleDriver:             b.bleDriver,
			NBDriver:              b.nbDriver,
		}

		var err error
		if b.serviceAccount, err = account_svc.NewService(&opts); err != nil {
			return nil, err
		}
	}

	// setup account client
	{
		s := grpc.NewServer()

		// register services bridge client
		account_svc.RegisterAccountServiceServer(s, b.serviceAccount)

		bl := grpcutil.NewBufListener(ctx, bufListenerSize)
		b.workers.Add(func() error {
			return s.Serve(bl)
		}, func(error) {
			b.serviceAccount.Close()
			bl.Close()
		})

		// bind account to native bridge
		ccAccount, err := bl.NewClientConn()
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		// register account to service bridge
		for serviceName := range s.GetServiceInfo() {
			b.serviceBridge.RegisterService(serviceName, ccAccount)
		}
	}

	// setup native bridge client

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
		err := b.serviceAccount.WakeUp(ctx)
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

func (b *Bridge) Close() (err error) {
	_, _, endSection := tyber.Section(context.TODO(), b.logger, "Closing Berty framework")
	defer func() {
		endSection(err, "")
		if b.closeLogger != nil {
			b.closeLogger()
		}
	}()

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
		// if an internal error occurred generate a new bridge error
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

	out, err := b.client.InvokeUnary(context.Background(), desc, in)
	if err != nil {
		return "", err
	}

	return out.Base64(), nil
}
