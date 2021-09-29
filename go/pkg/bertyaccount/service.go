package bertyaccount

import (
	"context"
	"fmt"
	"path"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/androidnearby"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

// Servicex is AccountServiceServer
var _ accounttypes.AccountServiceServer = (*service)(nil)

type Service interface {
	accounttypes.AccountServiceServer

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
	accountData       *accounttypes.AccountMetadata
}

func (s *service) NetworkConfigGetPreset(ctx context.Context, req *accounttypes.NetworkConfigGetPreset_Request) (*accounttypes.NetworkConfigGetPreset_Reply, error) {
	if req.Preset == accounttypes.NetworkConfigPreset_NetPresetPerformance || req.Preset == accounttypes.NetworkConfigPreset_NetPresetUndefined {
		bluetoothLE := accounttypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission {
			bluetoothLE = accounttypes.NetworkConfig_Enabled
		}

		androidNearby := accounttypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission && androidnearby.Supported {
			androidNearby = accounttypes.NetworkConfig_Enabled
		}

		appleMC := accounttypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission && mc.Supported {
			appleMC = accounttypes.NetworkConfig_Enabled
		}

		return &accounttypes.NetworkConfigGetPreset_Reply{
			Config: &accounttypes.NetworkConfig{
				Bootstrap:                  []string{initutil.KeywordDefault},
				AndroidNearby:              androidNearby,
				DHT:                        accounttypes.NetworkConfig_DHTClient,
				AppleMultipeerConnectivity: appleMC,
				BluetoothLE:                bluetoothLE,
				MDNS:                       accounttypes.NetworkConfig_Enabled,
				Rendezvous:                 []string{initutil.KeywordDefault},
				Tor:                        accounttypes.NetworkConfig_TorOptional,
				StaticRelay:                []string{initutil.KeywordDefault},
				ShowDefaultServices:        accounttypes.NetworkConfig_Enabled,
			},
		}, nil
	}

	return &accounttypes.NetworkConfigGetPreset_Reply{
		Config: &accounttypes.NetworkConfig{
			Bootstrap:                  []string{initutil.KeywordNone},
			AndroidNearby:              accounttypes.NetworkConfig_Disabled,
			DHT:                        accounttypes.NetworkConfig_DHTDisabled,
			AppleMultipeerConnectivity: accounttypes.NetworkConfig_Disabled,
			BluetoothLE:                accounttypes.NetworkConfig_Disabled,
			MDNS:                       accounttypes.NetworkConfig_Disabled,
			Rendezvous:                 []string{initutil.KeywordNone},
			Tor:                        accounttypes.NetworkConfig_TorDisabled,
			StaticRelay:                []string{initutil.KeywordNone},
			ShowDefaultServices:        accounttypes.NetworkConfig_Disabled,
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
		devicePushKeyPath: path.Join(opts.RootDirectory, accountutils.DefaultPushKeyFilename),
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
