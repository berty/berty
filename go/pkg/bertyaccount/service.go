package bertyaccount

import (
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sync"

	"github.com/ipfs/go-datastore"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"golang.org/x/text/language"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/androidnearby"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
	encrepo "berty.tech/go-ipfs-repo-encrypted"
)

// Servicex is AccountServiceServer
var _ accounttypes.AccountServiceServer = (*service)(nil)

type Service interface {
	accounttypes.AccountServiceServer

	// SetLanguage set the use language for translate
	SetPreferredLanguages(tags ...language.Tag)

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

	MDNSLocker            sync.Locker
	Languages             []language.Tag
	ServiceClientRegister bertybridge.ServiceClientRegister
	LifecycleManager      *lifecycle.Manager
	NotificationManager   notification.Manager
	BleDriver             proximity.ProximityDriver
	NBDriver              proximity.ProximityDriver
	Keystore              accountutils.NativeKeystore
	Logger                *zap.Logger
	DisableLogging        bool
}

type service struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc

	mdnslocker     sync.Locker
	notifManager   notification.Manager
	logger         *zap.Logger
	disableLogging bool

	rootdir           string
	languages         []language.Tag
	muService         sync.RWMutex
	initManager       *initutil.Manager
	lifecycleManager  *lifecycle.Manager
	sclients          bertybridge.ServiceClientRegister
	bleDriver         proximity.ProximityDriver
	nbDriver          proximity.ProximityDriver
	devicePushKeyPath string
	pushPlatformToken *protocoltypes.PushServiceReceiver
	accountData       *accounttypes.AccountMetadata
	nativeKeystore    accountutils.NativeKeystore
	appStorage        datastore.Datastore
}

func (o *Options) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}

	if o.Languages == nil {
		o.Languages = []language.Tag{}
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

	var s *service
	endSection := tyber.SimpleSection(rootCtx, opts.Logger, "Initializing AccountService")
	defer func() { endSection(err, tyber.WithDetail("RootDir", s.rootdir)) }()

	opts.applyDefault()
	s = &service{
		mdnslocker:        opts.MDNSLocker,
		languages:         opts.Languages,
		rootdir:           opts.RootDirectory,
		rootCtx:           rootCtx,
		rootCancel:        rootCancelCtx,
		logger:            opts.Logger,
		disableLogging:    opts.DisableLogging,
		lifecycleManager:  opts.LifecycleManager,
		notifManager:      opts.NotificationManager,
		sclients:          opts.ServiceClientRegister,
		bleDriver:         opts.BleDriver,
		nbDriver:          opts.NBDriver,
		nativeKeystore:    opts.Keystore,
		devicePushKeyPath: path.Join(opts.RootDirectory, accountutils.DefaultPushKeyFilename),
	}

	go s.handleLifecycle(rootCtx)

	// override grpc logger before manager start to avoid race condition
	initutil.ReplaceGRPCLogger(opts.Logger.Named("grpc"))

	// init app storage
	dbPath := filepath.Join(s.rootdir, "app.sqlite")
	if err := os.MkdirAll(s.rootdir, 0o700); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	storageKey := ([]byte)(nil)
	if s.nativeKeystore != nil {
		storageKey, err = accountutils.GetOrCreateMasterStorageKey(s.nativeKeystore)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}
	appDatastore, err := encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "data", storageKey)
	if err != nil {
		return nil, errcode.ErrDBOpen.Wrap(err)
	}
	s.appStorage = encrepo.NewNamespacedDatastore(appDatastore, datastore.NewKey("app-storage"))

	return s, nil
}

func (s *service) NetworkConfigGetPreset(ctx context.Context, req *accounttypes.NetworkConfigGetPreset_Request) (*accounttypes.NetworkConfigGetPreset_Reply, error) {
	if req.Preset == messengertypes.NetworkConfig_NetPresetPerformance || req.Preset == messengertypes.NetworkConfig_NetPresetUndefined {
		bluetoothLE := messengertypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission {
			bluetoothLE = messengertypes.NetworkConfig_Enabled
		}

		androidNearby := messengertypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission && androidnearby.Supported {
			androidNearby = messengertypes.NetworkConfig_Enabled
		}

		appleMC := messengertypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission && mc.Supported {
			appleMC = messengertypes.NetworkConfig_Enabled
		}

		return &accounttypes.NetworkConfigGetPreset_Reply{
			Config: &messengertypes.NetworkConfig{
				Bootstrap:                  []string{initutil.KeywordDefault},
				AndroidNearby:              androidNearby,
				DHT:                        messengertypes.NetworkConfig_DHTClient,
				AppleMultipeerConnectivity: appleMC,
				BluetoothLE:                bluetoothLE,
				MDNS:                       messengertypes.NetworkConfig_Enabled,
				Rendezvous:                 []string{initutil.KeywordDefault},
				Tor:                        messengertypes.NetworkConfig_TorOptional,
				StaticRelay:                []string{initutil.KeywordDefault},
				ShowDefaultServices:        messengertypes.NetworkConfig_Enabled,
			},
		}, nil
	}

	return &accounttypes.NetworkConfigGetPreset_Reply{
		Config: &messengertypes.NetworkConfig{
			Bootstrap:                  []string{initutil.KeywordNone},
			AndroidNearby:              messengertypes.NetworkConfig_Disabled,
			DHT:                        messengertypes.NetworkConfig_DHTDisabled,
			AppleMultipeerConnectivity: messengertypes.NetworkConfig_Disabled,
			BluetoothLE:                messengertypes.NetworkConfig_Disabled,
			MDNS:                       messengertypes.NetworkConfig_Disabled,
			Rendezvous:                 []string{initutil.KeywordNone},
			Tor:                        messengertypes.NetworkConfig_TorDisabled,
			StaticRelay:                []string{initutil.KeywordNone},
			ShowDefaultServices:        messengertypes.NetworkConfig_Disabled,
		},
	}, nil
}

func (s *service) SetPreferredLanguages(tags ...language.Tag) {
	s.languages = tags
}

func (s *service) Close() (err error) {
	endSection := tyber.SimpleSection(tyber.ContextWithoutTraceID(s.rootCtx), s.logger, "Closing AccountService")
	defer func() { endSection(err) }()

	s.muService.Lock()
	defer s.muService.Unlock()

	err = s.appStorage.Close()

	s.rootCancel()
	if s.initManager != nil {
		err = multierr.Append(err, s.initManager.Close(nil))
	}

	return err
}

func (s *service) getInitManager() (m *initutil.Manager, err error) {
	s.muService.RLock()
	if m = s.initManager; m == nil {
		err = fmt.Errorf("init manager not initialized")
	}
	s.muService.RUnlock()
	return
}
