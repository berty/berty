package initutil

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/core"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/shibukawa/configdir"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type Manager struct {
	IsMobile bool
	Logging  struct {
		Format  string
		Logfile string
		Filters string
		Tracer  string

		zapLogger *zap.Logger
		cleanup   func()
	}
	Metrics struct {
		Registry *prometheus.Registry
		Listener string
		Pedantic bool
	}
	Datastore struct {
		Dir      string
		InMemory bool

		defaultDir string
		dir        string
		rootDS     datastore.Batching
	}
	Node struct {
		Protocol struct {
			// IPFS
			IPFSListeners      flagStringSlice
			IPFSAPIListeners   flagStringSlice
			IPFSWebUIListener  string
			Announce           flagStringSlice
			NoAnnounce         flagStringSlice
			LocalDiscovery     bool
			MinBackoff         time.Duration
			MaxBackoff         time.Duration
			DisableIPFSNetwork bool
			// RdvpMaddrs store a list of rdvp server maddr.
			// The entry : `:dev:` will add the devs servers to the list (default).
			// The netry : `:none:` will disable all rdvp servers.
			RdvpMaddrs flagStringSlice

			// Auth
			AuthSecret    string
			AuthPublicKey string

			// internal
			needAuth         bool
			ipfsNode         *core.IpfsNode
			ipfsAPI          ipfsutil.ExtendedCoreAPI
			pubsub           *pubsub.PubSub
			discovery        tinder.Driver
			server           bertyprotocol.Service
			client           bertyprotocol.ProtocolServiceClient
			requiredByClient bool
			ipfsWebUICleanup func()
		}
		Messenger struct {
			DisplayName          string
			DisableNotifications bool
			RebuildSqlite        bool
			MessengerSqliteOpts  string

			// internal
			protocolClient      bertyprotocol.Client
			server              bertymessenger.Service
			lcmanager           *lifecycle.Manager
			notificationManager notification.Manager
			client              bertymessenger.MessengerServiceClient
			db                  *gorm.DB
			dbCleanup           func()
			requiredByClient    bool
		}
		GRPC struct {
			RemoteAddr string
			Listeners  string

			// internal
			clientConn        *grpc.ClientConn
			server            *grpc.Server
			bufServer         *grpc.Server
			bufServerListener *grpcutil.BufListener
			gatewayMux        *runtime.ServeMux
		}

		orbitDB *bertyprotocol.BertyOrbitDB
	}

	// internal
	ctx        context.Context
	ctxCancel  func()
	initLogger *zap.Logger
	workers    run.Group // replace by something more accurate
	mutex      sync.Mutex
}

func New(ctx context.Context) (*Manager, error) {
	m := Manager{
		initLogger: zap.NewNop(),
	}
	m.ctx, m.ctxCancel = context.WithCancel(ctx)

	// storage path
	{
		storagePath := configdir.New("berty-tech", "berty")
		storageDirs := storagePath.QueryFolders(configdir.Global)
		if len(storageDirs) == 0 {
			return nil, fmt.Errorf("no storage path found")
		}
		if err := storageDirs[0].CreateParentDir(""); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
		m.Datastore.defaultDir = storageDirs[0].Path
	}

	return &m, nil
}

type MobileParams struct {
	Logger              *zap.Logger
	LoggerCleanup       func()
	NotificationManager notification.Manager
	IPFSListeners       []string
	IPFSAPIListeners    []string
	RootDirectory       string
	LocalDiscovery      bool
}

func NewFromMobile(ctx context.Context, mc MobileParams) (*Manager, error) {
	m := &Manager{
		IsMobile:   true,
		initLogger: zap.NewNop(),
	}
	m.ctx, m.ctxCancel = context.WithCancel(ctx)
	m.Datastore.Dir = mc.RootDirectory
	m.Logging.zapLogger = mc.Logger
	m.Node.Protocol.IPFSListeners = mc.IPFSListeners
	m.Node.Protocol.IPFSAPIListeners = mc.IPFSAPIListeners
	m.Node.Protocol.LocalDiscovery = mc.LocalDiscovery
	m.Node.Messenger.notificationManager = mc.NotificationManager

	return m, nil
}

func (m *Manager) GetContext() context.Context {
	return m.ctx
}

func (m *Manager) RunWorkers() error {
	m.workers.Add(func() error {
		<-m.ctx.Done()
		return m.ctx.Err()
	}, func(error) {
		m.ctxCancel()
	})
	return m.workers.Run()
}

func (m *Manager) Close() error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	m.ctxCancel()

	if m.Node.GRPC.clientConn != nil {
		m.Node.GRPC.clientConn.Close()
	}

	if m.Node.GRPC.bufServer != nil {
		m.Node.GRPC.bufServer.Stop()
	}

	if m.Node.GRPC.bufServerListener != nil {
		m.Node.GRPC.bufServerListener.Close()
	}

	if m.Node.GRPC.server != nil {
		m.Node.GRPC.server.Stop()
	}

	if m.Node.Messenger.server != nil {
		m.Node.Messenger.server.Close()
	}
	if m.Node.Messenger.protocolClient != nil {
		m.Node.Messenger.protocolClient.Close()
	}
	if m.Node.Messenger.dbCleanup != nil {
		m.Node.Messenger.dbCleanup()
	}
	if m.Node.Protocol.server != nil {
		m.Node.Protocol.server.Close()
	}
	if m.Node.Protocol.ipfsWebUICleanup != nil {
		m.Node.Protocol.ipfsWebUICleanup()
	}
	if m.Node.Protocol.ipfsNode != nil {
		m.Node.Protocol.ipfsNode.Close()
	}
	if m.Datastore.rootDS != nil {
		m.Datastore.rootDS.Close()
	}
	if m.Logging.cleanup != nil {
		m.Logging.cleanup()
	}

	return nil
}
