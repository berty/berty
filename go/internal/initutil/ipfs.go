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
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
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
	fs.StringVar(&m.Node.Protocol.SwarmListeners, "p2p.swarm-listeners", ":default:", "IPFS swarm listeners")
	fs.StringVar(&m.Node.Protocol.IPFSAPIListeners, "p2p.ipfs-api-listeners", "/ip4/127.0.0.1/tcp/5001", "IPFS API listeners")
	fs.StringVar(&m.Node.Protocol.IPFSWebUIListener, "p2p.webui-listener", ":3999", "IPFS WebUI listener")
	fs.StringVar(&m.Node.Protocol.Announce, "p2p.swarm-announce", "", "IPFS announce addrs")
	fs.StringVar(&m.Node.Protocol.NoAnnounce, "p2p.swarm-no-announce", "", "IPFS exclude announce addrs")
	fs.BoolVar(&m.Node.Protocol.LocalDiscovery, "p2p.local-discovery", true, "if true local discovery will be enabled")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute, "maximum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.PollInterval, "p2p.poll-interval", pubsub.DiscoveryPollInterval, "how long the discovery system will waits for more peers")
	fs.StringVar(&m.Node.Protocol.RdvpMaddrs, "p2p.rdvp", ":default:", `list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp`)
	fs.BoolVar(&m.Node.Protocol.Ble.Enable, "p2p.ble", ble.Supported, "if true Bluetooth Low Energy will be enabled")
	fs.BoolVar(&m.Node.Protocol.Nearby.Enable, "p2p.nearby", nb.Supported, "if true Android Nearby will be enabled")
	fs.BoolVar(&m.Node.Protocol.MultipeerConnectivity, "p2p.multipeer-connectivity", mc.Supported, "if true Multipeer Connectivity will be enabled")
	fs.StringVar(&m.Node.Protocol.Tor.Mode, "tor.mode", defaultTorMode, "changes the behavior of libp2p regarding tor, see advanced help for more details")
	fs.StringVar(&m.Node.Protocol.Tor.BinaryPath, "tor.binary-path", "", "if set berty will use this external tor binary instead of his builtin one")
	fs.BoolVar(&m.Node.Protocol.DisableIPFSNetwork, "p2p.disable-ipfs-network", false, "disable as much networking feature as possible, useful during development")
	fs.BoolVar(&m.Node.Protocol.RelayHack, "p2p.relay-hack", false, "*temporary flag*; if set, Berty will use relays from the config optimistically")

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

	mopts := ipfsutil.MobileOptions{
		IpfsConfigPatch: m.setupIPFSConfig,
		HostConfigFunc:  m.setupIPFSHost,
		RoutingOption:   ipfsutil.CustomRoutingOption(p2p_dht.ModeClient, p2p_dht.Concurrency(2)),
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
	cfg.Bootstrap = ipfs_cfg.DefaultBootstrapAddresses

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
			m.initLogger.Warn("cannot enable BLE on an unsupported platform")
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
			m.initLogger.Warn("cannot enable Android Nearby on an unsupported platform")
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
			m.initLogger.Warn("cannot enable Multipeer-Connectivity on an unsupported platform")
		}
	}

	if m.Node.Protocol.RelayHack {
		// Resolving addresses
		pis, err := ipfsutil.ParseAndResolveRdvpMaddrs(m.getContext(), m.initLogger, config.Config.P2P.RelayHack)
		if err != nil {
			return nil, errcode.ErrIPFSSetupConfig.Wrap(err)
		}

		lenPis := len(pis)
		pickFrom := make([]peer.AddrInfo, lenPis)
		for lenPis > 0 {
			lenPis--
			pickFrom[lenPis] = *pis[lenPis]
		}

		// Selecting 2 random one
		rng := mrand.New(mrand.NewSource(srand.SafeFast())) //nolint:gosec
		var relays []peer.AddrInfo
		if len(pickFrom) <= 2 {
			relays = pickFrom
		} else {
			for i := 2; i > 0; i-- {
				lenPickFrom := len(pickFrom)
				n := rng.Intn(lenPickFrom)
				relays = append(relays, pickFrom[n])
				if n == 0 {
					pickFrom = pickFrom[1:]
					continue
				}
				if n == lenPickFrom-1 {
					pickFrom = pickFrom[:n-1]
					continue
				}
				pickFrom = append(pickFrom[:n], pickFrom[n+1:]...)
			}
		}

		for _, relay := range relays {
			for _, addr := range relay.Addrs {
				cfg.Addresses.Announce = append(cfg.Addresses.Announce, addr.String()+"/p2p/"+relay.ID.String()+"/p2p-circuit")
			}
		}

		p2popts = append(p2popts, libp2p.StaticRelays(relays))
	}

	// prefill peerstore with known rdvp servers
	if m.Node.Protocol.Tor.Mode != TorRequired {
		for _, p := range rdvpeers {
			cfg.Peering.Peers = append(cfg.Peering.Peers, *p)
		}
	}

	return p2popts, nil
}

func (m *Manager) setupIPFSHost(h host.Host) error {
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

	var rdvClients []tinder.AsyncableDriver
	if lenrdvpeers := len(rdvpeers); lenrdvpeers > 0 {
		drivers := make([]tinder.AsyncableDriver, lenrdvpeers)
		for i, peer := range rdvpeers {
			h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
			rng := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec // we need to use math/rand here, but it is seeded from crypto/rand
			disc := tinder.NewRendezvousDiscovery(logger, h, peer.ID, rng)

			// monitor this driver
			disc, err := tinder.MonitorDriverAsync(logger, h, disc)
			if err != nil {
				return errcode.ErrIPFSSetupHost.Wrap(err)
			}

			drivers[i] = disc
		}
		rdvClients = append(rdvClients, drivers...)
	}

	var rdvClient tinder.UnregisterDiscovery
	switch len(rdvClients) {
	case 0:
		// FIXME: Check if this isn't called when DisableIPFSNetwork true.
		return errcode.ErrIPFSSetupHost.Wrap(fmt.Errorf("can't create an IPFS node without any discovery"))
	case 1:
		rdvClient = rdvClients[0]
	default:
		rdvClient = tinder.NewAsyncMultiDriver(logger, rdvClients...)
	}

	serverRng := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec // we need to use math/rand here, but it is seeded from crypto/rand
	m.Node.Protocol.discovery, err = tinder.NewService(
		logger,
		rdvClient,
		discovery.NewExponentialBackoff(m.Node.Protocol.MinBackoff, m.Node.Protocol.MaxBackoff, discovery.FullJitter, time.Second, 5.0, 0, serverRng),
	)
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	pt, err := ipfsutil.NewPubsubMonitor(logger, h)
	if err != nil {
		return errcode.ErrIPFSSetupHost.Wrap(err)
	}

	pubsub.DiscoveryPollInterval = m.Node.Protocol.PollInterval
	m.Node.Protocol.pubsub, err = pubsub.NewGossipSub(m.getContext(), h,
		pubsub.WithMessageSigning(true),
		pubsub.WithFloodPublish(true),
		pubsub.WithDiscovery(m.Node.Protocol.discovery),
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
		case ":default:":
			addrs = append(addrs, defaultMaddrs...)
		case ":none:":
			return nil, nil
		default:
			addrs = append(addrs, v)
		}
	}

	return ipfsutil.ParseAndResolveRdvpMaddrs(m.getContext(), m.initLogger, addrs)
}

func (m *Manager) getSwarmAddrs() []string {
	if m.Node.Protocol.SwarmListeners == "" {
		return nil
	}

	swarmAddrs := []string{}
	for _, addr := range strings.Split(m.Node.Protocol.SwarmListeners, ",") {
		switch addr {
		case ":default:":
			swarmAddrs = append(swarmAddrs, ipfsutil.DefaultSwarmListeners...)
		case ":none:":
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
