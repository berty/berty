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
	"go.uber.org/zap/zapcore"
	"golang.org/x/text/language"
	"google.golang.org/grpc"

	berty_grpcutil "berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/mdns"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	account_svc "berty.tech/berty/v2/go/pkg/bertyaccount"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/osversion"
	"berty.tech/weshnet/v2/pkg/grpcutil"
	"berty.tech/weshnet/v2/pkg/lifecycle"
	"berty.tech/weshnet/v2/pkg/logutil"
	"berty.tech/weshnet/v2/pkg/netmanager"
	proximity "berty.tech/weshnet/v2/pkg/proximitytransport"
)

var _ LifeCycleHandler = (*Bridge)(nil)

type Bridge struct {
	errc   chan error
	closec chan struct{}

	serviceAccount account_svc.Service
	serviceBridge  bridge_svc.Service
	grpcServer     *grpc.Server
	onceCloser     sync.Once
	workers        run.Group
	bleDriver      proximity.ProximityDriver
	nbDriver       proximity.ProximityDriver
	mdnsLocker     sync.Locker
	logger         *zap.Logger
	langtags       []language.Tag

	connectivityDriver IConnectivityDriver
	netmanager         *netmanager.NetManager

	lifecycleManager    *lifecycle.Manager
	notificationManager notification.Manager

	ServiceClient
}

func NewBridge(config *BridgeConfig) (*Bridge, error) {
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
			return errcode.ErrCode_ErrBridgeInterrupted
		}, func(error) {
			b.onceCloser.Do(func() { close(b.closec) })
		})
	}

	// setup logger
	{
		b.logger = logutil.NewNativeLogger("bertybridge")

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
			mdns.SetNetDriver(inet)
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

		bl := grpcutil.NewBufListener(bufListenerSize)
		b.workers.Add(func() error {
			return b.grpcServer.Serve(bl)
		}, func(error) {
			b.serviceBridge.Close()
			bl.Close()
		})

		// create native bridge client
		ccBridge, err := bl.NewClientConn(ctx)
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		b.ServiceClient = NewServiceClient(berty_grpcutil.NewLazyClient(ccBridge))
	}

	// setup lifecycle manager
	{
		b.lifecycleManager = lifecycle.NewManager(lifecycle.StateActive)
		if lifecycleHandler := config.lc; lifecycleHandler != nil {
			lifecycleHandler.RegisterHandler(b)
		}
	}

	// setup connectivity driver
	{
		if config.connectivityDriver != nil {
			b.connectivityDriver = config.connectivityDriver
			b.netmanager = netmanager.NewNetManager(*config.connectivityDriver.GetCurrentState().info)
			config.connectivityDriver.RegisterHandler(b)
		}
	}

	// setup berty account service
	{
		opts := account_svc.Options{
			AppRootDirectory:    config.AppRootDirPath,
			SharedRootDirectory: config.SharedRootDirPath,

			MDNSLocker:            b.mdnsLocker,
			NetManager:            b.netmanager,
			Languages:             b.langtags,
			ServiceClientRegister: b.serviceBridge,
			NotificationManager:   b.notificationManager,
			Logger:                b.logger,
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

		bl := grpcutil.NewBufListener(bufListenerSize)
		b.workers.Add(func() error {
			return s.Serve(bl)
		}, func(error) {
			b.serviceAccount.Close()
			bl.Close()
		})

		// bind account to native bridge
		ccAccount, err := bl.NewClientConn(ctx)
		if err != nil {
			return nil, errors.Wrap(err, "unable to get bridge gRPC ClientConn")
		}

		// register account to service bridge
		for serviceName := range s.GetServiceInfo() {
			b.serviceBridge.RegisterService(serviceName, ccAccount)
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
		b.lifecycleManager.UpdateState(lifecycle.StateInactive)
		b.logger.Info("app is in Background State")
	case AppStateActive:
		b.lifecycleManager.UpdateState(lifecycle.StateActive)
		b.logger.Info("app is in Active State")
	case AppStateInactive:
		b.lifecycleManager.UpdateState(lifecycle.StateInactive)
		b.logger.Info("app is in Inactive State")
	default:
		// unknown state
		return
	}

	// wait that all tasks are done
	b.lifecycleManager.WaitForTasks()

	b.logger.Debug("all tasks for the current state have been processed")
}

func (b *Bridge) HandleTask() LifeCycleBackgroundTask {
	return newBackgroundTask(b.logger, func(ctx context.Context) error {
		if b.serviceAccount == nil {
			return fmt.Errorf("service accnunt not initialized")
		}

		b.lifecycleManager.UpdateState(lifecycle.StateActive)
		err := b.serviceAccount.WakeUp(ctx)
		b.lifecycleManager.UpdateState(lifecycle.StateInactive)

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

		if !errcode.Is(err, errcode.ErrCode_ErrBridgeInterrupted) {
			errs = multierr.Append(errs, err)
		}

		cancel()
	}

	return errs
}

func (b *Bridge) isClosed() bool {
	select {
	case <-b.closec:
		return true
	default:
		return false
	}
}

const (
	LevelDebug int = int(zapcore.DebugLevel)
	LevelInfo  int = int(zapcore.InfoLevel)
	LevelWarn  int = int(zapcore.WarnLevel)
	LevelError int = int(zapcore.ErrorLevel)
)

func (b *Bridge) Log(level int, subsystem string, message string) {
	b.logger.Named(subsystem).Log(zapcore.Level(level), message)
}

func (b *Bridge) HandleConnectivityUpdate(info *ConnectivityInfo) {
	b.logger.Info("Connectivity update", zap.Any("info", info.info.String()))

	b.netmanager.UpdateState(*info.info)
}
