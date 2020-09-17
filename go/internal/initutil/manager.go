package initutil

import (
	"context"
	"fmt"
	"sync"
	"time"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/core"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/oklog/run"
	"github.com/shibukawa/configdir"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"gorm.io/gorm"
)

type Manager struct {
	Logging struct {
		Format  string
		Logfile string
		Filters string
		Tracer  string

		zapLogger *zap.Logger
		cleanup   func()
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
			IPFSListeners      string
			IPFSWebUIListener  string
			Announce           string
			NoAnnounce         string
			LocalDiscovery     bool
			RdvpMaddr          string
			MinBackoff         time.Duration
			MaxBackoff         time.Duration
			DisableIPFSNetwork bool

			ipfsNode         *core.IpfsNode
			ipfsAPI          ipfsutil.ExtendedCoreAPI
			pubsub           *pubsub.PubSub
			discovery        tinder.Driver
			server           bertyprotocol.Service
			client           bertyprotocol.ProtocolServiceClient
			requiredByClient bool
		}
		Messenger struct {
			DisplayName          string
			DisableNotifications bool
			RebuildSqlite        bool
			MessengerSqliteOpts  string

			server           bertymessenger.Service
			lcmanager        *lifecycle.Manager
			client           bertymessenger.MessengerServiceClient
			db               *gorm.DB
			dbCleanup        func()
			requiredByClient bool
		}
		GRPC struct {
			RemoteAddr string
			Listeners  string

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

	if m.Node.GRPC.bufServerListener != nil {
		m.Node.GRPC.bufServerListener.Close()
	}
	if m.Node.Messenger.server != nil {
		m.Node.Messenger.server.Close()
	}
	if m.Node.Messenger.dbCleanup != nil {
		m.Node.Messenger.dbCleanup()
	}
	if m.Node.Protocol.server != nil {
		m.Node.Protocol.server.Close()
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
