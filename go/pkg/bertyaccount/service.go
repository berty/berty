package bertyaccount

import (
	"context"
	fmt "fmt"
	"sync"

	"github.com/ipfs/go-ipfs/core"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
)

// Servicex is AccountServiceServer
var _ AccountServiceServer = (*service)(nil)

type Service interface {
	AccountServiceServer

	// WakeUp should be used for background task or similar task
	WakeUp(ctx context.Context) error

	// Close the service
	Close() error
}

type service struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc

	streams   map[string]*grpcutil.LazyStream
	muStreams sync.RWMutex

	notifManager notification.Manager
	logger       *zap.Logger

	rootdir          string
	muService        sync.RWMutex
	initManager      *initutil.Manager
	lifecycleManager *lifecycle.Manager
	node             *core.IpfsNode
	servicesClient   *grpcutil.LazyClient
}

type Options struct {
	RootDirectory       string
	LifecycleManager    *lifecycle.Manager
	NotificationManager notification.Manager
	Logger              *zap.Logger
}

func (o *Options) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}

	if o.LifecycleManager == nil {
		o.LifecycleManager = lifecycle.NewManager(lifecycle.State(0))
	}

	if o.NotificationManager == nil {
		o.NotificationManager = notification.NewLoggerManager(o.Logger)
	}
}

func NewService(opts *Options) (Service, error) {
	opts.applyDefault()

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
