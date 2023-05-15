package bertyaccount

import (
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sync"

	_ "github.com/glebarez/go-sqlite"
	"github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ds-sql/sqlite"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"golang.org/x/text/language"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/migrations"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/pkg/androidnearby"
	"berty.tech/weshnet/pkg/lifecycle"
	"berty.tech/weshnet/pkg/logutil"
	mc "berty.tech/weshnet/pkg/multipeer-connectivity-driver"
	"berty.tech/weshnet/pkg/netmanager"
	"berty.tech/weshnet/pkg/protocoltypes"
	proximity "berty.tech/weshnet/pkg/proximitytransport"
	"berty.tech/weshnet/pkg/tyber"
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
	SharedRootDirectory string
	AppRootDirectory    string

	MDNSLocker            sync.Locker
	NetManager            *netmanager.NetManager
	Languages             []language.Tag
	ServiceClientRegister bertybridge.ServiceClientRegister
	LifecycleManager      *lifecycle.Manager
	NotificationManager   notification.Manager
	BleDriver             proximity.ProximityDriver
	NBDriver              proximity.ProximityDriver
	Keystore              accountutils.NativeKeystore
	Logger                *zap.Logger
	ServiceListeners      string
}

type service struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc

	mdnslocker   sync.Locker
	netmanager   *netmanager.NetManager
	notifManager notification.Manager
	logger       *zap.Logger

	appRootDir        string
	sharedRootDir     string
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
	serviceListeners  string
	openedAccountID   string

	accounttypes.UnimplementedAccountServiceServer
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

	if o.SharedRootDirectory == "" {
		o.SharedRootDirectory = o.AppRootDirectory
	}

	if o.NetManager == nil {
		o.NetManager = netmanager.NewNoopNetManager()
	}
}

func NewService(opts *Options) (_ Service, err error) {
	rootCtx, rootCancelCtx := context.WithCancel(context.Background())

	var s *service
	endSection := tyber.SimpleSection(rootCtx, opts.Logger, "Initializing AccountService")
	defer func() {
		endSection(err, tyber.WithDetail("SharedRootDir", s.sharedRootDir), tyber.WithDetail("AppRootDir", s.appRootDir))
	}()

	opts.applyDefault()
	s = &service{
		mdnslocker:        opts.MDNSLocker,
		netmanager:        opts.NetManager,
		languages:         opts.Languages,
		appRootDir:        opts.AppRootDirectory,
		sharedRootDir:     opts.SharedRootDirectory,
		rootCtx:           rootCtx,
		rootCancel:        rootCancelCtx,
		logger:            opts.Logger,
		lifecycleManager:  opts.LifecycleManager,
		notifManager:      opts.NotificationManager,
		sclients:          opts.ServiceClientRegister,
		bleDriver:         opts.BleDriver,
		nbDriver:          opts.NBDriver,
		nativeKeystore:    opts.Keystore,
		devicePushKeyPath: path.Join(opts.SharedRootDirectory, accountutils.DefaultPushKeyFilename),
		serviceListeners:  opts.ServiceListeners,
	}

	go s.handleLifecycle(rootCtx)

	// override grpc logger before manager start to avoid race condition
	logutil.ReplaceGRPCLogger(opts.Logger.Named("grpc"))

	if err := migrations.MigrateToLatest(migrations.Options{
		AppDir:         s.appRootDir,
		SharedDir:      s.sharedRootDir,
		Logger:         s.logger,
		NativeKeystore: s.nativeKeystore,
	}); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// init app storage
	dbPath := filepath.Join(s.appRootDir, "app.sqlite")
	if err := os.MkdirAll(s.appRootDir, 0o700); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// get SQLite version

	// appDatastore, err := encrepo.NewSQLCipherDatastore("sqlite3", dbPath, "data", storageKey, sqldsOpts)
	// if err != nil {
	// 	return nil, errcode.ErrDBOpen.Wrap(err)
	// }

	dsn := fmt.Sprintf("%s?_jounal_mode=WAL", dbPath)
	sqlopts := sqlite.Options{
		Driver:   "sqlite",
		DSN:      dsn,
		Table:    "ipfsrepo",
		NoCreate: false,
	}

	ds, err := sqlopts.Create()
	if err != nil {
		return nil, fmt.Errorf("unable to create sql ds store: %w", err)
	}

	s.appStorage = ds
	return s, nil
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
				Bootstrap:                    []string{initutil.KeywordDefault},
				AndroidNearby:                androidNearby,
				DHT:                          accounttypes.NetworkConfig_DHTClient,
				AppleMultipeerConnectivity:   appleMC,
				BluetoothLE:                  bluetoothLE,
				MDNS:                         accounttypes.NetworkConfig_Enabled,
				Rendezvous:                   []string{initutil.KeywordDefault},
				Tor:                          accounttypes.NetworkConfig_TorOptional,
				StaticRelay:                  []string{initutil.KeywordDefault},
				ShowDefaultServices:          accounttypes.NetworkConfig_Enabled,
				AllowUnsecureGRPCConnections: accounttypes.NetworkConfig_Disabled,
			},
		}, nil
	}

	return &accounttypes.NetworkConfigGetPreset_Reply{
		Config: &accounttypes.NetworkConfig{
			Bootstrap:                    []string{initutil.KeywordNone},
			AndroidNearby:                accounttypes.NetworkConfig_Disabled,
			DHT:                          accounttypes.NetworkConfig_DHTDisabled,
			AppleMultipeerConnectivity:   accounttypes.NetworkConfig_Disabled,
			BluetoothLE:                  accounttypes.NetworkConfig_Disabled,
			MDNS:                         accounttypes.NetworkConfig_Disabled,
			Rendezvous:                   []string{initutil.KeywordNone},
			Tor:                          accounttypes.NetworkConfig_TorDisabled,
			StaticRelay:                  []string{initutil.KeywordNone},
			ShowDefaultServices:          accounttypes.NetworkConfig_Disabled,
			AllowUnsecureGRPCConnections: accounttypes.NetworkConfig_Disabled,
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
