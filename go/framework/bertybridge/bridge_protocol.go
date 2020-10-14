package bertybridge

import (
	"context"
	"fmt"
	mrand "math/rand"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/core/bootstrap"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

var (
	defaultProtocolRendezVousPeers = config.BertyMobile.RendezVousPeers
	defaultProtocolBootstrap       = config.BertyMobile.Bootstrap
	defaultTracingHost             = config.BertyMobile.Tracing
	defaultSwarmAddrs              = config.BertyMobile.DefaultSwarmAddrs
	defaultAPIAddrs                = config.BertyMobile.DefaultAPIAddrs
	APIConfig                      = config.BertyMobile.APIConfig
)

var defaultBootstrapConfig = bootstrap.BootstrapConfig{
	MinPeerThreshold:  5,
	Period:            10 * time.Second,
	ConnectionTimeout: (5 * time.Second), // Perod / 3
}

const memPath = ":memory:"

type MessengerBridge struct {
	*Bridge

	logger           *zap.Logger
	loggerCleanup    func()
	node             *core.IpfsNode
	protocolService  bertyprotocol.Service
	messengerService bertymessenger.Service
	msngrDB          *gorm.DB
	notification     notification.Manager

	lifecycledriver LifeCycleDriver
	lcmanager       *lifecycle.Manager

	currentAppState int
	muAppState      sync.Mutex

	// protocol datastore
	ds             datastore.Batching
	protocolClient bertyprotocol.Client
}

type MessengerConfig struct {
	*Config

	dLogger        NativeLoggerDriver
	logFilters     string
	lc             LifeCycleDriver
	notifdriver    NotificationDriver
	swarmListeners []string
	rootDirectory  string
	tracing        bool
	tracingPrefix  string
	localDiscovery bool

	// internal
	coreAPI ipfsutil.ExtendedCoreAPI
}

func NewMessengerConfig() *MessengerConfig {
	return &MessengerConfig{
		Config: NewConfig(),
	}
}

func (pc *MessengerConfig) RootDirectory(dir string) {
	pc.rootDirectory = dir
}

func (pc *MessengerConfig) EnableTracing() {
	pc.tracing = true
}

func (pc *MessengerConfig) SetTracingPrefix(prefix string) {
	pc.tracingPrefix = prefix
}

func (pc *MessengerConfig) SetLogFilters(filters string) {
	pc.logFilters = filters
}

func (pc *MessengerConfig) LoggerDriver(dLogger NativeLoggerDriver) {
	pc.dLogger = dLogger
}

func (pc *MessengerConfig) NotificationDriver(driver NotificationDriver) {
	pc.notifdriver = driver
}

func (pc *MessengerConfig) LifeCycleDriver(lc LifeCycleDriver) {
	pc.lc = lc
}

func (pc *MessengerConfig) AddSwarmListener(laddr string) {
	pc.swarmListeners = append(pc.swarmListeners, laddr)
}

func (pc *MessengerConfig) DisableLocalDiscovery() {
	pc.localDiscovery = false
}

func NewMessengerBridge(config *MessengerConfig) (*MessengerBridge, error) {
	managerConfig := initutil.MobileParams{
		IPFSListeners:    config.swarmListeners,
		IPFSAPIListeners: []string{":3000"},
		RootDirectory:    config.rootDirectory,
		LocalDiscovery:   config.localDiscovery,
	}

	var err error
	managerConfig.Logger, managerConfig.LoggerCleanup, err = newLogger(config.logFilters, config.dLogger)
	if err != nil {
		return nil, err
	}

	// Setting up notifications
	if config.notifdriver == nil {
		managerConfig.NotificationManager = notification.NewLoggerManager(managerConfig.Logger)
	} else {
		managerConfig.NotificationManager = newNotificationManagerAdaptater(managerConfig.Logger, config.notifdriver)
	}

	// Creating the manager
	manager, err := initutil.NewFromMobile(context.Background(), managerConfig)
	if err != nil {
		return nil, err
	}

	// Fetch IPFS
	_, node, err := manager.GetLocalIPFS()
	if err != nil {
		return nil, err
	}

	// init tracing
	if config.tracing {
		shortID := fmt.Sprintf("%.6s", node.Identity.String())
		svcName := fmt.Sprintf("<%s>", shortID)
		if prefix := strings.TrimSpace(config.tracingPrefix); prefix != "" {
			svcName = fmt.Sprintf("<%s@%s>", prefix, shortID)
		}
		tracer.InitTracer(defaultTracingHost, svcName)
	}

	// setup bridge
	bridge, err := newBridge(manager)
	if err != nil {
		return nil, err
	}

	// setup messengerBridge
	var messengerBridge *MessengerBridge
	{
		logger, err := manager.GetLogger()
		if err != nil {
			return nil, err
		}
		service, err := manager.GetLocalProtocolServer()
		if err != nil {
			return nil, err
		}
		rootds, err := manager.GetRootDatastore()
		if err != nil {
			return nil, err
		}
		messenger, err := manager.GetLocalMessengerServer()
		if err != nil {
			return nil, err
		}
		db, err := manager.GetMessengerDB()
		if err != nil {
			return nil, err
		}
		protocolClient, err := manager.GetProtocolClient()
		if err != nil {
			return nil, err
		}
		notifmanager, err := manager.GetNotificationManager()
		if err != nil {
			return nil, err
		}
		messengerBridge = &MessengerBridge{
			Bridge: bridge,

			lcmanager:        manager.GetLifecycleManager(),
			logger:           logger,
			protocolService:  service,
			node:             node,
			ds:               rootds,
			messengerService: noopCloserMessengerServiceServer{messenger},
			msngrDB:          db,
			protocolClient:   noopCloserProtocolServiceClient{protocolClient},
			notification:     notifmanager,
		}
	}

	// setup lifecycle
	var lc LifeCycleDriver
	{
		if lc = config.lc; lc == nil {
			lc = newNoopLifeCycleDriver()
		}

		messengerBridge.HandleState(lc.GetCurrentState())
		messengerBridge.lifecycledriver = lc

		lc.RegisterHandler(messengerBridge)
	}

	return messengerBridge, nil
}

type noopCloserMessengerServiceServer struct {
	bertymessenger.MessengerServiceServer
}

func (noopCloserMessengerServiceServer) Close() {}

type noopCloserProtocolServiceClient struct {
	bertyprotocol.ProtocolServiceClient
}

func (noopCloserProtocolServiceClient) Close() error {
	return nil
}

var _ LifeCycleHandler = (*MessengerBridge)(nil)

func (p *MessengerBridge) HandleState(appstate int) {
	p.muAppState.Lock()
	defer p.muAppState.Unlock()

	if appstate != p.currentAppState {
		switch appstate {
		case AppStateBackground:
			p.lcmanager.UpdateState(bertymessenger.StateInactive)
			p.logger.Info("app is in Background State")
		case AppStateActive:
			p.lcmanager.UpdateState(bertymessenger.StateActive)
			p.logger.Info("app is in Active State")
			if p.node != nil {
				if err := p.node.Bootstrap(defaultBootstrapConfig); err != nil {
					p.logger.Warn("Unable to boostrap node", zap.Error(err))
				}
			}
		case AppStateInactive:
			p.lcmanager.UpdateState(bertymessenger.StateInactive)
			p.logger.Info("app is in Inactive State")
		}
		p.currentAppState = appstate
	}
}

var backgroundCounter int32

func (p *MessengerBridge) HandleTask() LifeCycleBackgroundTask {
	return NewBackgroundTask(p.logger, func(ctx context.Context) error {
		p.logger.Info("starting background task")

		counter := atomic.AddInt32(&backgroundCounter, 1)
		tnow := time.Now()

		n := time.Duration(mrand.Intn(60) + 5) // nolint:gosec
		ctx, cancel := context.WithTimeout(ctx, time.Second*n)
		defer cancel()

		if err := p.notification.Notify(&notification.Notification{
			Title: fmt.Sprintf("GoBackgroundTask #%d", counter),
			Body:  "started",
		}); err != nil {
			p.logger.Error("unable to notify", zap.Error(err))
		}

		<-ctx.Done()

		if err := p.notification.Notify(&notification.Notification{
			Title: fmt.Sprintf("GoBackgroundTask #%d", counter),
			Body:  fmt.Sprintf("ended (duration: %s)", time.Since(tnow).Truncate(time.Second)),
		}); err != nil {
			p.logger.Error("unable to notify", zap.Error(err))
		}

		return nil
	})
}

func (p *MessengerBridge) WillTerminate() {
	if err := p.Close(); err != nil {
		errs := multierr.Errors(err)
		errFields := make([]zap.Field, len(errs))
		for i, err := range errs {
			errFields[i] = zap.Error(err)
		}
		p.logger.Error("unable to close messenger properly", errFields...)
	} else {
		p.logger.Info("messenger has been closed")
	}
}

func (p *MessengerBridge) Close() error {
	var errs error

	// close bridge
	if p.Bridge != nil {
		if err := p.Bridge.Close(); err != nil {
			errs = multierr.Append(errs, fmt.Errorf("unable to close grpc bridge: %s", err))
		}
	}

	// close messenger
	if p.messengerService != nil {
		p.messengerService.Close()
	}

	// protocol client
	if err := p.protocolClient.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close protocol client: %s", err))
	}

	// close protocol
	if err := p.protocolService.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close protocol service: %s", err))
	}

	if p.node != nil {
		if err := p.node.Close(); err != nil {
			errs = multierr.Append(errs, fmt.Errorf("unable to close ipfs node: %s", err))
		}
	}

	if err := p.ds.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close datastore: %s", err))
	}

	// closing messenger db
	sqlDB, err := p.msngrDB.DB()
	if err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to get messenger db: %s", err))
	} else if err := sqlDB.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close messenger db: %s", err))
	}

	if p.loggerCleanup != nil {
		p.loggerCleanup()
	}

	return errs
}
