package initutil

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/user"
	"path"
	"strings"
	"time"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/peer"
	grpc_trace "go.opentelemetry.io/otel/instrumentation/grpctrace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Manager) SetupLocalProtocolServerFlags(fs *flag.FlagSet) {
	m.Node.Protocol.requiredByClient = true
	m.SetupDatastoreFlags(fs)
	fs.UintVar(&m.Node.Protocol.IPFSListeningPort, "p2p.ipfs-port", 0, "IPFS listening port")
	fs.BoolVar(&m.Node.Protocol.LocalDiscovery, "p2p.local-discovery", true, "local discovery")
	fs.StringVar(&m.Node.Protocol.RdvpMaddr, "p2p.rdvp", ":dev:", "rendezvous point maddr")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute, "maximum p2p backoff duration")
	fs.StringVar(&m.Node.Protocol.GRPCListeners, "node.listeners", "/ip4/127.0.0.1/tcp/9091/grpc", "gRPC API listeners")
	// p2p.remote-ipfs
	// p2p.no-ble
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
	fs.BoolVar(&m.Node.Messenger.RebuildSqlite, "node.rebuild-db", false, "reconstruct messenger DB from OrbitDB logs")
	fs.BoolVar(&m.Node.Messenger.DisableNotifications, "node.no-notif", false, "disable desktop notifications")
	fs.StringVar(&m.Node.Messenger.DisplayName, "node.display-name", safeDefaultDisplayName(), "display name")
	// node.db-opts // see https://github.com/mattn/go-sqlite3#connection-string
}

func (m *Manager) GetLocalProtocolServer() (bertyprotocol.Service, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getLocalProtocolServer()
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

	// construct http api endpoint
	ipfsutil.ServeHTTPApi(logger, m.Node.Protocol.ipfsNode, "")

	// serve the embedded ipfs web UI
	ipfsutil.ServeHTTPWebui(logger)

	odb, err := m.getOrbitDB()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// protocol service
	{
		var (
			deviceDS = ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
			deviceKS = bertyprotocol.NewDeviceKeystore(deviceDS)
		)

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
		}

		m.Node.Protocol.server, err = bertyprotocol.New(m.ctx, opts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// register grpc service
		bertyprotocol.RegisterProtocolServiceServer(grpcServer, m.Node.Protocol.server)
		if err := bertyprotocol.RegisterProtocolServiceHandlerServer(m.ctx, gatewayMux, m.Node.Protocol.server); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	m.initLogger.Debug("protocol server initialized and cached")
	return m.Node.Protocol.server, nil
}

func (m *Manager) GetGRPCClientConn() (*grpc.ClientConn, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getGRPCClientConn()
}

func (m *Manager) getGRPCClientConn() (*grpc.ClientConn, error) {
	if m.Node.GRPC.clientConn != nil {
		return m.Node.GRPC.clientConn, nil
	}

	trClient := tracer.New("grpc-client")
	clientOpts := []grpc.DialOption{
		grpc.WithUnaryInterceptor(grpc_trace.UnaryClientInterceptor(trClient)),
		grpc.WithStreamInterceptor(grpc_trace.StreamClientInterceptor(trClient)),
	}

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
		bl := grpcutil.NewBufListener(m.ctx, 256*1024)
		cc, err := bl.NewClientConn(clientOpts...)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		if m.Node.Protocol.server != nil {
			bertyprotocol.RegisterProtocolServiceServer(grpcServer, m.Node.Protocol.server)
		}
		if m.Node.Messenger.server != nil {
			bertymessenger.RegisterMessengerServiceServer(grpcServer, m.Node.Messenger.server)
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

func (m *Manager) GetMessengerClient() (bertymessenger.MessengerServiceClient, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getMessengerClient()
}

func (m *Manager) getMessengerClient() (bertymessenger.MessengerServiceClient, error) {
	if m.Node.Messenger.client != nil {
		return m.Node.Messenger.client, nil
	}

	grpcClient, err := m.getGRPCClientConn()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Node.Messenger.client = bertymessenger.NewMessengerServiceClient(grpcClient)

	m.initLogger.Debug("messenger client initialized and cached")
	return m.Node.Messenger.client, nil
}

func (m *Manager) GetProtocolClient() (bertyprotocol.ProtocolServiceClient, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getProtocolClient()
}

func (m *Manager) getProtocolClient() (bertyprotocol.ProtocolServiceClient, error) {
	if m.Node.Protocol.client != nil {
		return m.Node.Protocol.client, nil
	}

	grpcClient, err := m.getGRPCClientConn()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.Node.Protocol.client = bertyprotocol.NewProtocolServiceClient(grpcClient)

	m.initLogger.Debug("protocol client initialized and cached")
	return m.Node.Protocol.client, nil
}

func (m *Manager) GetGRPCServer() (*grpc.Server, *runtime.ServeMux, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getGRPCServer()
}

// grpc logger should be set only once.
// without this singleton, we can raise race conditions in unit tests => https://github.com/grpc/grpc-go/issues/1084
var grpcLoggerConfigured = false

func (m *Manager) getGRPCServer() (*grpc.Server, *runtime.ServeMux, error) {
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

	tr := tracer.New("grpc-server")
	// setup grpc with zap
	if !grpcLoggerConfigured {
		grpc_zap.ReplaceGrpcLoggerV2(grpcLogger)
		grpcLoggerConfigured = true
	}
	grpcOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_recovery.UnaryServerInterceptor(recoverOpts...),
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
			grpc_trace.UnaryServerInterceptor(tr),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_recovery.StreamServerInterceptor(recoverOpts...),
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_trace.StreamServerInterceptor(tr),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
		),
	}

	grpcServer := grpc.NewServer(grpcOpts...)
	grpcGatewayMux := grpcgw.NewServeMux()

	if m.Node.Protocol.GRPCListeners != "" {
		addrs := strings.Split(m.Node.Protocol.GRPCListeners, ",")
		maddrs, err := ipfsutil.ParseAddrs(addrs...)
		if err != nil {
			return nil, nil, err
		}

		server := grpcutil.Server{
			GRPCServer: grpcServer,
			GatewayMux: grpcGatewayMux,
		}

		for _, maddr := range maddrs {
			maddrStr := maddr.String()
			l, err := grpcutil.Listen(maddr)
			if err != nil {
				return nil, nil, errcode.TODO.Wrap(err)
			}

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

func (m *Manager) getRdvpMaddr() (*peer.AddrInfo, error) {
	_, err := m.getLogger() // ensure logger is initialized
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	switch m.Node.Protocol.RdvpMaddr {
	case "":
		m.initLogger.Debug("no rendezvous peer set")
		return nil, nil
	case ":dev:":
		m.Node.Protocol.RdvpMaddr = config.BertyDev.RendezVousPeer
	}

	resolveCtx, cancel := context.WithTimeout(m.ctx, 10*time.Second)
	defer cancel()

	rdvpeer, err := ipfsutil.ParseAndResolveIpfsAddr(resolveCtx, m.Node.Protocol.RdvpMaddr)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	fds := make([]zapcore.Field, len(rdvpeer.Addrs))
	for i, maddr := range rdvpeer.Addrs {
		key := fmt.Sprintf("#%d", i)
		fds[i] = zap.String(key, maddr.String())
	}
	m.initLogger.Debug("rdvp peer resolved addrs", fds...)
	return rdvpeer, nil
}

func (m *Manager) GetMessengerDB() (*gorm.DB, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
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

	var sqliteConn string
	if dir == InMemoryDir {
		sqliteConn = ":memory:"
	} else {
		sqliteConn = path.Join(dir, "messenger.sqlite")
	}

	cfg := &gorm.Config{Logger: zapgorm2.New(logger.Named("gorm"))}
	db, err := gorm.Open(sqlite.Open(sqliteConn), cfg)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.Messenger.db = db
	m.Node.Messenger.dbCleanup = func() {
		sqlDB, _ := db.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}
	return m.Node.Messenger.db, nil
}

func (m *Manager) GetLocalMessengerServer() (bertymessenger.MessengerServiceServer, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getLocalMessengerServer()
}

func (m *Manager) getLocalMessengerServer() (bertymessenger.MessengerServiceServer, error) {
	if m.Node.Messenger.server != nil {
		return m.Node.Messenger.server, nil
	}

	// logger
	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// messenger db
	db, err := m.getMessengerDB()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// grpc server
	grpcServer, gatewayMux, err := m.getGRPCServer()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// configure notifications
	var notifmanager notification.Manager
	{
		notifLogger := logger.Named("notif")
		if m.Node.Messenger.DisableNotifications {
			notifmanager = notification.NewLoggerManager(notifLogger)
		} else {
			// @TODO(gfanton): find a way to embed the icon into the app, and generate a valid path
			notifmanager = notification.NewDesktopManager(notifLogger, "")
		}
	}

	// local protocol server
	protocolServer, err := m.getLocalProtocolServer()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// protocol client
	protocolClient, err := bertyprotocol.NewClient(m.ctx, protocolServer, nil, nil) // FIXME: setup tracing
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// messenger server
	opts := bertymessenger.Opts{
		DB:                  db,
		Logger:              logger,
		NotificationManager: notifmanager,
	}
	messengerServer, err := bertymessenger.New(protocolClient, &opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// register grpc service
	bertymessenger.RegisterMessengerServiceServer(grpcServer, messengerServer)
	if err := bertymessenger.RegisterMessengerServiceHandlerServer(m.ctx, gatewayMux, messengerServer); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Node.Messenger.server = messengerServer
	m.initLogger.Debug("messenger server initialized and cached")
	return m.Node.Messenger.server, nil
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
