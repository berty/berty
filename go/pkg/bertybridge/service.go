package bertybridge

import (
	"context"
	"flag"
	fmt "fmt"
	"sync"

	"github.com/ipfs/go-ipfs/core"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
)

// Servicex is BridgeServiceServer
var _ BridgeServiceServer = (*service)(nil)

type Service interface {
	BridgeServiceServer

	Close() error
}

type service struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc

	streams   map[string]*grpcutil.LazyStream
	muStreams sync.RWMutex

	notifManager notification.Manager
	logger       *zap.Logger

	// initManager
	// lifecycleDriver  LifeCycleDriver

	rootdir          string
	muService        sync.RWMutex
	initManager      *initutil.Manager
	notification     notification.Manager
	lifecycleManager *lifecycle.Manager
	grpcServer       *grpc.Server
	node             *core.IpfsNode
	servicesClient   *grpcutil.LazyClient
}

type Options struct {
	RootDirectory       string
	LifecycleManager    *lifecycle.Manager
	NotificationManager notification.Manager
	Logger              *zap.Logger
}

func (o *Options) applyDefault() error {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}

	if o.LifecycleManager == nil {
		o.LifecycleManager = lifecycle.NewManager(lifecycle.State(0))
	}

	if o.NotificationManager == nil {
		o.NotificationManager = notification.NewLoggerManager(o.Logger)
	}

	return nil
}

func NewService(opts *Options) (Service, error) {
	if err := opts.applyDefault(); err != nil {
		return nil, err
	}

	rootCtx, rootCancelCtx := context.WithCancel(context.Background())
	s := &service{
		rootdir:          opts.RootDirectory,
		rootCtx:          rootCtx,
		rootCancel:       rootCancelCtx,
		logger:           opts.Logger,
		lifecycleManager: opts.LifecycleManager,
		notifManager:     opts.NotificationManager,
		streams:          make(map[string]*grpcutil.LazyStream),
	}

	go s.handleLifecycle(rootCtx)

	return s, nil
}

func (s *service) Close() error {
	s.muService.Lock()
	defer s.muService.Unlock()

	s.rootCancel()
	if s.initManager != nil {
		return s.initManager.Close()
	}

	return nil
}

func (s *service) handleLifecycle(ctx context.Context) {
	var currentState lifecycle.State
	for {
		currentState = s.lifecycleManager.GetCurrentState()
		if !s.lifecycleManager.WaitForStateChange(ctx, currentState) {
			return
		}
	}
}

func (s *service) getServiceClient() (c *grpcutil.LazyClient, err error) {
	s.muService.RLock()
	if c = s.servicesClient; c == nil {
		err = fmt.Errorf("service client not initialized")
	}
	s.muService.RUnlock()
	return
}

func (s *service) getInitManager() (m *initutil.Manager, err error) {
	s.muService.RLock()
	if m = s.initManager; m == nil {
		err = fmt.Errorf("init manager not initialized")
	}
	s.muService.RUnlock()
	return
}

func (s *service) newManager(args ...string) (*initutil.Manager, error) {
	manager := initutil.Manager{}

	// configure flagset options
	fs := flag.NewFlagSet("bridge", flag.ContinueOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalMessengerServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	// manager.SetupMetricsFlags(fs)
	err := fs.Parse(args)
	if err != nil {
		return nil, err
	}
	if len(fs.Args()) > 0 {
		return nil, fmt.Errorf("invalid CLI args, should only have flags")
	}

	// minimal requirements
	{
		// here we can add various checks that return an error early if some settings are invalid or missing
	}

	manager.SetLogger(s.logger)
	s.logger.Info("init", zap.Any("manager", &manager))

	manager.SetNotificationManager(s.notifManager)
	return &manager, nil
}
