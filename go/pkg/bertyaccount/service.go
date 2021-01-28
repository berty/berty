package bertyaccount

import (
	"context"
	"fmt"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
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

type Options struct {
	RootDirectory string

	ServiceClientRegister bertybridge.ServiceClientRegister
	LifecycleManager      *lifecycle.Manager
	NotificationManager   notification.Manager
	Logger                *zap.Logger
	DevicePushKeyPath     string
}

type service struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc

	notifManager notification.Manager
	logger       *zap.Logger

	rootdir           string
	muService         sync.RWMutex
	initManager       *initutil.Manager
	lifecycleManager  *lifecycle.Manager
	sclients          bertybridge.ServiceClientRegister
	devicePushKeyPath string
	pushPlatformToken *protocoltypes.PushServiceReceiver
}

func (o *Options) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}

	if o.ServiceClientRegister == nil {
		o.ServiceClientRegister = bertybridge.NewNoopServiceClientRegister()
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
		rootdir:           opts.RootDirectory,
		rootCtx:           rootCtx,
		rootCancel:        rootCancelCtx,
		logger:            opts.Logger,
		lifecycleManager:  opts.LifecycleManager,
		notifManager:      opts.NotificationManager,
		sclients:          opts.ServiceClientRegister,
		devicePushKeyPath: opts.DevicePushKeyPath,
	}

	go s.handleLifecycle(rootCtx)

	// override grpc logger before manager start to avoid race condition
	initutil.ReplaceGRPCLogger(opts.Logger.Named("grpc"))

	return s, nil
}

func (s *service) Close() error {
	s.muService.Lock()
	defer s.muService.Unlock()

	s.rootCancel()
	if s.initManager != nil {
		return s.initManager.Close(nil)
	}

	return nil
}

func (s *service) getInitManager() (m *initutil.Manager, err error) {
	s.muService.RLock()
	if m = s.initManager; m == nil {
		err = fmt.Errorf("init manager not initialized")
	}
	s.muService.RUnlock()
	return
}
