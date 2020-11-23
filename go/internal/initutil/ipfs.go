package initutil

import (
	"flag"
	"fmt"
	"io/ioutil"
	mrand "math/rand"
	"path/filepath"
	"strings"
	"time"

	datastore "github.com/ipfs/go-datastore"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"moul.io/srand"

	ble "berty.tech/berty/v2/go/internal/ble-driver"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	proximity "berty.tech/berty/v2/go/internal/proximity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/tempdir"
	tor "berty.tech/go-libp2p-tor-transport"
	torcfg "berty.tech/go-libp2p-tor-transport/config"
)

func (m *Manager) SetupLocalIPFSFlags(fs *flag.FlagSet) {
	m.SetupPresetFlags(fs)
	fs.StringVar(&m.Node.Protocol.SwarmListeners, "p2p.swarm-listeners", ":default:", "IPFS swarm listeners")
	fs.StringVar(&m.Node.Protocol.IPFSAPIListeners, "p2p.ipfs-api-listeners", "", "IPFS API listeners")
	fs.StringVar(&m.Node.Protocol.Announce, "p2p.swarm-announce", "", "IPFS announce addrs")
	fs.StringVar(&m.Node.Protocol.NoAnnounce, "p2p.swarm-no-announce", "", "IPFS exclude announce addrs")
	fs.BoolVar(&m.Node.Protocol.LocalDiscovery, "p2p.local-discovery", true, "if true local discovery will be enabled")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute, "maximum p2p backoff duration")
	fs.StringVar(&m.Node.Protocol.RdvpMaddrs, "p2p.rdvp", ":default:", `list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp`)
	fs.BoolVar(&m.Node.Protocol.Ble, "p2p.ble", ble.Supported, "if true Bluetooth Low Energy will be enabled")
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
		return nil, nil, errcode.TODO.Wrap(err)
	}

	if m.Node.Protocol.ipfsAPI != nil {
		if m.Node.Protocol.ipfsNode == nil {
			return nil, nil, errcode.TODO.Wrap(fmt.Errorf("already connected to a remote IPFS node"))
		}

		return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	rdvpeers, err := m.getRdvpMaddrs()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	swarmAddrs := m.getSwarmAddrs()

	apiAddrs := []string{}
	if m.Node.Protocol.IPFSAPIListeners != "" {
		apiAddrs = strings.Split(m.Node.Protocol.IPFSAPIListeners, ",")
	}

	announce := []string{}
	if m.Node.Protocol.Announce != "" {
		announce = strings.Split(m.Node.Protocol.Announce, ",")
	}

	noannounce := []string{}
	if m.Node.Protocol.NoAnnounce != "" {
		noannounce = strings.Split(m.Node.Protocol.NoAnnounce, ",")
	}

	var (
		ipfsConfigPatch ipfsutil.IpfsConfigPatcher
		p2pOpts         libp2p.Option
	)
	if !m.Node.Protocol.DisableIPFSNetwork {
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

			if !hasTorMaddr(swarmAddrs) {
				swarmAddrs = append(swarmAddrs, tor.NopMaddr3Str)
			}

			if m.Node.Protocol.Tor.Mode == TorRequired {
				torOpts = torcfg.Merge(torOpts, torcfg.AllowTcpDial)
			}
			torBuilder, err := tor.NewBuilder(torOpts)
			if err != nil {
				return nil, nil, errcode.TODO.Wrap(err)
			}
			p2pOpts = libp2p.ChainOptions(p2pOpts, libp2p.Transport(torBuilder))
		}
		// -tor.mode==required: disable everything except tor
		if m.Node.Protocol.Tor.Mode == TorRequired {
			// Patch the IPFS config to make it complient with an anonymous node.
			ipfsConfigPatch = func(c *ipfs_cfg.Config) error {
				// Disable IP transports
				c.Swarm.Transports.Network.QUIC = ipfs_cfg.False
				c.Swarm.Transports.Network.TCP = ipfs_cfg.False
				c.Swarm.Transports.Network.Websocket = ipfs_cfg.False

				// Disable MDNS
				c.Discovery.MDNS.Enabled = false

				// Only keep tor listeners
				c.Addresses.Swarm = []string{}
				for _, maddr := range swarmAddrs {
					if isTorMaddr(maddr) {
						c.Addresses.Swarm = append(c.Addresses.Swarm, maddr)
					}
				}
				return nil
			}
		}

		// Setup BLE
		if m.Node.Protocol.Ble {
			swarmAddrs = append(swarmAddrs, ble.DefaultAddr)
			bleOpt := libp2p.Transport(proximity.NewTransport(m.ctx, logger, ble.NewDriver(logger)))
			p2pOpts = libp2p.ChainOptions(p2pOpts, bleOpt)
		}

		// Setup MC
		if m.Node.Protocol.MultipeerConnectivity {
			if mc.Supported {
				swarmAddrs = append(swarmAddrs, mc.DefaultAddr)
				p2pOpts = libp2p.ChainOptions(p2pOpts,
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
				return nil, nil, errcode.TODO.Wrap(err)
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
					announce = append(announce, addr.String()+"/p2p/"+relay.ID.String()+"/p2p-circuit")
				}
			}

			p2pOpts = libp2p.ChainOptions(p2pOpts, libp2p.StaticRelays(relays))
		}

		// prefill peerstore with known rdvp servers
		if m.Node.Protocol.Tor.Mode != TorRequired {
			ipfsConfigPatch = ipfsutil.ChainIpfsConfigPatch(ipfsConfigPatch, func(cfg *ipfs_cfg.Config) error {
				for _, p := range rdvpeers {
					cfg.Peering.Peers = append(cfg.Peering.Peers, *p)
				}
				return nil
			})
		}
	} else {
		ipfsConfigPatch = func(c *ipfs_cfg.Config) error {
			// Disable IP transports
			c.Swarm.Transports.Network.QUIC = ipfs_cfg.False
			c.Swarm.Transports.Network.TCP = ipfs_cfg.False
			c.Swarm.Transports.Network.Websocket = ipfs_cfg.False

			// Disable MDNS
			c.Discovery.MDNS.Enabled = false

			// Remove all swarm listeners
			c.Addresses.Swarm = []string{}
			return nil
		}
	}

	opts := ipfsutil.CoreAPIConfig{
		SwarmAddrs: swarmAddrs,
		APIAddrs:   apiAddrs,
		APIConfig: ipfs_cfg.API{
			HTTPHeaders: map[string][]string{
				"Access-Control-Allow-Origin":  {"*"},
				"Access-Control-Allow-Methods": {"POST", "PUT"},
			},
		},
		Announce:          announce,
		NoAnnounce:        noannounce,
		DisableCorePubSub: true,
		BootstrapAddrs:    ipfs_cfg.DefaultBootstrapAddresses,
		ExtraLibp2pOption: p2pOpts,
		IpfsConfigPatch:   ipfsConfigPatch,
		HostConfig: func(h host.Host, _ routing.Routing) error {
			var err error

			if m.Metrics.Listener != "" {
				registry, err := m.getMetricsRegistry()
				if err != nil {
					return err
				}

				if err = registry.Register(ipfsutil.NewHostCollector(h)); err != nil {
					return err
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
						return errors.Wrap(err, "unable to monitor discovery driver")
					}

					drivers[i] = disc
				}
				rdvClients = append(rdvClients, drivers...)
			}

			var rdvClient tinder.Driver
			switch len(rdvClients) {
			case 0:
				// FIXME: Check if this isn't called when DisableIPFSNetwork true.
				return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't create an IPFS node without any discovery"))
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
				return err
			}

			pt, err := ipfsutil.NewPubsubMonitor(logger, h)
			if err != nil {
				return err
			}
			m.Node.Protocol.pubsub, err = pubsub.NewGossipSub(m.getContext(), h,
				pubsub.WithMessageSigning(true),
				pubsub.WithFloodPublish(true),
				pubsub.WithDiscovery(m.Node.Protocol.discovery),
				pubsub.WithPeerExchange(true),
				pt.EventTracerOption(),
			)
			if err != nil {
				return err
			}

			return nil
		},
	}

	// FIXME: continue disabling things to speedup the node when DisableIPFSNetwork==true
	if m.Datastore.InMemory {
		rootDS, err := m.getRootDatastore()
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}

		ipfsDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceIPFSDatastore))

		m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, err = ipfsutil.NewCoreAPIFromDatastore(m.getContext(), ipfsDS, &opts)
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}
	} else {
		repopath := filepath.Join(m.Datastore.Dir, "ipfs")
		repo, err := ipfsutil.LoadRepoFromPath(repopath)
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}

		m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, err = ipfsutil.NewCoreAPIFromRepo(m.getContext(), repo, &opts)
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}
	}

	// PubSub
	psapi := ipfsutil.NewPubSubAPI(m.getContext(), logger.Named("ps"), m.Node.Protocol.discovery, m.Node.Protocol.pubsub)
	m.Node.Protocol.ipfsAPI = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(m.Node.Protocol.ipfsAPI, psapi)

	// enable conn logger
	ipfsutil.EnableConnLogger(m.getContext(), logger, m.Node.Protocol.ipfsNode.PeerHost)

	// register metrics
	if m.Metrics.Listener != "" {
		registry, err := m.getMetricsRegistry()
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}

		err = registry.Register(ipfsutil.NewBandwidthCollector(m.Node.Protocol.ipfsNode.Reporter))
		if err != nil {
			return nil, nil, errcode.TODO.Wrap(err)
		}
	}

	return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
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
