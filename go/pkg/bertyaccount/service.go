package bertyaccount

import (
	"context"
	"fmt"
	"path"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/androidnearby"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

// Servicex is AccountServiceServer
var _ AccountServiceServer = (*service)(nil)

type Service interface {
	AccountServiceServer

	// WakeUp should be used for background task or similar task.
	WakeUp(ctx context.Context) error

	// Close the service.
	Close() error

	// GetMessengerClient returns the Messenger Client of the actual Berty account if there is one selected.
	GetMessengerClient() (messengertypes.MessengerServiceClient, error)

	// GetProtocolClient returns the Protocol Client of the actual Berty account if there is one selected.
	GetProtocolClient() (protocoltypes.ProtocolServiceClient, error)
}

type Options struct {
	RootDirectory string

	ServiceClientRegister bertybridge.ServiceClientRegister
	LifecycleManager      *lifecycle.Manager
	NotificationManager   notification.Manager
	BleDriver             proximity.ProximityDriver
	NBDriver              proximity.ProximityDriver
	Logger                *zap.Logger
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
	bleDriver         proximity.ProximityDriver
	nbDriver          proximity.ProximityDriver
	devicePushKeyPath string
	pushPlatformToken *protocoltypes.PushServiceReceiver
}

func (s *service) NetworkConfigGetPreset(ctx context.Context, req *NetworkConfigGetPreset_Request) (*NetworkConfigGetPreset_Reply, error) {
	if req.Preset == NetworkConfigPreset_NetPresetPerformance || req.Preset == NetworkConfigPreset_NetPresetUndefined {
		bluetoothLE := NetworkConfig_Disabled
		if req.HasBluetoothPermission {
			bluetoothLE = NetworkConfig_Enabled
		}

		androidNearby := NetworkConfig_Disabled
		if req.HasBluetoothPermission && androidnearby.Supported {
			androidNearby = NetworkConfig_Enabled
		}

		appleMC := NetworkConfig_Disabled
		if req.HasBluetoothPermission && mc.Supported {
			appleMC = NetworkConfig_Enabled
		}

		return &NetworkConfigGetPreset_Reply{
			Config: &NetworkConfig{
				Bootstrap:                  []string{initutil.KeywordDefault},
				AndroidNearby:              androidNearby,
				DHT:                        NetworkConfig_DHTClient,
				AppleMultipeerConnectivity: appleMC,
				BluetoothLE:                bluetoothLE,
				MDNS:                       NetworkConfig_Enabled,
				Rendezvous:                 []string{initutil.KeywordDefault},
				Tor:                        NetworkConfig_TorOptional,
				StaticRelay:                []string{initutil.KeywordDefault},
				ShowDefaultServices:        NetworkConfig_Enabled,
			},
		}, nil
	}

	return &NetworkConfigGetPreset_Reply{
		Config: &NetworkConfig{
			Bootstrap:                  []string{initutil.KeywordNone},
			AndroidNearby:              NetworkConfig_Disabled,
			DHT:                        NetworkConfig_DHTDisabled,
			AppleMultipeerConnectivity: NetworkConfig_Disabled,
			BluetoothLE:                NetworkConfig_Disabled,
			MDNS:                       NetworkConfig_Disabled,
			Rendezvous:                 []string{initutil.KeywordNone},
			Tor:                        NetworkConfig_TorDisabled,
			StaticRelay:                []string{initutil.KeywordNone},
			ShowDefaultServices:        NetworkConfig_Disabled,
		},
	}, nil
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

func NewService(opts *Options) (_ Service, err error) {
	rootCtx, rootCancelCtx := context.WithCancel(context.Background())

	endSection := tyber.SimpleSection(rootCtx, opts.Logger, "Initializing AccountService")
	defer func() { endSection(err) }()

	opts.applyDefault()
	s := &service{
		rootdir:           opts.RootDirectory,
		rootCtx:           rootCtx,
		rootCancel:        rootCancelCtx,
		logger:            opts.Logger,
		lifecycleManager:  opts.LifecycleManager,
		notifManager:      opts.NotificationManager,
		sclients:          opts.ServiceClientRegister,
		bleDriver:         opts.BleDriver,
		nbDriver:          opts.NBDriver,
		devicePushKeyPath: path.Join(opts.RootDirectory, initutil.DefaultPushKeyFilename),
	}

	go s.handleLifecycle(rootCtx)

	// override grpc logger before manager start to avoid race condition
	initutil.ReplaceGRPCLogger(opts.Logger.Named("grpc"))

	return s, nil
}

func (s *service) Close() (err error) {
	endSection := tyber.SimpleSection(tyber.ContextWithoutTraceID(s.rootCtx), s.logger, "Closing AccountService")
	defer func() { endSection(err) }()

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
