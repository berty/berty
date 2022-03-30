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

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/core"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	p2p_mdns "github.com/libp2p/go-libp2p/p2p/discovery/mdns"
	"github.com/oklog/run"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/shibukawa/configdir"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"gorm.io/gorm"
	"moul.io/progress"
	"moul.io/zapring"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/notification"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

const (
	KeywordDefault string = ":default:"
	KeywordNone    string = ":none:"
)

type Manager struct {
	// Session contains metadata for the current running session.
	Session struct {
		// Kind is a string describing the context of the app.
		// When set, it is appended to the session-specific logging file.
		// It follows the following format: '${driver}.${package}.${command}'.
		// Examples:
		//   cli.daemon       -> `go run ./cmd/berty daemon`
		//   cli.mini         -> `go run ./cmd/berty mini`
		//   cli.rdvp         -> `go run ./cmd/rdvp`
		//   mobile.messenger -> Berty Messenger app using the bertybridge
		Kind string `json:"Kind,omitempty"`

		// ID is an auto-generated UUID that can be used by Tyber.
		ID string `json:"ID,omitempty"`
	} `json:"Session,omitempty"`
	Logging struct {
		DisableLogging bool

		DefaultLoggerStreams []logutil.Stream
		StderrFormat         string `json:"StderrFormat,omitempty"`
		StderrFilters        string `json:"StderrFilters,omitempty"`
		FilePath             string `json:"FilePath,omitempty"`
		FileFilters          string `json:"FileFilters,omitempty"`
		RingFilters          string `json:"RingFilters,omitempty"`
		RingSize             uint   `json:"RingSize,omitempty"`

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
		Dir      string `json:"Dir,omitempty"`
		InMemory bool   `json:"InMemory,omitempty"`

		defaultDir string
		dir        string
		rootDS     datastore.Batching
	} `json:"Datastore,omitempty"`
	Node struct {
		Preset   string `json:"preset"`
		Protocol struct {
			SwarmListeners             string `json:"SwarmListeners,omitempty"`
			IPFSAPIListeners           string `json:"IPFSAPIListeners,omitempty"`
			IPFSWebUIListener          string `json:"IPFSWebUIListener,omitempty"`
			Announce                   string `json:"Announce,omitempty"`
			Bootstrap                  string `json:"Bootstrap,omitempty"`
			DHT                        string `json:"DHT,omitempty"`
			DHTRandomWalk              bool   `json:"DHTRandomWalk,omitempty"`
			NoAnnounce                 string `json:"NoAnnounce,omitempty"`
			TinderDiscover             bool   `json:"TinderDiscover,omitempty"`
			TinderDHTDriver            bool   `json:"TinderDHTDriver,omitempty"`
			TinderRDVPDriver           bool   `json:"TinderRDVPDriver,omitempty"`
			TinderLocalDiscoveryDriver bool   `json:"TinderLocalDiscoveryDriver,omitempty"`
			AutoRelay                  bool   `json:"Relay,omitempty"`
			StaticRelays               string `json:"StaticRelays,omitempty"`
			LowWatermark               int    `json:"LowWatermark,omitempty"`
			HighWatermark              int    `json:"HighWatermark,omitempty"`
			MDNS                       struct {
				Enable       bool `json:"Enable,omitempty"`
				DriverLocker sync.Locker
				NetAddrs     ipfsutil.NetAddrs
			} `json:"MDNS,omitempty"`
			Ble struct {
				Enable bool `json:"Enable,omitempty"`
				Driver proximity.ProximityDriver
			} `json:"Ble,omitempty"`
			Nearby struct {
				Enable bool `json:"Enable,omitempty"`
				Driver proximity.ProximityDriver
			} `json:"Nearby,omitempty"`
			MultipeerConnectivity  bool          `json:"MultipeerConnectivity,omitempty"`
			MinBackoff             time.Duration `json:"MinBackoff,omitempty"`
			MaxBackoff             time.Duration `json:"MaxBackoff,omitempty"`
			DisableIPFSNetwork     bool          `json:"DisableIPFSNetwork,omitempty"`
			RdvpMaddrs             string        `json:"RdvpMaddrs,omitempty"`
			AuthSecret             string        `json:"AuthSecret,omitempty"`
			AuthPublicKey          string        `json:"AuthPublicKey,omitempty"`
			PollInterval           time.Duration `json:"PollInterval,omitempty"`
			PushPlatformToken      string        `json:"PushPlatformToken,omitempty"`
			DevicePushKeyPath      string        `json:"DevicePushKeyPath,omitempty"`
			ServiceInsecureMode    bool          `json:"ServiceInsecureMode,omitempty"`
			RendezvousRotationBase time.Duration `json:"RendezvousRotationBase,omitempty"`

			// internal
			DisableDiscoverFilterAddrs bool
			ServiceID                  string
			needAuth                   bool
			ipfsNode                   *core.IpfsNode
			ipfsAPI                    ipfsutil.ExtendedCoreAPI
			mdnsService                p2p_mdns.Service
			localdisc                  *tinder.LocalDiscovery
			pubsub                     *pubsub.PubSub
			discovery                  tinder.Service
			server                     bertyprotocol.Service
			ipfsAPIListeners           []net.Listener
			ipfsWebUIListener          net.Listener
			client                     protocoltypes.ProtocolServiceClient
			requiredByClient           bool
			ipfsWebUICleanup           func()
			orbitDB                    *bertyprotocol.BertyOrbitDB
			rotationInterval           *rendezvous.RotationInterval
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
		Replication struct {
			db        *gorm.DB
			dbCleanup func()
		}
		GRPC struct {
			RemoteAddr       string `json:"RemoteAddr,omitempty"`
			Listeners        string `json:"Listeners,omitempty"`
			AccountListeners string `json:"AccountListeners,omitempty"`

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

	// internal
	ctx            context.Context
	ctxCancel      func()
	initLogger     *zap.Logger
	workers        run.Group // replace by something more accurate
	mutex          sync.Mutex
	longHelp       [][2]string
	nativeKeystore accountutils.NativeKeystore
	accountID      string
}

type ManagerOpts struct {
	DoNotSetDefaultDir   bool
	DisableLogging       bool
	DefaultLoggerStreams []logutil.Stream
	NativeKeystore       accountutils.NativeKeystore
	AccountID            string
}

func New(ctx context.Context, opts *ManagerOpts) (*Manager, error) {
	if opts == nil {
		opts = &ManagerOpts{}
	}

	m := Manager{}
	m.ctx, m.ctxCancel = context.WithCancel(ctx)

	m.accountID = opts.AccountID
	if m.accountID == "" {
		m.accountID = "0"
	}

	// explicitly disable logging
	m.Logging.DisableLogging = opts.DisableLogging

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
	m.Logging.DefaultLoggerStreams = opts.DefaultLoggerStreams
	m.Logging.StderrFilters = defaultLoggingFilters
	m.Logging.RingFilters = defaultLoggingFilters
	m.Logging.FileFilters = "*"
	m.Logging.StderrFormat = "color"
	m.Logging.RingSize = 10 // 10MB ring buffer

	// generate SessionID using uuidv4 to identify each run
	m.Session.ID = tyber.NewSessionID()

	// forward native keystore
	m.nativeKeystore = opts.NativeKeystore

	// storage path
	if !opts.DoNotSetDefaultDir {
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
	prog.AddStep("cleanup-replication-db")
	prog.AddStep("close-protocol-server")
	prog.AddStep("close-tinder-service")
	prog.AddStep("close-mdns-service")
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
		for _, l := range m.Node.GRPC.listeners {
			l.Close()
		}
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

	prog.Get("cleanup-replication-db").SetAsCurrent()
	if m.Node.Replication.dbCleanup != nil {
		m.Node.Replication.dbCleanup()
	}

	prog.Get("close-protocol-server").SetAsCurrent()
	if m.Node.Protocol.server != nil {
		m.Node.Protocol.server.Close()
	}

	prog.Get("close-tinder-service").SetAsCurrent()
	if m.Node.Protocol.server != nil {
		m.Node.Protocol.discovery.Close()
		if m.Node.Protocol.localdisc != nil {
			m.Node.Protocol.localdisc.Close()
		}
	}

	prog.Get("close-mdns-service").SetAsCurrent()
	if m.Node.Protocol.mdnsService != nil {
		m.Node.Protocol.mdnsService.Close()
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
