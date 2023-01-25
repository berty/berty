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
	"berty.tech/berty/v2/go/internal/netmanager"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	account_svc "berty.tech/berty/v2/go/pkg/bertyaccount"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/osversion"
	"berty.tech/weshnet/pkg/grpcutil"
	"berty.tech/weshnet/pkg/ipfsutil"
	"berty.tech/weshnet/pkg/lifecycle"
	"berty.tech/weshnet/pkg/logutil"
	proximity "berty.tech/weshnet/pkg/proximitytransport"
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
	currentState   *ConnectivityInfo

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
			return errcode.ErrBridgeInterrupted
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
			b.currentState = config.connectivityDriver.GetCurrentState()
			config.connectivityDriver.RegisterHandler(b)
		}
	}

	// setup berty account service
	{
		opts := account_svc.Options{
			AppRootDirectory:    config.AppRootDirPath,
			SharedRootDirectory: config.SharedRootDirPath,

			MDNSLocker:            b.mdnsLocker,
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

		if !errcode.Is(err, errcode.ErrBridgeInterrupted) {
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

// type ConnectivityInfo = netmanager.ConnectivityInfo

// func NewConnectivityInfo() *ConnectivityInfo {
// 	return netmanager.NewConnectivityInfo()
// }

// type ConnectivityHandler interface { netmanager.ConnectivityHandler }
// type ConnectivityDriver interface  { netmanager.ConnectivityDriver }

// const (
// 	ConnectivityStateUnknown int  = int(netmanager.ConnectivityStateUnknown) 
// 	ConnectivityStateOff          = int(netmanager.ConnectivityStateOff)
// 	ConnectivityStateOn           = int(netmanager.ConnectivityStateOn)

// 	ConnectivityNetUnknown        = int(netmanager.ConnectivityNetUnknown)
// 	ConnectivityNetNone           = int(netmanager.ConnectivityNetNone)
	
// 	ConnectivityNetEthernet       = int(netmanager.ConnectivityNetEthernet)
// 	ConnectivityNetCellular       = int(netmanager.ConnectivityNetCellular)

// 	ConnectivityCellularUnknown   = int(netmanager.ConnectivityCellularUnknown)
// 	ConnectivityCellularNone      = int(netmanager.ConnectivityCellularNone)
// 	ConnectivityCellular2G        = int(netmanager.ConnectivityCellular2G)
// 	ConnectivityCellular3G        = int(netmanager.ConnectivityCellular3G)
// 	ConnectivityCellular4G        = int(netmanager.ConnectivityCellular4G)
// 	ConnectivityCellular5G        = int(netmanager.ConnectivityCellular5G)
// )

type ConnectivityState int
const (
	ConnectivityStateUnknown int = iota
	ConnectivityStateOff
	ConnectivityStateOn
)

type ConnectivityNetType int
const (
	ConnectivityNetUnknown int = iota
	ConnectivityNetNone
	ConnectivityNetWifi
	ConnectivityNetEthernet
	ConnectivityNetCellular
)

type ConnectivityCellularType int
const (
	ConnectivityCellularUnknown int = iota
	ConnectivityCellularNone
	ConnectivityCellular2G
	ConnectivityCellular3G
	ConnectivityCellular4G
	ConnectivityCellular5G
)

type ConnectivityInfo struct {
	State        ConnectivityState
	Metering     ConnectivityState
	Bluetooth    ConnectivityState
	NetType      ConnectivityNetType
	CellularType ConnectivityCellularType
}

func NewConnectivityInfo() *ConnectivityInfo {
	return &ConnectivityInfo{
		State:        ConnectivityState(ConnectivityStateUnknown),
		Metering:     ConnectivityState(ConnectivityStateUnknown),
		Bluetooth:    ConnectivityState(ConnectivityStateUnknown),
		NetType:      ConnectivityNetType(ConnectivityNetUnknown),
		CellularType: ConnectivityCellularType(ConnectivityCellularUnknown),
	}
}

func (ci *ConnectivityInfo) GetState() int                    { return int(ci.State) }
func (ci *ConnectivityInfo) GetMetering() int                 { return int(ci.Metering) }
func (ci *ConnectivityInfo) GetBluetooth() int                { return int(ci.Bluetooth) }
func (ci *ConnectivityInfo) GetNetType() int                  { return int(ci.NetType) }
func (ci *ConnectivityInfo) GetCellularType() int             { return int(ci.CellularType) }

func (ci *ConnectivityInfo) SetState(state int)               { ci.State = ConnectivityState(state) }
func (ci *ConnectivityInfo) SetMetering(metering int)         { ci.Metering = ConnectivityState(metering) }
func (ci *ConnectivityInfo) SetBluetooth(bluetooth int)       { ci.Bluetooth = ConnectivityState(bluetooth) }
func (ci *ConnectivityInfo) SetNetType(netType int)           { ci.NetType = ConnectivityNetType(netType) }
func (ci *ConnectivityInfo) SetCellularType(cellularType int) { ci.CellularType = ConnectivityCellularType(cellularType) }

type IConnectivityHandler interface {
	HandleConnectivityUpdate(connectivityInfo *ConnectivityInfo)
}

type IConnectivityDriver interface {
	GetCurrentState() *ConnectivityInfo
	RegisterHandler(handler IConnectivityHandler)
}

func (b *Bridge) HandleConnectivityUpdate(info *ConnectivityInfo) {
	b.logger.Info("connectivity update", zap.Any("info", info))

	b.currentState = info
}
