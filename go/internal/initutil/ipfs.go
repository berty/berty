package initutil

import (
	"flag"
	"fmt"
	"io/ioutil"
	mrand "math/rand"
	"net"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	ipfs_mobile "github.com/ipfs-shipyard/gomobile-ipfs/go/pkg/ipfsmobile"
	datastore "github.com/ipfs/go-datastore"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_p2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	peerstore "github.com/libp2p/go-libp2p-core/peerstore"
	p2p_routing "github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	p2p_dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"moul.io/srand"

	nb "berty.tech/berty/v2/go/internal/androidnearby"
	ble "berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/tempdir"
	tor "berty.tech/go-libp2p-tor-transport"
	torcfg "berty.tech/go-libp2p-tor-transport/config"
	ipfswebui "berty.tech/ipfs-webui-packed"
)

// Set the Java Android BLE driver
func (m *Manager) SetBleDriver(d proximity.NativeDriver) {
	m.Node.Protocol.Ble.Driver = d
}

// Set the Java Android Nearby driver
func (m *Manager) SetNBDriver(d proximity.NativeDriver) {
	m.Node.Protocol.Nearby.Driver = d
}

func (m *Manager) SetupLocalIPFSFlags(fs *flag.FlagSet) {
	m.SetupPresetFlags(fs)
	fs.StringVar(&m.Node.Protocol.SwarmListeners, "p2p.swarm-listeners", KeywordDefault, "IPFS swarm listeners")
	fs.StringVar(&m.Node.Protocol.IPFSAPIListeners, "p2p.ipfs-api-listeners", "/ip4/127.0.0.1/tcp/5001", "IPFS API listeners")
	fs.StringVar(&m.Node.Protocol.IPFSWebUIListener, "p2p.webui-listener", ":3999", "IPFS WebUI listener")
	fs.StringVar(&m.Node.Protocol.Announce, "p2p.swarm-announce", "", "IPFS announce addrs")
	fs.StringVar(&m.Node.Protocol.Bootstrap, "p2p.bootstrap", KeywordDefault, "ipfs bootstrap node, `:default:` will set ipfs default bootstrap node")
	fs.StringVar(&m.Node.Protocol.DHT, "p2p.dht", "none", "dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`")
	fs.BoolVar(&m.Node.Protocol.DHTRandomWalk, "p2p.dht-randomwalk", true, "if true dht will have randomwalk enable")
	fs.StringVar(&m.Node.Protocol.NoAnnounce, "p2p.swarm-no-announce", "", "IPFS exclude announce addrs")
	fs.BoolVar(&m.Node.Protocol.MDNS, "p2p.mdns", true, "if true mdns will be enabled")
	fs.BoolVar(&m.Node.Protocol.TinderDHTDriver, "p2p.tinder-dht-driver", true, "if true dht driver will be enable for tinder")
	fs.BoolVar(&m.Node.Protocol.TinderRDVPDriver, "p2p.tinder-rdvp-driver", true, "if true rdvp driver will be enable for tinder")
	fs.StringVar(&m.Node.Protocol.StaticRelays, "p2p.static-relays", KeywordDefault, "list of static relay maddrs, `:default:` will use statics relays from the config")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Minute, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute*10, "maximum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.PollInterval, "p2p.poll-interval", pubsub.DiscoveryPollInterval, "how long the discovery system will waits for more peers")
	fs.StringVar(&m.Node.Protocol.RdvpMaddrs, "p2p.rdvp", KeywordDefault, "list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp")
	fs.BoolVar(&m.Node.Protocol.Ble.Enable, "p2p.ble", ble.Supported, "if true Bluetooth Low Energy will be enabled")
	fs.BoolVar(&m.Node.Protocol.Nearby.Enable, "p2p.nearby", nb.Supported, "if true Android Nearby will be enabled")
	fs.BoolVar(&m.Node.Protocol.MultipeerConnectivity, "p2p.multipeer-connectivity", mc.Supported, "if true Multipeer Connectivity will be enabled")
	fs.StringVar(&m.Node.Protocol.Tor.Mode, "tor.mode", defaultTorMode, "changes the behavior of libp2p regarding tor, see advanced help for more details")
	fs.StringVar(&m.Node.Protocol.Tor.BinaryPath, "tor.binary-path", "", "if set berty will use this external tor binary instead of his builtin one")
	fs.BoolVar(&m.Node.Protocol.DisableIPFSNetwork, "p2p.disable-ipfs-network", false, "disable as much networking feature as possible, useful during development")
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
	m.longHelp = append(m.longHelp, [2]string{
		"-tor.mode=" + TorDisabled,
		"tor is completely disabled",
	})
	m.longHelp = append(m.longHelp, [2]string{
		"-tor.mode=" + TorOptional,
		"tor is added to the list of existing transports and can be used to contact other tor-ready nodes",
	})
	m.longHelp = append(m.longHelp, [2]string{
		"-tor.mode=" + TorRequired,
		"tor is the only available transport; you can only communicate with other tor-ready nodes",
	})
}

func (m *Manager) GetLocalIPFS() (ipfsutil.ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	defer m.prepareForGetter()()
	return m.getLocalIPFS()
}

func (m *Manager) getLocalIPFS() (ipfsutil.ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	m.applyDefaults()
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

	mrepo, err := m.setupIPFSRepo()
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	var dhtmode p2p_dht.ModeOpt = 0
	switch m.Node.Protocol.DHT {
	case "client":
		dhtmode = p2p_dht.ModeClient
	case "server":
		dhtmode = p2p_dht.ModeServer
	case "auto":
		dhtmode = p2p_dht.ModeAuto
	case "autoserver":
		dhtmode = p2p_dht.ModeAutoServer
	case "none": // 0
	default:
		err := fmt.Errorf("invalid dht mode")
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}

	var routing ipfs_p2p.RoutingOption
	if dhtmode > 0 {
		dhtopts := []p2p_dht.Option{p2p_dht.Concurrency(2)}
		if m.Node.Protocol.DHTRandomWalk {
			dhtopts = append(dhtopts, p2p_dht.DisableAutoRefresh())
		}
		routing = ipfsutil.CustomRoutingOption(dhtmode, dhtopts...)
	} else {
		routing = ipfs_p2p.NilRouterOption
	}

	mopts := ipfsutil.MobileOptions{
		IpfsConfigPatch: m.setupIPFSConfig,
		// HostConfigFunc:    m.setupIPFSHost,
		RoutingConfigFunc: m.configIPFSRouting,
		RoutingOption:     routing,
		ExtraOpts: map[string]bool{
			// @NOTE(gfanton) temporally disable ipfs *main* pubsub
			"pubsub": false,
		},
	}

	// init ipfs node
	mnode, err := ipfsutil.NewIPFSMobile(m.getContext(), mrepo, &mopts)
	if err != nil {
		return nil, nil, errcode.ErrIPFSInit.Wrap(err)
	}
	m.Node.Protocol.ipfsNode = mnode.IpfsNode

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
			return nil, nil, errcode.ErrIPFSInit.Wrap(fmt.Errorf("unable to parse api addr `%s`: %w", addr, err))
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
	m.Node.Protocol.ipfsAPI = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(m.Node.Protocol.ipfsAPI, psapi)

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

	return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
}

func (m *Manager) setupIPFSRepo() (*ipfs_mobile.RepoMobile, error) {
	var err error
	var repo ipfs_repo.Repo

	if m.Datastore.InMemory {
		rootDS, err := m.getRootDatastore()
		if err != nil {
			return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
		}

		ipfsDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceIPFSDatastore))

		repo, err = ipfsutil.CreateMockedRepo(ipfsDS)
		if err != nil {
			return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
		}

		return ipfs_mobile.NewRepoMobile(":memory:", repo), nil
	}

	repopath := filepath.Join(m.Datastore.Dir, "ipfs")

	repo, err = ipfsutil.LoadRepoFromPath(repopath)
	if err != nil {
		return nil, errcode.ErrIPFSSetupRepo.Wrap(err)
	}

	return ipfs_mobile.NewRepoMobile(repopath, repo), nil
}

func (m *Manager) setupIPFSConfig(cfg *ipfs_cfg.Config) ([]libp2p.Option, error) {
	p2popts := []libp2p.Option{}

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

	if m.Node.Protocol.DisableIPFSNetwork {
		// Disable IP transports
		cfg.Swarm.Transports.Network.QUIC = ipfs_cfg.False
		cfg.Swarm.Transports.Network.TCP = ipfs_cfg.False
		cfg.Swarm.Transports.Network.Websocket = ipfs_cfg.False

		// Disable MDNS
		cfg.Discovery.MDNS.Enabled = false

		// Remove all swarm listeners
		cfg.Addresses.Swarm = []string{}

		return p2popts, nil
	}

	// tor is enabled (optional or required)
	if m.torIsEnabled() {
		torOpts := torcfg.Merge(
			torcfg.SetTemporaryDirectory(tempdir.TempDir()),
			// FIXME: Write an io.Writer to zap logger mapper.
			torcfg.SetNodeDebug(ioutil.Discard),
		)
		if m.Node.Protocol.Tor.BinaryPath == "" {
			torOpts = torcfg.Merge(torOpts, torcfg.EnableEmbeded)
		} else {
			torOpts = torcfg.Merge(torOpts, torcfg.SetBinaryPath(m.Node.Protocol.Tor.BinaryPath))
		}

		if !hasTorMaddr(cfg.Addresses.Swarm) {
			cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, tor.NopMaddr3Str)
		}

		if m.Node.Protocol.Tor.Mode == TorRequired {
			torOpts = torcfg.Merge(torOpts, torcfg.AllowTcpDial)
		}

		torBuilder, err := tor.NewBuilder(torOpts)
		if err != nil {
			return nil, errcode.ErrIPFSSetupConfig.Wrap(err)
		}

		p2popts = append(p2popts, libp2p.Transport(torBuilder))
	}

	// -tor.mode==required: disable everything except tor
	if m.Node.Protocol.Tor.Mode == TorRequired {
		// Patch the IPFS config to make it complient with an anonymous node.
		// Disable IP transports
		cfg.Swarm.Transports.Network.QUIC = ipfs_cfg.False
		cfg.Swarm.Transports.Network.TCP = ipfs_cfg.False
		cfg.Swarm.Transports.Network.Websocket = ipfs_cfg.False

		// Disable MDNS
		cfg.Discovery.MDNS.Enabled = false

		// Only keep tor listeners
		cfg.Addresses.Swarm = []string{}
		for _, maddr := range cfg.Addresses.Swarm {
			if isTorMaddr(maddr) {
				cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, maddr)
			}
		}
	}

	// Setup BLE
	if m.Node.Protocol.Ble.Enable {
		var bleOpt libp2p.Option

		cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, ble.DefaultAddr)
		switch {
		// Java embedded driver (android)
		case m.Node.Protocol.Ble.Driver != nil:
			bleOpt = libp2p.Transport(proximity.NewTransport(m.ctx, logger, m.Node.Protocol.Ble.Driver))
		// Go embedded driver (ios)
		case ble.Supported:
			bleOpt = libp2p.Transport(proximity.NewTransport(m.ctx, logger, ble.NewDriver(logger)))
		default:
			logger.Warn("cannot enable BLE on an unsupported platform")
		}
		p2popts = append(p2popts, bleOpt)
	}

	// Setup Android Nearby
	if m.Node.Protocol.Nearby.Enable {
		if m.Node.Protocol.Nearby.Driver != nil {
			cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, m.Node.Protocol.Nearby.Driver.DefaultAddr())
			p2popts = append(p2popts,
				libp2p.Transport(proximity.NewTransport(m.ctx, logger, m.Node.Protocol.Nearby.Driver)))
		} else {
			logger.Warn("cannot enable Android Nearby on an unsupported platform")
		}
	}

	// Setup MC
	if m.Node.Protocol.MultipeerConnectivity {
		if mc.Supported {
			cfg.Addresses.Swarm = append(cfg.Addresses.Swarm, mc.DefaultAddr)
			p2popts = append(p2popts,
				libp2p.Transport(proximity.NewTransport(m.ctx, logger, mc.NewDriver(logger))),
			)
		} else {
			logger.Warn("cannot enable Multipeer-Connectivity on an unsupported platform")
		}
	}

	// localdisc driver
	if !m.Node.Protocol.MDNS {
		cfg.Discovery.MDNS.Enabled = false
	}

	// enable autorelay
	p2popts = append(p2popts, libp2p.ListenAddrs(), libp2p.EnableAutoRelay(), libp2p.ForceReachabilityPrivate())

	pis, err := m.getStaticRelays()
	if err != nil {
		return nil, errcode.ErrIPFSSetupConfig.Wrap(err)
	}

	cfg.Reprovider.Strategy = "pinned"

	if len(pis) > 0 {
		peers := make([]peer.AddrInfo, len(pis))
		for i, p := range pis {
			peers[i] = *p
		}

		p2popts = append(p2popts, libp2p.StaticRelays(peers))
	}

	// prefill peerstore with known rdvp servers
	if m.Node.Protocol.Tor.Mode != TorRequired {
		for _, p := range rdvpeers {
			cfg.Peering.Peers = append(cfg.Peering.Peers, *p)
		}
	}

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

	// rdvp driver
	if m.Node.Protocol.TinderRDVPDriver {
		if lenrdvpeers := len(rdvpeers); lenrdvpeers > 0 {
			for _, peer := range rdvpeers {
				h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
				udisc := tinder.NewRendezvousDiscovery(logger, h, peer.ID, rng)

				name := fmt.Sprintf("rdvp#%.6s", peer.ID)
				drivers = append(drivers,
					tinder.NewDriverFromUnregisterDiscovery(name, udisc, tinder.FilterPublicAddrs))
			}
		}
	}

	// dht driver
	if m.Node.Protocol.DHT != "none" && m.Node.Protocol.TinderDHTDriver {
		// dht driver
		drivers = append(drivers, tinder.NewDriverFromRouting("dht", r, nil))
	}

	// localdisc driver
	// @TODO(gfanton): check if this is useful
	// if m.Node.Protocol.MDNS {
	// 	localdisc := tinder.NewLocalDiscovery(logger, h, rng)
	// 	drivers = append(drivers,
	// 		tinder.NewDriverFromUnregisterDiscovery("localdisc", localdisc, tinder.FilterPrivateAddrs))
	// }

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

	// pubsub.DiscoveryPollInterval = m.Node.Protocol.PollInterval
	m.Node.Protocol.pubsub, err = pubsub.NewGossipSub(m.getContext(), h,
		pubsub.WithMessageSigning(true),
		pubsub.WithDiscovery(m.Node.Protocol.discovery,
			pubsub.WithDiscoverConnector(backoffconnector)),
		pubsub.WithPeerExchange(true),
		pt.EventTracerOption(),
	)

	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	return nil
}

func (m *Manager) getRdvpMaddrs() ([]*peer.AddrInfo, error) {
	m.applyDefaults()

	var defaultMaddrs []string
	{
		i := len(config.Config.P2P.RDVP)
		defaultMaddrs = make([]string, i)
		for i > 0 {
			i--
			defaultMaddrs[i] = config.Config.P2P.RDVP[i].Maddr
		}
	}

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

func isTorMaddr(maddr string) bool {
	parsed, err := ma.NewMultiaddr(maddr)
	if err != nil {
		// This error is not our business and will be dealt later.
		return false
	}

	protos := parsed.Protocols()
	if len(protos) == 0 {
		return false
	}

	proto := protos[0].Code
	if proto == ma.P_ONION3 || proto == ma.P_ONION {
		return true
	}
	return false
}

func hasTorMaddr(maddrs []string) bool {
	// Scan all maddrs to see if an `/onion{,3}/*` were set, if don't auto add the `tor.NopMaddr3Str`.
	for _, maddr := range maddrs {
		if isTorMaddr(maddr) {
			return true
		}
	}
	return false
}

func (m *Manager) torIsEnabled() bool {
	switch m.Node.Protocol.Tor.Mode {
	case TorOptional, TorRequired:
		return true
	}
	return false
}
