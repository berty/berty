package bertybridge

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"

	manet "github.com/multiformats/go-multiaddr/net"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"golang.org/x/text/language"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	account_svc "berty.tech/berty/v2/go/pkg/bertyaccount"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/osversion"
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
	bleDriver      proximity.ProximityDriver
	nbDriver       proximity.ProximityDriver
	mdnsLocker     sync.Locker
	logger         *zap.Logger
	langtags       []language.Tag

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
	var disableLogging bool
	{
		if nativeLogger := config.dLogger; nativeLogger != nil {
			b.logger = newLogger(nativeLogger)
		} else {
			disableLogging = true
			b.logger = zap.NewNop()
		}

		// @NOTE(gfanton): replace grpc logger as soon as possible to avoid DATA_RACE
		logutil.ReplaceGRPCLogger(b.logger.Named("grpc"))
	}

	// setup netdriver
	{
		if config.netDriver != nil {
			inet := &inet{
				net:    config.netDriver,
				logger: b.logger,
			}
			ipfsutil.SetNetDriver(inet)
			manet.SetNetInterface(inet)
		}
	}

	// parse language
	{
		fields := []string{}
		for _, lang := range config.languages {
			tag, err := language.Parse(lang)
			if err != nil {
				b.logger.Warn("unable to parse language", zap.String("lang", lang), zap.Error(err))
				continue
			}

			fields = append(fields, tag.String())
			b.langtags = append(b.langtags, tag)
		}

		b.logger.Info("user preferred language loaded", zap.Strings("language", fields))
	}

	// setup notification manager
	{
		if nativeNotification := config.notifdriver; nativeNotification != nil {
			b.notificationManager = newNotificationManagerAdapter(b.logger, config.notifdriver)
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

	{
		if runtime.GOOS == "android" && osversion.GetVersion().Major() >= 30 &&
			config.mdnsLockerDriver != nil {
			b.mdnsLocker = config.mdnsLockerDriver
		} else {
			b.mdnsLocker = &noopNativeMDNSLockerDriver{}
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

			MDNSLocker:            b.mdnsLocker,
			Languages:             b.langtags,
			ServiceClientRegister: b.serviceBridge,
			NotificationManager:   b.notificationManager,
			Logger:                b.logger,
			DisableLogging:        disableLogging,
			LifecycleManager:      b.lifecycleManager,
			BleDriver:             b.bleDriver,
			NBDriver:              b.nbDriver,
			Keystore:              config.keystoreDriver,
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
		accounttypes.RegisterAccountServiceServer(s, b.serviceAccount)

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

	// setup lifecycle manager
	{
		b.lifecycleManager = lifecycle.NewManager(bertymessenger.StateActive)
		if lifecycleHandler := config.lc; lifecycleHandler != nil {
			lifecycleHandler.RegisterHandler(b)
		}
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
		if b.serviceAccount == nil {
			return fmt.Errorf("service accnunt not initialized")
		}

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
