package initutil

import (
	"context"
	"flag"
	"fmt"
	"net"
	"strings"
	"sync"
	"text/tabwriter"
	"time"

	"github.com/gofrs/uuid"
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
	"moul.io/progress"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const (
	KeywordDefault string = ":default:"
	KeywordNone    string = ":none:"
)

type Manager struct {
	Logging struct {
		Format      string `json:"Format,omitempty"`
		Logfile     string `json:"Logfile,omitempty"`
		Filters     string `json:"Filters,omitempty"`
		Tracer      string `json:"Tracer,omitempty"`
		Service     string `json:"Service,omitempty"`
		RingFilters string `json:"RingFilters,omitempty"`
		RingSize    uint   `json:"RingSize,omitempty"`
		TyberHost   string `json:"TyberHost,omitempty"`

		zapLogger *zap.Logger
		cleanup   func()
		ring      *zapring.Core
	} `json:"Logging,omitempty"`
	Metrics struct {
		Listener string `json:"Listener,omitempty"`
		Pedantic bool   `json:"Pedantic,omitempty"`

		registry *prometheus.Registry
	} `json:"Metrics,omitempty"`
	Datastore struct {
		Dir              string `json:"Dir,omitempty"`
		InMemory         bool   `json:"InMemory,omitempty"`
		LowMemoryProfile bool   `json:"LowMemoryProfile,omitempty"`

		defaultDir string
		dir        string
		rootDS     datastore.Batching
	} `json:"Datastore,omitempty"`
	Node struct {
		Preset   string `json:"preset"`
		Protocol struct {
			SwarmListeners    string `json:"SwarmListeners,omitempty"`
			IPFSAPIListeners  string `json:"IPFSAPIListeners,omitempty"`
			IPFSWebUIListener string `json:"IPFSWebUIListener,omitempty"`
			Announce          string `json:"Announce,omitempty"`
			Bootstrap         string `json:"Bootstrap,omitempty"`
			DHT               string `json:"DHT,omitempty"`
			DHTRandomWalk     bool   `json:"DHTRandomWalk,omitempty"`
			NoAnnounce        string `json:"NoAnnounce,omitempty"`
			MDNS              bool   `json:"LocalDiscovery,omitempty"`
			TinderDHTDriver   bool   `json:"TinderDHTDriver,omitempty"`
			TinderRDVPDriver  bool   `json:"TinderRDVPDriver,omitempty"`
			StaticRelays      string `json:"StaticRelays,omitempty"`
			Ble               struct {
				Enable bool                   `json:"Enable,omitempty"`
				Driver proximity.NativeDriver `json:"Driver,omitempty"`
			}
			Nearby struct {
				Enable bool                   `json:"Enable,omitempty"`
				Driver proximity.NativeDriver `json:"Driver,omitempty"`
			}
			MultipeerConnectivity bool          `json:"MultipeerConnectivity,omitempty"`
			MinBackoff            time.Duration `json:"MinBackoff,omitempty"`
			MaxBackoff            time.Duration `json:"MaxBackoff,omitempty"`
			DisableIPFSNetwork    bool          `json:"DisableIPFSNetwork,omitempty"`
			RdvpMaddrs            string        `json:"RdvpMaddrs,omitempty"`
			AuthSecret            string        `json:"AuthSecret,omitempty"`
			AuthPublicKey         string        `json:"AuthPublicKey,omitempty"`
			PollInterval          time.Duration `json:"PollInterval,omitempty"`
			Tor                   struct {
				Mode       string `json:"Mode,omitempty"`
				BinaryPath string `json:"BinaryPath,omitempty"`
			} `json:"Tor,omitempty"`

			// internal
			needAuth          bool
			ipfsNode          *core.IpfsNode
			ipfsAPI           ipfsutil.ExtendedCoreAPI
			pubsub            *pubsub.PubSub
			discovery         tinder.Service
			server            bertyprotocol.Service
			ipfsAPIListeners  []net.Listener
			ipfsWebUIListener net.Listener
			client            protocoltypes.ProtocolServiceClient
			requiredByClient  bool
			ipfsWebUICleanup  func()
			orbitDB           *bertyprotocol.BertyOrbitDB
		}
		Messenger struct {
			DisableGroupMonitor  bool   `json:"DisableGroupMonitor,omitempty"`
			DisplayName          string `json:"DisplayName,omitempty"`
			DisableNotifications bool   `json:"DisableNotifications,omitempty"`
			RebuildSqlite        bool   `json:"RebuildSqlite,omitempty"`
			MessengerSqliteOpts  string `json:"MessengerSqliteOpts,omitempty"`
			ExportPathToRestore  string `json:"ExportPathToRestore,omitempty"`

			// internal
			protocolClient      bertyprotocol.Client
			server              bertymessenger.Service
			lcmanager           *lifecycle.Manager
			notificationManager notification.Manager
			client              messengertypes.MessengerServiceClient
			db                  *gorm.DB
			dbCleanup           func()
			requiredByClient    bool
			localDBState        *messengertypes.LocalDatabaseState
		}
		GRPC struct {
			RemoteAddr string `json:"RemoteAddr,omitempty"`
			Listeners  string `json:"Listeners,omitempty"`

			// internal
			clientConn        *grpc.ClientConn
			server            *grpc.Server
			bufServer         *grpc.Server
			bufServerListener *grpcutil.BufListener
			gatewayMux        *runtime.ServeMux
			listeners         []grpcutil.Listener
		} `json:"GRPC,omitempty"`
	} `json:"Node,omitempty"`
	InitTimeout time.Duration `json:"InitTimeout,omitempty"`
	SessionID   string        `json:"sessionID,omitempty"`

	// internal
	ctx        context.Context
	ctxCancel  func()
	initLogger *zap.Logger
	workers    run.Group // replace by something more accurate
	mutex      sync.Mutex
	longHelp   [][2]string
}

func New(ctx context.Context) (*Manager, error) {
	m := Manager{}
	m.ctx, m.ctxCancel = context.WithCancel(ctx)

	// special default values:
	// this is not the good place to put all the default values.
	//
	// the values here are always set even if the initutil was not
	// configured to allow changing the value through CLI.
	//
	// this is a good place for:
	// * most of the root-level values;
	// * values that are a good default in every circumstance;
	// * values that are reused across various CLI depths.
	//
	// the good location for other variables is in the initutil.SetupFoo functions.
	m.Logging.Filters = defaultLoggingFilters
	m.Logging.RingFilters = defaultLoggingFilters
	m.Logging.Format = "color"
	m.Logging.Service = "berty"
	m.Logging.RingSize = 10 // 10MB ring buffer
	m.Logging.TyberHost = ""

	// generate SessionID using uuidv4 to identify each run
	id, err := uuid.NewV4()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	m.SessionID = id.String()

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

func (m *Manager) applyDefaults() {
	if m.initLogger == nil {
		if m.Logging.zapLogger != nil {
			m.initLogger = m.Logging.zapLogger.Named("init")
		} else {
			m.initLogger = zap.NewNop()
		}
	}
}

func (m *Manager) GetContext() context.Context {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getContext()
}

func (m *Manager) getContext() context.Context {
	if m.ctx == nil {
		m.ctx, m.ctxCancel = context.WithCancel(context.Background())
	}
	return m.ctx
}

func (m *Manager) RunWorkers() error {
	m.workers.Add(func() error {
		<-m.getContext().Done()
		return m.getContext().Err()
	}, func(err error) {
		m.ctxCancel()
	})
	return m.workers.Run()
}

func (m *Manager) Close(prog *progress.Progress) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if prog == nil {
		prog = progress.New()
		defer prog.Close()
	}

	prog.AddStep("cancel-context")
	prog.AddStep("close-client-conn")
	prog.AddStep("stop-buf-server")
	prog.AddStep("close-buf-listener")
	prog.AddStep("stop-grpc-server")
	prog.AddStep("close-messenger-server")
	prog.AddStep("close-messenger-protocol-client")
	prog.AddStep("cleanup-messenger-db")
	prog.AddStep("close-protocol-server")
	prog.AddStep("close-tinder-service")
	prog.AddStep("close-ipfs-node")
	prog.AddStep("close-datastore")
	prog.AddStep("close-ring")
	prog.AddStep("cleanup-logging")
	prog.AddStep("finish")

	prog.Get("cancel-context").SetAsCurrent()
	if m.ctxCancel != nil {
		m.ctxCancel()
	}

	prog.Get("close-client-conn").SetAsCurrent()
	if m.Node.GRPC.clientConn != nil {
		m.Node.GRPC.clientConn.Close()
	}

	prog.Get("stop-buf-server").SetAsCurrent()
	if m.Node.GRPC.bufServer != nil {
		m.Node.GRPC.bufServer.Stop()
	}

	prog.Get("close-buf-listener").SetAsCurrent()
	if m.Node.GRPC.bufServerListener != nil {
		m.Node.GRPC.bufServerListener.Close()
	}

	prog.Get("stop-grpc-server").SetAsCurrent()
	if m.Node.GRPC.server != nil {
		m.Node.GRPC.server.Stop()
	}

	prog.Get("close-messenger-server").SetAsCurrent()
	if m.Node.Messenger.server != nil {
		m.Node.Messenger.server.Close()
	}

	prog.Get("close-messenger-protocol-client").SetAsCurrent()
	if m.Node.Messenger.protocolClient != nil {
		m.Node.Messenger.protocolClient.Close()
	}

	prog.Get("cleanup-messenger-db").SetAsCurrent()
	if m.Node.Messenger.dbCleanup != nil {
		m.Node.Messenger.dbCleanup()
	}

	prog.Get("close-protocol-server").SetAsCurrent()
	if m.Node.Protocol.server != nil {
		m.Node.Protocol.server.Close()
	}

	prog.Get("close-tinder-service").SetAsCurrent()
	if m.Node.Protocol.server != nil {
		m.Node.Protocol.discovery.Close()
	}

	prog.Get("close-ipfs-node").SetAsCurrent()
	if m.Node.Protocol.ipfsNode != nil {
		m.Node.Protocol.ipfsNode.Close()
	}

	prog.Get("close-datastore").SetAsCurrent()
	if m.Datastore.rootDS != nil {
		m.Datastore.rootDS.Close()
	}

	prog.Get("cleanup-logging").SetAsCurrent()
	if m.Logging.cleanup != nil {
		m.Logging.cleanup()
	}

	prog.Get("close-ring").SetAsCurrent()
	if m.Logging.ring != nil {
		m.Logging.ring.Close()
	}

	prog.Get("finish").SetAsCurrent().Done()
	return nil
}

func (m *Manager) AdvancedHelp() string {
	if len(m.longHelp) == 0 {
		return ""
	}
	var b strings.Builder
	fmt.Fprintf(&b, "ADVANCED\n")
	tw := tabwriter.NewWriter(&b, 0, 2, 2, ' ', 0)
	seen := map[string]bool{}
	for _, entry := range m.longHelp {
		line := fmt.Sprintf("  %s\t%s\n", entry[0], entry[1])
		if _, found := seen[line]; found {
			continue
		}
		seen[line] = true
		fmt.Fprint(tw, line)
	}
	tw.Flush()
	return strings.TrimSpace(b.String())
}

func (m *Manager) SetupInitTimeout(fs *flag.FlagSet) {
	fs.DurationVar(&m.InitTimeout, "node.init-timeout", time.Minute, "maximum time allowed for the initialization")
}

// prepareForGetter prepare locks and ctx timeouts for an external getter.
// it returns a cleanup and should be deferred.
func (m *Manager) prepareForGetter() func() {
	m.mutex.Lock()
	if m.InitTimeout > 0 {
		finishChan := make(chan struct{})
		ticker := time.NewTimer(m.InitTimeout)
		go func() {
			select {
			case <-finishChan:
			case <-m.ctx.Done():
			case <-ticker.C:
				m.ctxCancel()
			}
		}()
		return func() {
			close(finishChan)
			ticker.Stop()
			m.mutex.Unlock()
		}
	}
	return m.mutex.Unlock
}
