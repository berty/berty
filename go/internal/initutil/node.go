package initutil

import (
	"context"
	"crypto/ed25519"
	"encoding/base64"
	"flag"
	"fmt"
	"os"
	"os/user"
	"strings"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const (
	PerformancePreset = "performance"
	AnonymityPreset   = "anonymity"
	VolatilePreset    = "volatile"

	TorDisabled = "disabled"
	TorOptional = "optional"
	TorRequired = "required"
)

func (m *Manager) SetupLocalProtocolServerFlags(fs *flag.FlagSet) {
	m.Node.Protocol.requiredByClient = true
	fs.StringVar(&m.Node.Protocol.PushPlatformToken, "node.default-push-token", "", "base 64 encoded default platform push token")
	m.SetupDatastoreFlags(fs)
	m.SetupLocalIPFSFlags(fs)
	// p2p.remote-ipfs
}

func (m *Manager) SetupProtocolAuth(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.Protocol.AuthSecret, "node.auth-secret", "", "Protocol API Authentication Secret (base64 encoded)")
	fs.StringVar(&m.Node.Protocol.AuthPublicKey, "node.auth-pk", "", "Protocol API Authentication Public Key (base64 encoded)")
}

func (m *Manager) SetupEmptyGRPCListenersFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.GRPC.Listeners, "node.listeners", "", "gRPC API listeners")
}

func (m *Manager) SetupDefaultGRPCListenersFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.GRPC.Listeners, "node.listeners", "/ip4/127.0.0.1/tcp/9091/grpc", "gRPC API listeners")
}

func (m *Manager) SetupPresetFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.Preset, "preset", "", "applies various default values, see ADVANCED section below")
	m.longHelp = append(m.longHelp, [2]string{
		"-preset=" + PerformancePreset,
		"better performance: current development defaults",
	}, [2]string{
		"-preset=" + AnonymityPreset,
		"better privacy: -tor.mode=" + TorRequired + " -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false",
	}, [2]string{
		"-preset=" + VolatilePreset,
		"similar to " + PerformancePreset + ` but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""`,
	})
}

func (m *Manager) DisableIPFSNetwork() {
	if m.Node.Protocol.ipfsNode != nil {
		panic("calling DisableIPFSNetwork, but IPFS is already initialized")
	}
	m.Node.Protocol.DisableIPFSNetwork = true
}

func (m *Manager) SetupRemoteNodeFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.GRPC.RemoteAddr, "node.remote-addr", "", "remote Berty gRPC API address")
}

func (m *Manager) SetupLocalMessengerServerFlags(fs *flag.FlagSet) {
	m.Node.Messenger.requiredByClient = true
	m.SetupLocalProtocolServerFlags(fs)
	m.SetupNotificationManagerFlags(fs)
	fs.StringVar(&m.Node.Messenger.ExportPathToRestore, "node.restore-export-path", "", "inits node from a specified export path")
	fs.BoolVar(&m.Node.Messenger.RebuildSqlite, "node.rebuild-db", false, "reconstruct messenger DB from OrbitDB logs")
	fs.BoolVar(&m.Node.Messenger.DisableGroupMonitor, "node.disable-group-monitor", false, "disable group monitoring")
	fs.StringVar(&m.Node.Messenger.DisplayName, "node.display-name", safeDefaultDisplayName(), "display name")
	// node.db-opts // see https://github.com/mattn/go-sqlite3#connection-string
}

func (m *Manager) applyPreset() error {
	switch m.Node.Preset {
	case "":
		// noop
	case PerformancePreset:
		// will do later
	case AnonymityPreset:
		// Force tor in this mode
		m.Node.Protocol.Tor.Mode = TorRequired
		// FIXME: raise an error if tor is not available on the node

		// Disable proximity communications
		m.Node.Protocol.MDNS = false
		m.Node.Protocol.MultipeerConnectivity = false
		m.Node.Protocol.Ble.Enable = false
		m.Node.Protocol.Nearby.Enable = false
	case VolatilePreset:
		m.Datastore.InMemory = true
		m.Node.Protocol.SwarmListeners = ""
		m.Node.Protocol.IPFSAPIListeners = ""
		m.Node.Protocol.IPFSWebUIListener = ""
	default:
		return fmt.Errorf("unknown preset: %q", m.Node.Preset)
	}
	return nil
}

func (m *Manager) GetLocalProtocolServer() (bertyprotocol.Service, error) {
	defer m.prepareForGetter()()

	if m.getContext().Err() != nil {
		return nil, m.getContext().Err()
	}
	return m.getLocalProtocolServer()
}

func (m *Manager) getPushSecretKey() (*[cryptoutil.KeySize]byte, error) {
	pushKey := &[cryptoutil.KeySize]byte{}
	if m.Node.Protocol.DevicePushKeyPath != "" {
		var err error

		_, pushKey, err = accountutils.GetDevicePushKeyForPath(m.Node.Protocol.DevicePushKeyPath, true)
		if err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	return pushKey, nil
}

func (m *Manager) getLocalProtocolServer() (bertyprotocol.Service, error) {
	if m.Node.Protocol.server != nil {
		return m.Node.Protocol.server, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	rootDS, err := m.getRootDatastore()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	grpcServer, gatewayMux, err := m.getGRPCServer()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	_, _, err = m.getLocalIPFS()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	odb, err := m.getOrbitDB()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// protocol service
	{
		var (
			deviceDS = ipfsutil.NewDatastoreKeystore(datastoreutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
			deviceKS = cryptoutil.NewDeviceKeystore(deviceDS)
		)

		pushKey, err := m.getPushSecretKey()
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// initialize new protocol client
		opts := bertyprotocol.Opts{
			Host:           m.Node.Protocol.ipfsNode.PeerHost,
			PubSub:         m.Node.Protocol.pubsub,
			TinderDriver:   m.Node.Protocol.discovery,
			IpfsCoreAPI:    m.Node.Protocol.ipfsAPI,
			Logger:         logger,
			RootDatastore:  rootDS,
			DeviceKeystore: deviceKS,
			OrbitDB:        odb,
			PushKey:        pushKey,
		}

		m.Node.Protocol.server, err = bertyprotocol.New(m.getContext(), opts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// register grpc service
		protocoltypes.RegisterProtocolServiceServer(grpcServer, m.Node.Protocol.server)
		if err := protocoltypes.RegisterProtocolServiceHandlerServer(m.getContext(), gatewayMux, m.Node.Protocol.server); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	m.initLogger.Debug("protocol server initialized and cached")
	return m.Node.Protocol.server, nil
}

func (m *Manager) GetGRPCClientConn() (*grpc.ClientConn, error) {
	defer m.prepareForGetter()()

	return m.getGRPCClientConn()
}

func (m *Manager) getGRPCClientConn() (*grpc.ClientConn, error) {
	m.applyDefaults()

	if m.Node.GRPC.clientConn != nil {
		return m.Node.GRPC.clientConn, nil
	}

	clientOpts := []grpc.DialOption(nil)

	if m.Node.GRPC.RemoteAddr != "" {
		clientOpts = append(clientOpts, grpc.WithInsecure()) // make a flag for this?
		cc, err := grpc.Dial(m.Node.GRPC.RemoteAddr, clientOpts...)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
		m.Node.GRPC.clientConn = cc
	} else {
		// ensure protocol and messenger are initialized
		{
			// restore store if provided
			if err := m.restoreMessengerDataFromExport(); err != nil {
				return nil, errcode.TODO.Wrap(err)
			}

			if m.Node.Protocol.requiredByClient {
				_, err := m.getLocalProtocolServer()
				if err != nil {
					return nil, errcode.TODO.Wrap(err)
				}
			}

			if m.Node.Messenger.requiredByClient {
				_, err := m.getLocalMessengerServer()
				if err != nil {
					return nil, errcode.TODO.Wrap(err)
				}
			}
		}

		// gRPC server
		serverOpts := []grpc.ServerOption{} // FIXME: tracing
		grpcServer := grpc.NewServer(serverOpts...)

		// buffer-based client conn
		bl := grpcutil.NewBufListener(m.getContext(), 256*1024)
		cc, err := bl.NewClientConn(clientOpts...)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		if m.Node.Protocol.server != nil {
			protocoltypes.RegisterProtocolServiceServer(grpcServer, m.Node.Protocol.server)
		}
		if m.Node.Messenger.server != nil {
			messengertypes.RegisterMessengerServiceServer(grpcServer, m.Node.Messenger.server)
		}

		m.Node.GRPC.bufServerListener = bl
		m.Node.GRPC.bufServer = grpcServer
		m.Node.GRPC.clientConn = cc
		go func() {
			err := m.Node.GRPC.bufServer.Serve(bl)
			if err != nil && !(err == grpc.ErrServerStopped || err.Error() == "closed") {
				panic(err)
			}
		}()
	}

	m.initLogger.Debug("gRPC client conn initialized and cached")
	return m.Node.GRPC.clientConn, nil
}

func (m *Manager) GetMessengerClient() (messengertypes.MessengerServiceClient, error) {
	defer m.prepareForGetter()()

	return m.getMessengerClient()
}

func (m *Manager) GetStorageKey() ([]byte, error) {
	defer m.prepareForGetter()()
	return m.getStorageKey()
}

func (m *Manager) getStorageKey() ([]byte, error) {
	if m.storageKey != nil {
		return m.storageKey, nil
	}

	if m.nativeKeystore == nil {
		return nil, nil
	}

	key, err := accountutils.GetOrCreateStorageKey(m.nativeKeystore)
	if err != nil {
		return nil, err
	}

	m.storageKey = key

	return m.storageKey, nil
}

func (m *Manager) SetLifecycleManager(manager *lifecycle.Manager) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// the following check is here to help developers avoid having
	// strange states by using multiple instances of the lifecycle manager
	if m.Node.Messenger.lcmanager != nil {
		panic("initutil.SetLifecycleManager was called but there was already an existing value")
	}

	m.Node.Messenger.lcmanager = manager
}

func (m *Manager) GetLifecycleManager() *lifecycle.Manager {
	defer m.prepareForGetter()()

	return m.getLifecycleManager()
}

func (m *Manager) getLifecycleManager() *lifecycle.Manager {
	if m.Node.Messenger.lcmanager != nil {
		return m.Node.Messenger.lcmanager
	}

	m.Node.Messenger.lcmanager = lifecycle.NewManager(bertymessenger.StateActive)
	return m.Node.Messenger.lcmanager
}

func (m *Manager) getMessengerClient() (messengertypes.MessengerServiceClient, error) {
	if m.Node.Messenger.client != nil {
		return m.Node.Messenger.client, nil
	}

	grpcClient, err := m.getGRPCClientConn()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.Messenger.client = messengertypes.NewMessengerServiceClient(grpcClient)

	m.initLogger.Debug("messenger client initialized and cached")

	return m.Node.Messenger.client, nil
}

func (m *Manager) GetProtocolClient() (protocoltypes.ProtocolServiceClient, error) {
	defer m.prepareForGetter()()

	return m.getProtocolClient()
}

func (m *Manager) getProtocolClient() (protocoltypes.ProtocolServiceClient, error) {
	if m.Node.Protocol.client != nil {
		return m.Node.Protocol.client, nil
	}

	grpcClient, err := m.getGRPCClientConn()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Node.Protocol.client = protocoltypes.NewProtocolServiceClient(grpcClient)

	m.initLogger.Debug("protocol client initialized and cached")
	return m.Node.Protocol.client, nil
}

func (m *Manager) GetGRPCServer() (*grpc.Server, *grpcgw.ServeMux, error) {
	defer m.prepareForGetter()()

	return m.getGRPCServer()
}

func (m *Manager) getGRPCServer() (*grpc.Server, *grpcgw.ServeMux, error) {
	m.applyDefaults()

	if m.Node.GRPC.server != nil {
		return m.Node.GRPC.server, m.Node.GRPC.gatewayMux, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, nil, err
	}

	grpcLogger := logger.Named("grpc")
	// Define customfunc to handle panic
	panicHandler := func(p interface{}) (err error) {
		return status.Errorf(codes.Unknown, "panic recover: %v", p)
	}

	// Shared options for the logger, with a custom gRPC code to log level function.
	recoverOpts := []grpc_recovery.Option{
		grpc_recovery.WithRecoveryHandler(panicHandler),
	}

	zapOpts := []grpc_zap.Option{}

	// override grpc logger
	ReplaceGRPCLogger(grpcLogger)

	// noop auth func
	authFunc := func(ctx context.Context) (context.Context, error) { return ctx, nil }

	if m.Node.Protocol.AuthSecret != "" || m.Node.Protocol.AuthPublicKey != "" {
		man, err := getAuthTokenVerifier(m.Node.Protocol.AuthSecret, m.Node.Protocol.AuthPublicKey)
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}

		serviceID := m.Node.Protocol.ServiceID
		switch serviceID {
		case authtypes.ServiceReplicationID:
			authFunc = man.GRPCAuthInterceptor(serviceID)
		case "":
			logger.Warn("GRPCAuth: Internal field ServiceID should not be empty", zap.String("serviceID", serviceID))
		default:
		}
	}

	grpcOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_recovery.UnaryServerInterceptor(recoverOpts...),
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
			grpc_auth.UnaryServerInterceptor(authFunc),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_recovery.StreamServerInterceptor(recoverOpts...),
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
			grpc_auth.StreamServerInterceptor(authFunc),
		),
	}

	grpcServer := grpc.NewServer(grpcOpts...)
	grpcGatewayMux := grpcgw.NewServeMux()

	if m.Node.GRPC.Listeners != "" {
		addrs := strings.Split(m.Node.GRPC.Listeners, ",")
		maddrs, err := ipfsutil.ParseAddrs(addrs...)
		if err != nil {
			return nil, nil, err
		}
		m.Node.GRPC.listeners = make([]grpcutil.Listener, len(maddrs))

		server := grpcutil.Server{
			GRPCServer: grpcServer,
			GatewayMux: grpcGatewayMux,
		}

		for idx, maddr := range maddrs {
			maddrStr := maddr.String()
			l, err := grpcutil.Listen(maddr)
			if err != nil {
				return nil, nil, errcode.TODO.Wrap(err)
			}
			m.Node.GRPC.listeners[idx] = l

			m.workers.Add(func() error {
				m.initLogger.Info("serving", zap.String("maddr", maddrStr))
				return server.Serve(l)
			}, func(error) {
				l.Close()
				m.initLogger.Debug("closing done", zap.String("maddr", maddrStr))
			})
		}
	}

	m.initLogger.Debug("gRPC server initialized and cached")
	m.Node.GRPC.server = grpcServer
	m.Node.GRPC.gatewayMux = grpcGatewayMux
	return m.Node.GRPC.server, m.Node.GRPC.gatewayMux, nil
}

func (m *Manager) GetGRPCListeners() []grpcutil.Listener {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.Node.GRPC.listeners
}

func (m *Manager) GetMessengerDB() (*gorm.DB, error) {
	defer m.prepareForGetter()()

	return m.getMessengerDB()
}

func (m *Manager) getMessengerDB() (*gorm.DB, error) {
	if m.Node.Messenger.db != nil {
		return m.Node.Messenger.db, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	dir, err := m.getDatastoreDir()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	key, err := m.getStorageKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.Messenger.db, m.Node.Messenger.dbCleanup, err = accountutils.GetMessengerDBForPath(dir, key, logger)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return m.Node.Messenger.db, nil
}

func (m *Manager) GetReplicationDB() (*gorm.DB, error) {
	defer m.prepareForGetter()()

	return m.getReplicationDB()
}

func (m *Manager) getReplicationDB() (*gorm.DB, error) {
	if m.Node.Replication.db != nil {
		return m.Node.Replication.db, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	dir, err := m.getDatastoreDir()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.Replication.db, m.Node.Replication.dbCleanup, err = accountutils.GetReplicationDBForPath(dir, logger)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return m.Node.Replication.db, nil
}

func (m *Manager) restoreMessengerDataFromExport() error {
	if m.Node.Messenger.ExportPathToRestore == "" {
		return nil
	}

	f, err := os.Open(m.Node.Messenger.ExportPathToRestore)
	if err != nil {
		return err
	}
	defer func() { _ = f.Close() }()

	m.Node.Messenger.ExportPathToRestore = ""

	logger, err := m.getLogger()
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	coreAPI, _, err := m.getLocalIPFS()
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	odb, err := m.getOrbitDB()
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	m.Node.Messenger.localDBState = &messengertypes.LocalDatabaseState{}

	if err := bertymessenger.RestoreFromAccountExport(m.ctx, f, coreAPI, odb, m.Node.Messenger.localDBState, logger); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func (m *Manager) GetLocalMessengerServer() (messengertypes.MessengerServiceServer, error) {
	defer m.prepareForGetter()()

	return m.getLocalMessengerServer()
}

func (m *Manager) getLocalMessengerServer() (messengertypes.MessengerServiceServer, error) {
	if m.Node.Messenger.server != nil {
		return m.Node.Messenger.server, nil
	}

	// restore store if provided
	if err := m.restoreMessengerDataFromExport(); err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to restore messenger data from export: %w", err))
	}

	// logger
	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to init logger: %w", err))
	}

	// messenger db
	db, err := m.getMessengerDB()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to init messenger db: %w", err))
	}

	// grpc server
	grpcServer, gatewayMux, err := m.getGRPCServer()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to grpc server: %w", err))
	}

	// configure notifications
	notifmanager, err := m.getNotificationManager()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to init notification manager: %w", err))
	}

	// local protocol server
	protocolServer, err := m.getLocalProtocolServer()
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to init local protocol server: %w", err))
	}

	// protocol client
	protocolClient, err := bertyprotocol.NewClient(m.getContext(), protocolServer, nil, nil) // FIXME: setup tracing
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to init protocol client: %w", err))
	}
	m.Node.Messenger.protocolClient = protocolClient

	lcmanager := m.getLifecycleManager()

	pushPlatformToken := (*protocoltypes.PushServiceReceiver)(nil)
	if m.Node.Protocol.PushPlatformToken != "" {
		pushPlatformToken = &protocoltypes.PushServiceReceiver{}

		data, err := base64.RawURLEncoding.DecodeString(m.Node.Protocol.PushPlatformToken)
		if err != nil {
			return nil, errcode.ErrDeserialization.Wrap(err)
		}

		if err := pushPlatformToken.Unmarshal(data); err != nil {
			return nil, errcode.ErrDeserialization.Wrap(err)
		}
	}

	// messenger server
	opts := bertymessenger.Opts{
		EnableGroupMonitor:  !m.Node.Messenger.DisableGroupMonitor,
		DB:                  db,
		Logger:              logger,
		NotificationManager: notifmanager,
		LifeCycleManager:    lcmanager,
		StateBackup:         m.Node.Messenger.localDBState,
		Ring:                m.Logging.ring,
		PlatformPushToken:   pushPlatformToken,
	}
	messengerServer, err := bertymessenger.New(protocolClient, &opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to init messenger server: %w", err))
	}

	// register grpc service
	messengertypes.RegisterMessengerServiceServer(grpcServer, messengerServer)
	if err := messengertypes.RegisterMessengerServiceHandlerServer(m.getContext(), gatewayMux, messengerServer); err != nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("unable to register messenger service handler: %w", err))
	}

	m.Node.Messenger.lcmanager = lcmanager
	m.Node.Messenger.server = messengerServer
	m.initLogger.Debug("messenger server initialized and cached")
	return m.Node.Messenger.server, nil
}

func getAuthTokenVerifier(secret, pk string) (*bertyauth.AuthTokenVerifier, error) {
	rawSecret, err := base64.RawStdEncoding.DecodeString(secret)
	if err != nil {
		return nil, err
	}

	rawPK, err := base64.RawStdEncoding.DecodeString(pk)
	if err != nil {
		return nil, err
	}

	if len(rawPK) != ed25519.PublicKeySize {
		return nil, fmt.Errorf("empty or invalid pk size")
	}

	return bertyauth.NewAuthTokenVerifier(rawSecret, rawPK)
}

func safeDefaultDisplayName() string {
	var name string
	current, err := user.Current()
	if err == nil {
		name = current.Username
	}
	if name == "" {
		name = os.Getenv("USER")
	}
	if name == "" {
		name = "Anonymous4242"
	}
	return fmt.Sprintf("%s (cli)", name)
}
