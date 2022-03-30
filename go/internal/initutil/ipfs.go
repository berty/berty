package initutil

import (
	"context"
	"flag"
	"fmt"
	mrand "math/rand"
	"net"
	"net/http"
	"path/filepath"
	"strings"
	"sync"
	"time"

	ipfs_mobile "github.com/ipfs-shipyard/gomobile-ipfs/go/pkg/ipfsmobile"
	datastore "github.com/ipfs/go-datastore"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_util "github.com/ipfs/go-ipfs/cmd/ipfs/util"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_p2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	libp2p "github.com/libp2p/go-libp2p"
	p2p_disc "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	peerstore "github.com/libp2p/go-libp2p-core/peerstore"
	p2p_routing "github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	p2p_dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-tcp-transport"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"go.uber.org/zap"
	"moul.io/srand"

	ble "berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfswebui "berty.tech/ipfs-webui-packed"
)

// Set the Java Android BLE driver
func (m *Manager) SetBleDriver(d proximity.ProximityDriver) {
	m.Node.Protocol.Ble.Driver = d
}

// Set the Java Android Nearby driver
func (m *Manager) SetNBDriver(d proximity.ProximityDriver) {
	m.Node.Protocol.Nearby.Driver = d
}

// Set mdns locker
func (m *Manager) SetMDNSLocker(mlock sync.Locker) {
	m.Node.Protocol.MDNS.DriverLocker = mlock
}

const (
	FlagNameP2PBootstrap                  = "p2p.bootstrap"
	FlagNameP2PDHT                        = "p2p.dht"
	FlagNameP2PMDNS                       = "p2p.mdns"
	FlagNameP2PStaticRelays               = "p2p.static-relays"
	FlagNameP2PRDVP                       = "p2p.rdvp"
	FlagNameP2PBLE                        = "p2p.ble"
	FlagNameP2PNearby                     = "p2p.nearby"
	FlagNameP2PMultipeerConnectivity      = "p2p.multipeer-connectivity"
	FlagNameP2PTinderDiscover             = "p2p.tinder-discover"
	FlagNameP2PTinderDHTDriver            = "p2p.tinder-dht-driver"
	FlagNameP2PTinderRDVPDriver           = "p2p.tinder-rdvp-driver"
	FlagNameP2PTinderLocalDiscoveryDriver = "p2p.tinder-localdiscovery-driver"
	FlagNameP2PDisableDiscoverAddrsFilter = "p2p.disc-disable-filter"

	FlagValueP2PDHTDisabled   = "none"
	FlagValueP2PDHTClient     = "client"
	FlagValueP2PDHTServer     = "server"
	FlagValueP2PDHTAuto       = "auto"
	FlagValueP2PDHTAutoServer = "autoserver"

	ipfsIdentityLastUpdateKey = "ipfs_identity_last_update"
)

func (m *Manager) SetupLocalIPFSFlags(fs *flag.FlagSet) {
	m.SetupPresetFlags(fs)
	fs.StringVar(&m.Node.Protocol.SwarmListeners, "p2p.swarm-listeners", KeywordDefault, "IPFS swarm listeners")
	fs.IntVar(&m.Node.Protocol.HighWatermark, "p2p.high-water", 200, "ConnManager high watermark")
	fs.IntVar(&m.Node.Protocol.LowWatermark, "p2p.low-water", 150, "ConnManager low watermark")
	fs.StringVar(&m.Node.Protocol.IPFSAPIListeners, "p2p.ipfs-api-listeners", "/ip4/127.0.0.1/tcp/5001", "IPFS API listeners")
	fs.StringVar(&m.Node.Protocol.IPFSWebUIListener, "p2p.webui-listener", ":3999", "IPFS WebUI listener")
	fs.StringVar(&m.Node.Protocol.Announce, "p2p.swarm-announce", "", "IPFS announce addrs")
	fs.StringVar(&m.Node.Protocol.Bootstrap, FlagNameP2PBootstrap, KeywordDefault, "ipfs bootstrap node, `:default:` will set ipfs default bootstrap node")
	fs.StringVar(&m.Node.Protocol.DHT, FlagNameP2PDHT, FlagValueP2PDHTClient, "dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`")
	fs.BoolVar(&m.Node.Protocol.DHTRandomWalk, "p2p.dht-randomwalk", true, "if true dht will have randomwalk enable")
	fs.StringVar(&m.Node.Protocol.NoAnnounce, "p2p.swarm-no-announce", "", "IPFS exclude announce addrs")
	fs.BoolVar(&m.Node.Protocol.MDNS.Enable, FlagNameP2PMDNS, true, "if true mdns will be enabled")
	fs.BoolVar(&m.Node.Protocol.TinderDiscover, FlagNameP2PTinderDiscover, true, "if true enable tinder discovery")
	fs.BoolVar(&m.Node.Protocol.TinderDHTDriver, FlagNameP2PTinderDHTDriver, true, "if true dht driver will be enable for tinder")
	fs.BoolVar(&m.Node.Protocol.TinderRDVPDriver, FlagNameP2PTinderRDVPDriver, true, "if true rdvp driver will be enable for tinder")
	fs.BoolVar(&m.Node.Protocol.TinderLocalDiscoveryDriver, FlagNameP2PTinderLocalDiscoveryDriver, true, "if true localdiscovery driver will be enable for tinder")
	fs.BoolVar(&m.Node.Protocol.DisableDiscoverFilterAddrs, FlagNameP2PDisableDiscoverAddrsFilter, false, "dont filter private addrs on discovery service")
	fs.BoolVar(&m.Node.Protocol.AutoRelay, "p2p.autorelay", true, "enable autorelay, force private reachability")
	fs.StringVar(&m.Node.Protocol.StaticRelays, FlagNameP2PStaticRelays, KeywordDefault, "list of static relay maddrs, `:default:` will use statics relays from the config")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute*10, "maximum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.PollInterval, "p2p.poll-interval", pubsub.DiscoveryPollInterval, "how long the discovery system will waits for more peers")
	fs.StringVar(&m.Node.Protocol.RdvpMaddrs, FlagNameP2PRDVP, KeywordDefault, "list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp")
	fs.BoolVar(&m.Node.Protocol.Ble.Enable, FlagNameP2PBLE, false, "if true Bluetooth Low Energy will be enabled")
	fs.BoolVar(&m.Node.Protocol.Nearby.Enable, FlagNameP2PNearby, false, "if true Android Nearby will be enabled")
	fs.BoolVar(&m.Node.Protocol.MultipeerConnectivity, FlagNameP2PMultipeerConnectivity, false, "if true Multipeer Connectivity will be enabled")
	fs.BoolVar(&m.Node.Protocol.DisableIPFSNetwork, "p2p.disable-ipfs-network", false, "disable as much networking feature as possible, useful during development")
	fs.DurationVar(&m.Node.Protocol.RendezvousRotationBase, "node.rdv-rotation", rendezvous.DefaultRotationInterval, "rendezvous rotation base for node")

	m.longHelp = append(m.longHelp, [2]string{
		"-p2p.swarm-listeners=:default:,CUSTOM",
		fmt.Sprintf("equivalent to -p2p.swarm-listeners=%s,CUSTOM", strings.Join(ipfsutil.DefaultSwarmListeners, ",")),
	})
	m.longHelp = append(m.longHelp, [2]string{
		"-p2p.rdvp=:default:,CUSTOM",
		fmt.Sprintf("equivalent to -p2p.rdvp=%s...,CUSTOM", config.Config.P2P.RDVP[0].Maddr[:42]),
	})
	m.longHelp = append(m.longHelp, [2]string{
		"",
		"-> full list available at https://github.com/berty/berty/tree/master/config)",
	})
}

func (m *Manager) GetLocalIPFS() (ipfsutil.ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	defer m.prepareForGetter()()
	return m.getLocalIPFS()
}

func (m *Manager) getLocalIPFS() (ipfsutil.ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	m.applyDefaults()
	ctx := m.getContext()

	if err := m.applyPreset(); err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	if m.Node.Protocol.ipfsAPI != nil {
		if m.Node.Protocol.ipfsNode == nil {
			return nil, nil, errcode.ErrIPFSInit.Wrap(fmt.Errorf("already connected to a remote IPFS node"))
		}

		return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	mrepo, err := m.setupIPFSRepo(ctx)
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	var dhtmode p2p_dht.ModeOpt
	switch m.Node.Protocol.DHT {
	case FlagValueP2PDHTClient:
		dhtmode = p2p_dht.ModeClient
	case FlagValueP2PDHTServer:
		dhtmode = p2p_dht.ModeServer
	case FlagValueP2PDHTAuto:
		dhtmode = p2p_dht.ModeAuto
	case FlagValueP2PDHTAutoServer:
		dhtmode = p2p_dht.ModeAutoServer
	case FlagValueP2PDHTDisabled: // 0
	default:
		err := fmt.Errorf("invalid dht mode")
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	var routing ipfs_p2p.RoutingOption
	if dhtmode > 0 && !m.Node.Protocol.DisableIPFSNetwork {
		dhtopts := []p2p_dht.Option{p2p_dht.Concurrency(5)}

		if !m.Node.Protocol.DHTRandomWalk {
			dhtopts = append(dhtopts, p2p_dht.DisableAutoRefresh())
		}
		routing = ipfsutil.CustomRoutingOption(dhtmode, dhtopts...)
	} else {
		routing = ipfs_p2p.NilRouterOption
	}

	mopts := ipfsutil.MobileOptions{
		IpfsConfigPatch:   m.setupIPFSConfig,
		RoutingConfigFunc: m.configIPFSRouting,
		RoutingOption:     routing,
	}

	if m.Node.Protocol.MDNS.Enable && m.Node.Protocol.MDNS.DriverLocker != nil {
		m.Node.Protocol.MDNS.DriverLocker.Lock()
	}

	// @FIXME(gfanton): this should be done on gomobile-ipfs
	changed, newlimit, err := ipfs_util.ManageFdLimit()
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	if changed {
		logger.Info("setting fd limit", zap.Uint64("newlimit", newlimit))
	} else {
		logger.Error("failed to set fd limit", zap.Error(err))
	}

	// init ipfs
	mnode, err := ipfsutil.NewIPFSMobile(m.getContext(), mrepo, &mopts)
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}
	m.Node.Protocol.ipfsNode = mnode.IpfsNode

	// setup mdns
	if m.Node.Protocol.MDNS.Enable && !m.Node.Protocol.DisableIPFSNetwork {
		h := mnode.PeerHost()
		mdnslogger := logger.Named("mdns")

		dh := ipfsutil.DiscoveryHandler(ctx, mdnslogger, h)
		mdnsService := ipfsutil.NewMdnsService(mdnslogger, h, ipfsutil.MDNSServiceName, dh)

		// get multicast interfaces
		ifaces, err := ipfsutil.GetMulticastInterfaces()
		if err != nil {
			return nil, nil, errcode.ErrIPFSInit.Wrap(err)
		}

		// if multicast interfaces is found, start mdns service
		if len(ifaces) > 0 {
			mdnslogger.Info("starting mdns")
			if err := mdnsService.Start(); err != nil {
				return nil, nil, errcode.ErrIPFSInit.Wrap(err)
			}
		} else {
			mdnslogger.Error("unable to start mdns service, no multicast interfaces found")
		}

		m.Node.Protocol.mdnsService = mdnsService
	}

	// init extended api
	m.Node.Protocol.ipfsAPI, err = ipfsutil.NewExtendedCoreAPIFromNode(mnode.IpfsNode)
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	// serve webui api listener
	// we get listeners from repo config
	cfg, err := mrepo.Config()
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	// serve ipfs api
	for _, addr := range cfg.Addresses.API {
		maddr, err := ma.NewMultiaddr(addr)
		if err != nil {
			logger.Error("unable to parse api addr", zap.Error(err), logutil.PrivateString("addr", addr))
			return nil, nil, errcode.ErrIPFSInit.Wrap(fmt.Errorf("unable to parse api addr: %w", err))
		}

		var l manet.Listener
		m.workers.Add(func() error {
			var err error

			l, err = manet.Listen(maddr)
			if err != nil {
				return errcode.ErrIPFSInit.Wrap(err)
			}

			return mnode.ServeCoreHTTP(manet.NetListener(l))
		}, func(err error) {
			if l != nil {
				l.Close()
			}
		})
	}

	// serve webui
	if addr := m.Node.Protocol.IPFSWebUIListener; addr != "" {
		dir := http.FileServer(ipfswebui.Dir())
		server := &http.Server{Addr: addr, Handler: dir}

		m.workers.Add(func() error {
			var err error

			l, err := net.Listen("tcp", addr)
			if err != nil {
				return errcode.ErrIPFSInit.Wrap(err)
			}

			return server.Serve(l)
		}, func(err error) {
			server.Close()
		})
	}

	psapi := ipfsutil.NewPubSubAPI(m.getContext(), logger.Named("ps"), m.Node.Protocol.discovery, m.Node.Protocol.pubsub)
	m.Node.Protocol.ipfsAPI = ipfsutil.InjectPubSubCoreAPIExtendedAdapter(m.Node.Protocol.ipfsAPI, psapi)

	// enable conn logger
	ipfsutil.EnableConnLogger(m.getContext(), logger, m.Node.Protocol.ipfsNode.PeerHost)

	// register metrics
	if m.Metrics.Listener != "" {
		registry, err := m.getMetricsRegistry()
		if err != nil {
			return nil, nil, errcode.ErrIPFSInit.Wrap(err)
		}

		err = registry.Register(ipfsutil.NewBandwidthCollector(m.Node.Protocol.ipfsNode.Reporter))
		if err != nil {
			return nil, nil, errcode.ErrIPFSInit.Wrap(err)
		}
	}

	logger.Debug("local PeerID", logutil.PrivateString("PeerID", m.Node.Protocol.ipfsNode.Identity.String()))

	return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
}

func (m *Manager) setupIPFSRepo(ctx context.Context) (*ipfs_mobile.RepoMobile, error) {
	var err error
	var repo ipfs_repo.Repo

	if m.Datastore.InMemory {
		rootDS, err := m.getRootDatastore()
		if err != nil {
			return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
		}

		ipfsDS := datastoreutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceIPFSDatastore))

		repo, err = ipfsutil.CreateMockedRepo(ipfsDS)
		if err != nil {
			return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
		}

		return ipfs_mobile.NewRepoMobile(":memory:", repo), nil
	}

	storageKey, err := m.GetAccountStorageKey()
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	storageSalt, err := m.GetAccountStorageSalt()
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	dbPath := filepath.Join(m.Datastore.Dir, "ipfs.sqlite")

	repo, err = ipfsutil.LoadRepoFromPath(dbPath, storageKey, storageSalt)
	if err != nil {
		return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
	}

	repo, err = m.resetRepoIdentityIfExpired(ctx, repo, dbPath, storageKey, storageSalt)
	if err != nil {
		return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
	}

	return ipfs_mobile.NewRepoMobile(dbPath, repo), nil
}

func (m *Manager) resetRepoIdentityIfExpired(ctx context.Context, repo ipfs_repo.Repo, dbPath string, storageKey []byte, storageSalt []byte) (ipfs_repo.Repo, error) {
	rootDS, err := m.getRootDatastore()
	if err != nil {
		return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
	}

	lastUpdate := time.Now()
	lastUpdateKey := datastore.NewKey(ipfsIdentityLastUpdateKey)
	lastUpdateRaw, err := rootDS.Get(ctx, lastUpdateKey)
	switch err {
	case nil:
		lastUpdate, err = time.Parse(time.RFC3339Nano, string(lastUpdateRaw))
		if err != nil {
			return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
		}
	case datastore.ErrNotFound:
		// key does not exist, force recreation
		lastUpdate = time.Time{}
	default:
		return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
	}

	rendezvousRotationBase, err := m.GetRendezvousRotationBase()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	if lastUpdate.Before(time.Now().Add(-rendezvousRotationBase)) {
		repo, err = ipfsutil.ResetExistingRepoIdentity(repo, dbPath, storageKey, storageSalt)
		if err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
		lastUpdate = time.Now()
		lastUpdateRaw = []byte(lastUpdate.Format(time.RFC3339Nano))

		if err := rootDS.Put(ctx, lastUpdateKey, lastUpdateRaw); err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	return repo, nil
}

func (m *Manager) setupIPFSConfig(cfg *ipfs_cfg.Config) ([]libp2p.Option, error) {
	p2popts := []libp2p.Option{}

	ctx := m.getContext()

	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.ErrIPFSSetupConfig.Wrap(err)
	}

	rdvpeers, err := m.getRdvpMaddrs()
	if err != nil {
		return nil, errcode.ErrIPFSSetupConfig.Wrap(err)
	}

	cfg.Addresses.Swarm = m.getSwarmAddrs()
	cfg.Bootstrap = m.getBootstrapAddrs()

	if m.Node.Protocol.IPFSAPIListeners != "" {
		cfg.Addresses.API = strings.Split(m.Node.Protocol.IPFSAPIListeners, ",")
	}

	if m.Node.Protocol.Announce != "" {
		cfg.Addresses.Announce = strings.Split(m.Node.Protocol.Announce, ",")
	}

	if m.Node.Protocol.NoAnnounce != "" {
		cfg.Addresses.NoAnnounce = strings.Split(m.Node.Protocol.NoAnnounce, ",")
	}

	if m.Node.Protocol.HighWatermark > 0 {
		cfg.Swarm.ConnMgr.HighWater = m.Node.Protocol.HighWatermark
	}

	if m.Node.Protocol.LowWatermark > 0 {
		cfg.Swarm.ConnMgr.LowWater = m.Node.Protocol.LowWatermark
	}

	if m.Node.Protocol.DisableIPFSNetwork {
		// Disable IP transports
		cfg.Swarm.Transports.Network.QUIC = ipfs_cfg.False
		cfg.Swarm.Transports.Network.TCP = ipfs_cfg.False
		cfg.Swarm.Transports.Network.Websocket = ipfs_cfg.False

		// disable bootstrap
		cfg.Bootstrap = []string{}

		// disable most services
		cfg.AutoNAT.ServiceMode = ipfs_cfg.AutoNATServiceDisabled
		cfg.Pubsub.Enabled = ipfs_cfg.False
		cfg.Swarm.RelayClient.Enabled = ipfs_cfg.False
		cfg.Swarm.RelayService.Enabled = ipfs_cfg.False

		// Disable MDNS
		cfg.Discovery.MDNS.Enabled = false

		// Remove all swarm listeners
		cfg.Addresses.Swarm = []string{}

		return p2popts, nil
	}

	// Setup BLE
	if m.Node.Protocol.Ble.Enable {
		var bleOpt libp2p.Option

		cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, ble.DefaultAddr)
		switch {
		// Java embedded driver (android)
		case m.Node.Protocol.Ble.Driver != nil:
			bleOpt = libp2p.Transport(proximity.NewTransport(ctx, logger, m.Node.Protocol.Ble.Driver))
		// Go embedded driver (ios)
		case ble.Supported:
			bleOpt = libp2p.Transport(proximity.NewTransport(ctx, logger, ble.NewDriver(logger)))
		default:
			logger.Warn("cannot enable BLE on an unsupported platform")
		}
		p2popts = append(p2popts, bleOpt)
	}

	// Setup Android Nearby
	// TODO: fix Android Nearby running with the BLE driver (L2CAP inteferences)
	/*if m.Node.Protocol.Nearby.Enable {
		if m.Node.Protocol.Nearby.Driver != nil {
			cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, m.Node.Protocol.Nearby.Driver.DefaultAddr())
			p2popts = append(p2popts,
				libp2p.Transport(proximity.NewTransport(ctx, logger, m.Node.Protocol.Nearby.Driver)))
		} else {
			logger.Warn("cannot enable Android Nearby on an unsupported platform")
		}
	}*/

	// Setup MC
	if m.Node.Protocol.MultipeerConnectivity {
		if mc.Supported {
			cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, mc.DefaultAddr)
			p2popts = append(p2popts,
				libp2p.Transport(proximity.NewTransport(ctx, logger, mc.NewDriver(logger))),
			)
		} else {
			logger.Warn("cannot enable Multipeer-Connectivity on an unsupported platform")
		}
	}

	// enable mdns
	cfg.Discovery.MDNS.Enabled = false

	// enable auto relay
	if m.Node.Protocol.AutoRelay {
		cfg.Swarm.RelayClient.Enabled = ipfs_cfg.True
	} else {
		cfg.Swarm.RelayClient.Enabled = ipfs_cfg.False
		cfg.Swarm.Transports.Network.Relay = ipfs_cfg.False
	}

	pis, err := m.getStaticRelays()
	if err != nil {
		return nil, errcode.ErrIPFSSetupConfig.Wrap(err)
	}

	if len(pis) > 0 {
		peers := make([]peer.AddrInfo, len(pis))
		for i, p := range pis {
			peers[i] = *p
		}

		p2popts = append(p2popts, libp2p.StaticRelays(peers))
	}

	// prefill peerstore with known rdvp servers
	for _, p := range rdvpeers {
		cfg.Peering.Peers = append(cfg.Peering.Peers, *p)
	}
	// disable main ipfs pubsub
	cfg.Pubsub.Enabled = ipfs_cfg.False

	// @NOTE(gfanton): disable quic transport until find a fix on lte
	cfg.Swarm.Transports.Network.QUIC = ipfs_cfg.False

	// @NOTE(gfanton): disable tcp transport so we can init a custom transport
	// with reusport disable
	cfg.Swarm.Transports.Network.TCP = ipfs_cfg.False
	p2popts = append(p2popts, libp2p.Transport(tcp.NewTCPTransport,
		tcp.DisableReuseport(),
	))

	return p2popts, nil
}

func (m *Manager) configIPFSRouting(h host.Host, r p2p_routing.Routing) error {
	logger, err := m.getLogger()
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	rdvpeers, err := m.getRdvpMaddrs()
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	if m.Metrics.Listener != "" {
		registry, err := m.getMetricsRegistry()
		if err != nil {
			return errcode.ErrIPFSSetupHost.Wrap(err)
		}

		if err = registry.Register(ipfsutil.NewHostCollector(h)); err != nil {
			return errcode.ErrIPFSSetupHost.Wrap(err)
		}
	}

	rng := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec // we need to use math/rand here, but it is seeded from crypto/rand

	// configure tinder drivers
	var drivers []*tinder.Driver

	// localdiscovery driver
	if m.Node.Protocol.TinderLocalDiscoveryDriver {
		m.Node.Protocol.localdisc, err = tinder.NewLocalDiscovery(logger, h, rng)
		if err != nil {
			return errcode.ErrIPFSSetupHost.Wrap(err)
		}

		filter := tinder.PrivateAddrOnly
		if m.Node.Protocol.DisableDiscoverFilterAddrs {
			filter = tinder.NoFilter
		}

		drivers = append(drivers,
			tinder.NewDriverFromUnregisterDiscovery(tinder.LocalDiscoveryName, m.Node.Protocol.localdisc, filter))
	}

	// rdvp driver
	if m.Node.Protocol.TinderRDVPDriver {
		rdvpfilter := tinder.PublicAddrsOnly
		if m.Node.Protocol.DisableDiscoverFilterAddrs {
			rdvpfilter = tinder.NoFilter
		}

		if lenrdvpeers := len(rdvpeers); lenrdvpeers > 0 {
			for _, peer := range rdvpeers {
				h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
				udisc := tinder.NewRendezvousDiscovery(logger, h, peer.ID, rng)

				name := fmt.Sprintf("rdvp#%.6s", peer.ID)

				drivers = append(drivers,
					tinder.NewDriverFromUnregisterDiscovery(name, udisc, rdvpfilter))
			}
		}
	}

	// dht driver
	if m.Node.Protocol.DHT != "none" && m.Node.Protocol.TinderDHTDriver {
		dhtfilter := tinder.PublicAddrsOnly
		if m.Node.Protocol.DisableDiscoverFilterAddrs {
			dhtfilter = tinder.NoFilter
		}

		// dht driver
		drivers = append(drivers, tinder.NewDriverFromRouting("dht", r, dhtfilter))
	}

	serverRng := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec // we need to use math/rand here, but it is seeded from crypto/rand

	backoffstrat := discovery.NewExponentialBackoff(
		m.Node.Protocol.MinBackoff,
		m.Node.Protocol.MaxBackoff,
		discovery.FullJitter,
		time.Second, 5.0, 0, serverRng)

	tinderOpts := &tinder.Opts{
		Logger:                 logger,
		AdvertiseResetInterval: time.Minute * 2,
		FindPeerResetInterval:  time.Minute * 2,
		AdvertiseGracePeriod:   time.Minute,
		BackoffStrategy: &tinder.BackoffOpts{
			StratFactory: backoffstrat,
		},
	}

	m.Node.Protocol.discovery, err = tinder.NewService(tinderOpts, h, drivers...)
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	// @FIXME(gfanton): hacky way to to handle close on context done
	go func() {
		<-m.getContext().Done()

		m.Node.Protocol.discovery.Close()

		if m.Node.Protocol.localdisc != nil {
			m.Node.Protocol.localdisc.Close()
		}

		if m.Node.Protocol.MDNS.Enable && m.Node.Protocol.MDNS.DriverLocker != nil {
			m.Node.Protocol.MDNS.DriverLocker.Unlock()
		}
	}()

	pt, err := ipfsutil.NewPubsubMonitor(logger, h)
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	cacheSize := 100
	dialTimeout := time.Second * 20
	backoffconnector := func(host host.Host) (*discovery.BackoffConnector, error) {
		return discovery.NewBackoffConnector(host, cacheSize, dialTimeout, backoffstrat)
	}

	popts := []pubsub.Option{
		pubsub.WithMessageSigning(true),
		pubsub.WithPeerExchange(true),
		pt.EventTracerOption(),
	}

	var disc p2p_disc.Discovery
	if m.Node.Protocol.TinderDiscover {
		// filter localdiscovery from drivers since pubsub automatically share topic between connected peers
		disc = tinder.NewFilterDriverDiscovery(m.Node.Protocol.discovery, tinder.LocalDiscoveryName)
	} else {
		disc = tinder.DriverDiscovery{
			Discoverer: tinder.NoopDiscovery,
			Advertiser: m.Node.Protocol.discovery,
		}
	}

	rp, err := m.getRotationInterval()
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	disc = tinder.NewRotationDiscovery(disc, rp)
	popts = append(popts, pubsub.WithDiscovery(disc, pubsub.WithDiscoverConnector(backoffconnector)))

	// pubsub.DiscoveryPollInterval = m.Node.Protocol.PollInterval
	m.Node.Protocol.pubsub, err = pubsub.NewGossipSub(m.getContext(), h, popts...)
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	return nil
}

func (m *Manager) getRdvpMaddrs() ([]*peer.AddrInfo, error) {
	m.applyDefaults()

	defaultMaddrs := config.GetDefaultRDVPMaddr()

	if m.Node.Protocol.RdvpMaddrs == "" {
		return nil, nil
	}

	var addrs []string
	for _, v := range strings.Split(m.Node.Protocol.RdvpMaddrs, ",") {
		switch v {
		case KeywordDefault:
			addrs = append(addrs, defaultMaddrs...)
		case KeywordNone:
			return nil, nil
		default:
			addrs = append(addrs, v)
		}
	}

	return ipfsutil.ParseAndResolveMaddrs(m.getContext(), m.initLogger, addrs)
}

func (m *Manager) getStaticRelays() ([]*peer.AddrInfo, error) {
	m.applyDefaults()

	defaultMaddrs := config.Config.P2P.StaticRelays

	var addrs []string
	for _, v := range strings.Split(m.Node.Protocol.RdvpMaddrs, ",") {
		switch v {
		case KeywordDefault:
			addrs = append(addrs, defaultMaddrs...)
		case KeywordNone, "":
			continue
		default:
			addrs = append(addrs, v)
		}
	}

	return ipfsutil.ParseAndResolveMaddrs(m.getContext(), m.initLogger, addrs)
}

func (m *Manager) getBootstrapAddrs() []string {
	if m.Node.Protocol.Bootstrap == "" {
		return nil
	}

	bootstrapAddrs := []string{}
	for _, addr := range strings.Split(m.Node.Protocol.Bootstrap, ",") {
		switch addr {
		case KeywordDefault:
			bootstrapAddrs = append(bootstrapAddrs, ipfs_cfg.DefaultBootstrapAddresses...)
		case KeywordNone, "":
			continue
		default:
			bootstrapAddrs = append(bootstrapAddrs, addr)
		}
	}

	return bootstrapAddrs
}

func (m *Manager) getSwarmAddrs() []string {
	if m.Node.Protocol.SwarmListeners == "" {
		return nil
	}

	swarmAddrs := []string{}
	for _, addr := range strings.Split(m.Node.Protocol.SwarmListeners, ",") {
		switch addr {
		case KeywordDefault:
			swarmAddrs = append(swarmAddrs, ipfsutil.DefaultSwarmListeners...)
		case KeywordNone:
			return nil
		default:
			swarmAddrs = append(swarmAddrs, addr)
		}
	}
	return swarmAddrs
}

func (m *Manager) GetRendezvousRotationBase() (time.Duration, error) {
	if m.Node.Protocol.RendezvousRotationBase < 0 {
		return 0, errcode.ErrInvalidInput.Wrap(fmt.Errorf("rendezvousRotationBase must be positive"))
	}

	return m.Node.Protocol.RendezvousRotationBase, nil
}
