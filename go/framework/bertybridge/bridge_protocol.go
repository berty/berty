package bertybridge

import (
	"context"
	"fmt"
	mrand "math/rand"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	badger_opts "github.com/dgraph-io/badger/options"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	datastore "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	ipfs_badger "github.com/ipfs/go-ds-badger"
	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/core/bootstrap"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/pkg/errors"
	grpc_trace "go.opentelemetry.io/otel/instrumentation/grpctrace"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

var (
	defaultProtocolRendezVousPeers = config.BertyMobile.RendezVousPeers
	defaultProtocolBootstrap       = config.BertyMobile.Bootstrap
	defaultTracingHost             = config.BertyMobile.Tracing
	defaultSwarmAddrs              = config.BertyMobile.DefaultSwarmAddrs
	defaultAPIAddrs                = config.BertyMobile.DefaultAPIAddrs
	APIConfig                      = config.BertyMobile.APIConfig
)

var defaultBootstrapConfig = bootstrap.BootstrapConfig{
	MinPeerThreshold:  5,
	Period:            10 * time.Second,
	ConnectionTimeout: (5 * time.Second), // Perod / 3
}

const memPath = ":memory:"

type MessengerBridge struct {
	*Bridge

	logger           *zap.Logger
	loggerCleanup    func()
	node             *core.IpfsNode
	protocolService  bertyprotocol.Service
	messengerService bertymessenger.Service
	msngrDB          *gorm.DB
	notification     notification.Manager

	lifecycledriver LifeCycleDriver
	lcmanager       *lifecycle.Manager

	currentAppState int
	muAppState      sync.Mutex

	// protocol datastore
	ds             datastore.Batching
	protocolClient bertyprotocol.Client
}

type MessengerConfig struct {
	*Config

	dLogger        NativeLoggerDriver
	logFilters     string
	lc             LifeCycleDriver
	notifdriver    NotificationDriver
	swarmListeners []string
	rootDirectory  string
	tracing        bool
	tracingPrefix  string
	localDiscovery bool

	// internal
	coreAPI ipfsutil.ExtendedCoreAPI
}

func NewMessengerConfig() *MessengerConfig {
	return &MessengerConfig{
		Config: NewConfig(),
	}
}

func (pc *MessengerConfig) RootDirectory(dir string) {
	pc.rootDirectory = dir
}

func (pc *MessengerConfig) EnableTracing() {
	pc.tracing = true
}

func (pc *MessengerConfig) SetTracingPrefix(prefix string) {
	pc.tracingPrefix = prefix
}

func (pc *MessengerConfig) SetLogFilters(filters string) {
	pc.logFilters = filters
}

func (pc *MessengerConfig) LoggerDriver(dLogger NativeLoggerDriver) {
	pc.dLogger = dLogger
}

func (pc *MessengerConfig) NotificationDriver(driver NotificationDriver) {
	pc.notifdriver = driver
}

func (pc *MessengerConfig) LifeCycleDriver(lc LifeCycleDriver) {
	pc.lc = lc
}

func (pc *MessengerConfig) AddSwarmListener(laddr string) {
	pc.swarmListeners = append(pc.swarmListeners, laddr)
}

func (pc *MessengerConfig) DisableLocalDiscovery() {
	pc.localDiscovery = false
}

func NewMessengerBridge(config *MessengerConfig) (*MessengerBridge, error) {
	logger, cleanup, err := newLogger(config.logFilters, config.dLogger)
	if err != nil {
		return nil, err
	}

	bridge, err := newProtocolBridge(context.Background(), logger, config)
	if err != nil {
		return nil, err
	}

	bridge.loggerCleanup = cleanup
	return bridge, nil
}

func newProtocolBridge(ctx context.Context, logger *zap.Logger, config *MessengerConfig) (*MessengerBridge, error) {
	// setup coreapi if needed
	var (
		protocolClient bertyprotocol.Client
		api            ipfsutil.ExtendedCoreAPI
		node           *core.IpfsNode
		ps             *pubsub.PubSub
		repo           ipfs_repo.Repo
		disc           tinder.Driver
	)

	bridgeLogger := logger.Named("bridge")

	{
		var err error

		if api = config.coreAPI; api == nil {
			// load repo

			if repo, err = getIPFSRepo(config.rootDirectory); err != nil {
				return nil, errors.Wrap(err, "failed to get ipfs repo")
			}

			var rdvpeers []*peer.AddrInfo

			if rdvpeers, err = ipfsutil.ParseAndResolveRdvpMaddrs(ctx, logger, defaultProtocolRendezVousPeers); err != nil {
				return nil, err
			}

			var bopts = ipfsutil.CoreAPIConfig{
				DisableCorePubSub: true,
				SwarmAddrs:        defaultSwarmAddrs,
				APIAddrs:          defaultAPIAddrs,
				APIConfig:         APIConfig,
				ExtraLibp2pOption: libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(logger))),
				HostConfig: func(h host.Host, _ routing.Routing) error {
					var err error
					var rdvClients []tinder.AsyncableDriver

					if lenrdvpeers := len(rdvpeers); lenrdvpeers > 0 {
						drivers := make([]tinder.AsyncableDriver, lenrdvpeers)
						for i, peer := range rdvpeers {
							h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
							drivers[i] = tinder.NewRendezvousDiscovery(logger, h, peer.ID,
								mrand.New(mrand.NewSource(mrand.Int63())))
						}
						rdvClients = append(rdvClients, drivers...)
					}

					var rdvClient tinder.AsyncableDriver
					switch len(rdvClients) {
					case 0:
						// FIXME: Check if this isn't called when DisableIPFSNetwork true.
						return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't create an IPFS node without any discovery"))
					case 1:
						rdvClient = rdvClients[0]
					default:
						rdvClient = tinder.NewAsyncMultiDriver(logger, rdvClients...)
					}

					minBackoff, maxBackoff := time.Second, time.Minute
					rng := mrand.New(mrand.NewSource(mrand.Int63()))
					disc, err = tinder.NewService(
						logger,
						rdvClient,
						discovery.NewExponentialBackoff(minBackoff, maxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
					)
					if err != nil {
						return err
					}

					ps, err = pubsub.NewGossipSub(ctx, h,
						pubsub.WithMessageSigning(true),
						pubsub.WithFloodPublish(true),
						pubsub.WithDiscovery(disc),
					)

					if err != nil {
						return err
					}

					return nil
				},
			}

			bopts.BootstrapAddrs = defaultProtocolBootstrap

			// should be a valid rendezvous peer
			bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, defaultProtocolRendezVousPeers...)
			if len(config.swarmListeners) > 0 {
				bopts.SwarmAddrs = append(bopts.SwarmAddrs, config.swarmListeners...)
			}

			api, node, err = ipfsutil.NewCoreAPIFromRepo(ctx, repo, &bopts)
			if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}

			psapi := ipfsutil.NewPubSubAPI(ctx, logger, disc, ps)
			api = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(api, psapi)

			// construct http api endpoint
			err = ipfsutil.ServeHTTPApi(logger, node, config.rootDirectory+"/ipfs")
			if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}

			// serve the embedded ipfs webui
			ipfsutil.ServeHTTPWebui(":3000", logger)
			ipfsutil.EnableConnLogger(ctx, logger, node.PeerHost)
		}
	}

	// init tracing
	if config.tracing {
		shortID := fmt.Sprintf("%.6s", node.Identity.String())
		svcName := fmt.Sprintf("<%s>", shortID)
		if prefix := strings.TrimSpace(config.tracingPrefix); prefix != "" {
			svcName = fmt.Sprintf("<%s@%s>", prefix, shortID)
		}
		tracer.InitTracer(defaultTracingHost, svcName)
	}

	// load datastore
	var rootds datastore.Batching
	{
		var err error

		if rootds, err = getRootDatastore(config.rootDirectory); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// setup protocol
	var service bertyprotocol.Service
	{
		var err error
		deviceDS := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootds, datastore.NewKey(bertyprotocol.NamespaceDeviceKeystore)))
		deviceKS := bertyprotocol.NewDeviceKeystore(deviceDS)

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			PubSub:         ps,
			Logger:         logger,
			RootDatastore:  rootds,
			DeviceKeystore: deviceKS,
			IpfsCoreAPI:    api,
			TinderDriver:   disc,
		}

		if node != nil {
			protocolOpts.Host = node.PeerHost
		}

		service, err = bertyprotocol.New(ctx, protocolOpts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// register protocol service
	var grpcServer *grpc.Server
	{
		grpcLogger := logger.Named("grpc")
		// Define customfunc to handle panic
		panicHandler := func(p interface{}) (err error) {
			return status.Errorf(codes.Unknown, "panic recover: %v", p)
		}

		// Shared options for the logger, with a custom gRPC code to log level function.
		recoverOpts := []grpc_recovery.Option{
			grpc_recovery.WithRecoveryHandler(panicHandler),
		}

		// setup grpc with zap
		// grpc_zap.ReplaceGrpcLoggerV2(grpcLogger)

		trServer := tracer.New("grpc-server")
		serverOpts := []grpc.ServerOption{
			grpc_middleware.WithUnaryServerChain(
				grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
				grpc_zap.UnaryServerInterceptor(grpcLogger),
				grpc_recovery.UnaryServerInterceptor(recoverOpts...),
				grpc_trace.UnaryServerInterceptor(trServer),
			),
			grpc_middleware.WithStreamServerChain(
				grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
				grpc_zap.StreamServerInterceptor(grpcLogger),
				grpc_recovery.StreamServerInterceptor(recoverOpts...),
				grpc_trace.StreamServerInterceptor(trServer),
			),
		}

		grpcServer = grpc.NewServer(serverOpts...)
		bertyprotocol.RegisterProtocolServiceServer(grpcServer, service)
	}

	var notifmanager notification.Manager
	{
		if config.notifdriver != nil {
			notifmanager = newNotificationManagerAdaptater(logger, config.notifdriver)
		} else {
			notifmanager = notification.NewLoggerManager(logger)
		}
	}

	lcmanager := lifecycle.NewManager(bertymessenger.StateActive)

	// register messenger service
	var messenger bertymessenger.Service
	var db *gorm.DB
	{
		var err error
		protocolClient, err = bertyprotocol.NewClient(ctx, service, nil, nil)

		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		zapLogger := zapgorm2.New(logger)
		zapLogger.SetAsDefault()

		// setup db
		shouldPersist := config.rootDirectory != "" && config.rootDirectory != memPath
		if shouldPersist {
			dbPath := config.rootDirectory + "/messenger.db"
			bridgeLogger.Debug("using db", zap.String("path", dbPath))
			db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{Logger: zapLogger})
		} else {
			db, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{Logger: zapLogger})
		}
		if err != nil {
			if cErr := protocolClient.Close(); cErr != nil {
				bridgeLogger.Error("failed to close protocol client", zap.Error(cErr))
			}
			return nil, errcode.TODO.Wrap(err)
		}

		opts := bertymessenger.Opts{
			Logger:              logger,
			NotificationManager: notifmanager,
			LifeCycleManager:    lcmanager,
			DB:                  db,
		}
		tmpBridge := &MessengerBridge{
			logger:          bridgeLogger,
			protocolService: service,
			node:            node,
			ds:              rootds,
			msngrDB:         db,
			protocolClient:  protocolClient,
		}
		messenger, err = bertymessenger.New(protocolClient, &opts)
		if err != nil {
			cErr := tmpBridge.Close()
			if cErr != nil {
				logger.Error("failed to close messenger", zap.Error(cErr))
			}
			return nil, errcode.TODO.Wrap(err)
		}
		bertymessenger.RegisterMessengerServiceServer(grpcServer, messenger)
	}

	// setup bridge
	var bridge *Bridge
	{
		var err error

		bridge, err = newBridge(ctx, grpcServer, bridgeLogger, config.Config)
		if err != nil {
			return nil, err
		}
	}

	messengerBridge := &MessengerBridge{
		Bridge: bridge,

		logger:           bridgeLogger,
		protocolService:  service,
		node:             node,
		ds:               rootds,
		messengerService: messenger,
		msngrDB:          db,
		protocolClient:   protocolClient,
		notification:     notifmanager,
	}

	// setup lifecycle
	var lc LifeCycleDriver
	{
		if lc = config.lc; lc == nil {
			lc = newNoopLifeCycleDriver()
		}

		messengerBridge.HandleState(lc.GetCurrentState())
		messengerBridge.lifecycledriver = lc

		lc.RegisterHandler(messengerBridge)
	}

	return messengerBridge, nil
}

var _ LifeCycleHandler = (*MessengerBridge)(nil)

func (p *MessengerBridge) HandleState(appstate int) {
	p.muAppState.Lock()
	defer p.muAppState.Unlock()

	if appstate != p.currentAppState {
		switch appstate {
		case AppStateBackground:
			p.lcmanager.UpdateState(bertymessenger.StateInactive)
			p.logger.Info("app is in Background State")
		case AppStateActive:
			p.lcmanager.UpdateState(bertymessenger.StateActive)
			p.logger.Info("app is in Active State")
			if err := p.node.Bootstrap(defaultBootstrapConfig); err != nil {
				p.logger.Warn("Unable to boostrap node", zap.Error(err))
			}
		case AppStateInactive:
			p.lcmanager.UpdateState(bertymessenger.StateInactive)
			p.logger.Info("app is in Inactive State")
		}
		p.currentAppState = appstate
	}
}

var backgroundCounter int32

func (p *MessengerBridge) HandleTask() LifeCycleBackgroundTask {
	return NewBackgroundTask(p.logger, func(ctx context.Context) error {
		p.logger.Info("starting background task")

		counter := atomic.AddInt32(&backgroundCounter, 1)
		tnow := time.Now()

		n := time.Duration(mrand.Intn(60) + 5)
		ctx, cancel := context.WithTimeout(ctx, time.Second*n)
		defer cancel()

		if err := p.notification.Notify(&notification.Notification{
			Title: fmt.Sprintf("GoBackgroundTask #%d", counter),
			Body:  "started",
		}); err != nil {
			p.logger.Error("unable to notify", zap.Error(err))
		}

		<-ctx.Done()

		if err := p.notification.Notify(&notification.Notification{
			Title: fmt.Sprintf("GoBackgroundTask #%d", counter),
			Body:  fmt.Sprintf("ended (duration: %s)", time.Since(tnow).Truncate(time.Second)),
		}); err != nil {
			p.logger.Error("unable to notify", zap.Error(err))
		}

		return nil
	})
}

func (p *MessengerBridge) WillTerminate() {
	if err := p.Close(); err != nil {
		errs := multierr.Errors(err)
		errFields := make([]zap.Field, len(errs))
		for i, err := range errs {
			errFields[i] = zap.Error(err)
		}
		p.logger.Error("unable to close messenger properly", errFields...)
	} else {
		p.logger.Info("messenger has been closed")
	}
}

func (p *MessengerBridge) Close() error {
	var errs error

	// close bridge
	if p.Bridge != nil {
		if err := p.Bridge.Close(); err != nil {
			errs = multierr.Append(errs, fmt.Errorf("unable to close grpc bridge: %s", err))
		}
	}

	// close messenger
	if p.messengerService != nil {
		p.messengerService.Close()
	}

	// protocol client
	if err := p.protocolClient.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close protocol client: %s", err))
	}

	// close protocol
	if err := p.protocolService.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close protocol service: %s", err))
	}

	if p.node != nil {
		if err := p.node.Close(); err != nil {
			errs = multierr.Append(errs, fmt.Errorf("unable to close ipfs node: %s", err))
		}
	}

	if err := p.ds.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close datastore: %s", err))
	}

	// closing messenger db
	sqlDB, err := p.msngrDB.DB()
	if err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to get messenger db: %s", err))
	} else if err := sqlDB.Close(); err != nil {
		errs = multierr.Append(errs, fmt.Errorf("unable to close messenger db: %s", err))
	}

	if p.loggerCleanup != nil {
		p.loggerCleanup()
	}

	return errs
}

func getRootDatastore(path string) (datastore.Batching, error) {
	if path == "" || path == memPath {
		baseds := ds_sync.MutexWrap(datastore.NewMapDatastore())
		return baseds, nil
	}

	basepath := filepath.Join(path, "store")
	_, err := os.Stat(basepath)
	if err != nil {
		if !os.IsNotExist(err) {
			return nil, errors.Wrap(err, "unable get directory")
		}
		if err := os.MkdirAll(basepath, 0700); err != nil {
			return nil, errors.Wrap(err, "unable to create datastore directory")
		}
	}

	baseds, err := ipfs_badger.NewDatastore(basepath, &ipfs_badger.Options{
		Options: ipfs_badger.DefaultOptions.WithValueLogLoadingMode(badger_opts.FileIO),
	})

	if err != nil {
		return nil, errors.Wrapf(err, "failed to load datastore on: `%s`", basepath)
	}

	return baseds, nil
}

func getIPFSRepo(path string) (ipfs_repo.Repo, error) {
	if path == "" || path == memPath {
		repods := ds_sync.MutexWrap(datastore.NewMapDatastore())
		return ipfsutil.CreateMockedRepo(repods)
	}

	basepath := filepath.Join(path, "ipfs")
	_, err := os.Stat(basepath)
	if err != nil {
		if !os.IsNotExist(err) {
			return nil, errors.Wrap(err, "unable get orbitdb directory")
		}
		if err := os.MkdirAll(basepath, 0700); err != nil {
			return nil, errors.Wrap(err, "unable to create orbitdb directory")
		}
	}

	return ipfsutil.LoadRepoFromPath(basepath)
}
