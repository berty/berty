package initutil

import (
	"flag"
	"fmt"
	mrand "math/rand"
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
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/tempdir"
	tor "berty.tech/go-libp2p-tor-transport"
	torcfg "berty.tech/go-libp2p-tor-transport/config"
)

func (m *Manager) SetupLocalIPFSFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.Protocol.IPFSListeners, "p2p.ipfs-listeners", "/ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic", "IPFS listeners")
	fs.StringVar(&m.Node.Protocol.IPFSAPIListeners, "p2p.ipfs-api-listeners", "", "IPFS API listeners")
	fs.StringVar(&m.Node.Protocol.Announce, "p2p.ipfs-announce", "", "IPFS announce addrs")

	fs.StringVar(&m.Node.Protocol.NoAnnounce, "p2p.ipfs-no-announce", "", "IPFS exclude announce addrs")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute, "maximum p2p backoff duration")
	fs.BoolVar(&m.Node.Protocol.LocalDiscovery, "p2p.local-discovery", true, "local discovery")
	fs.Var(&m.Node.Protocol.RdvpMaddrs, "p2p.rdvp", `list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp`)
	fs.BoolVar(&m.Node.Protocol.Tor.Enabled, "tor.enable", defaultTorEnabliness, "if true tor will be enabled")
	fs.StringVar(&m.Node.Protocol.Tor.BinaryPath, "tor.binary-path", "", "if set berty will use this external tor binary instead of his builtin one")
	// FIXME: Create a custom command for help and listing about presets, they will quickly get crowded here.
	fs.Var(&m.Node.Preset, "preset", `if set berty will use a preset instead of the default one. Curently only "anonymity" is available.`)
}

func (m *Manager) GetLocalIPFS() (ipfsutil.ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	return m.getLocalIPFS()
}

func (m *Manager) getLocalIPFS() (ipfsutil.ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
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

	rootDS, err := m.getRootDatastore()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	rdvpeers, err := m.getRdvpMaddrs()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	ipfsDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceIPFSDatastore))

	swarmAddrs := []string{}
	if m.Node.Protocol.IPFSListeners != "" {
		swarmAddrs = strings.Split(m.Node.Protocol.IPFSListeners, ",")
	}

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

	// Tor
	var p2pOpts libp2p.Option
	var ipfsConfigPatch ipfsutil.IpfsConfigPatcher
	{
		setListenTor := true
		// Scan all maddrs to see if an `/onion{,3}/*` were set, if don't auto add the `tor.NopMaddr3Str`.
		for _, v := range swarmAddrs {
			maddr, err := ma.NewMultiaddr(v)
			if err != nil {
				// This error is not our business and will be dealt later.
				continue
			}
			protos := maddr.Protocols()
			if len(protos) == 0 {
				continue
			}
			if proto := protos[0].Code; proto == ma.P_ONION3 || proto == ma.P_ONION {
				setListenTor = false
				break
			}
		}
		if m.Node.Preset == PresetAnonymity {
			// Force tor in this mode
			m.Node.Protocol.Tor.Enabled = true
			// Disable local discovery
			m.Node.Protocol.LocalDiscovery = false
			// Patch the IPFS config to make it complient with an anonymous node.
			ipfsConfigPatch = func(c *ipfs_cfg.Config) error {
				// Disable IP transports
				c.Swarm.Transports.Network.QUIC = ipfs_cfg.False
				c.Swarm.Transports.Network.TCP = ipfs_cfg.False
				c.Swarm.Transports.Network.Websocket = ipfs_cfg.False

				// Disable MDNS
				c.Discovery.MDNS.Enabled = false

				// Replace listens
				if setListenTor {
					c.Addresses.Swarm = []string{tor.NopMaddr3Str}
				} else {
					c.Addresses.Swarm = nil
				}
				return nil
			}
		}
		if !m.Node.Protocol.DisableIPFSNetwork {
			if m.Node.Protocol.Tor.Enabled {
				torOpts := torcfg.SetTemporaryDirectory(tempdir.TempDir())
				if m.Node.Protocol.Tor.BinaryPath == "" {
					torOpts = torcfg.Merge(torOpts, torcfg.EnableEmbeded)
				} else {
					torOpts = torcfg.Merge(torOpts, torcfg.SetBinaryPath(m.Node.Protocol.Tor.BinaryPath))
				}

				if setListenTor {
					swarmAddrs = append(swarmAddrs, tor.NopMaddr3Str)
				}

				// If we allow AnonymityMode allow tcp dial.
				if m.Node.Preset == PresetAnonymity {
					torOpts = torcfg.Merge(torOpts, torcfg.AllowTcpDial)
				}
				torBuilder, err := tor.NewBuilder(torOpts)
				if err != nil {
					return nil, nil, errcode.TODO.Wrap(err)
				}
				p2pOpts = libp2p.Transport(torBuilder)
			}

			// Setup MC
			if m.Node.Preset != PresetAnonymity {
				mcOpt := libp2p.Transport(mc.NewTransportConstructorWithLogger(logger))
				if p2pOpts == nil {
					p2pOpts = mcOpt
				} else {
					p2pOpts = libp2p.ChainOptions(p2pOpts, mcOpt)
				}
			}
		}
	}

	opts := ipfsutil.CoreAPIConfig{
		SwarmAddrs:        swarmAddrs,
		APIAddrs:          apiAddrs,
		APIConfig:         config.BertyDev.APIConfig,
		Announce:          announce,
		NoAnnounce:        noannounce,
		DisableCorePubSub: true,
		BootstrapAddrs:    config.BertyDev.Bootstrap,
		ExtraLibp2pOption: p2pOpts,
		IpfsConfigPatch: ipfsutil.ChainIpfsConfigPatch(ipfsConfigPatch, func(cfg *ipfs_cfg.Config) error {
			for _, p := range rdvpeers {
				cfg.Peering.Peers = append(cfg.Peering.Peers, *p)
			}

			return nil
		}),
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
					drivers[i] = tinder.NewRendezvousDiscovery(logger, h, peer.ID, rng)
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

			m.Node.Protocol.pubsub, err = pubsub.NewGossipSub(m.ctx, h,
				pubsub.WithMessageSigning(true),
				pubsub.WithFloodPublish(true),
				pubsub.WithDiscovery(m.Node.Protocol.discovery),
				pubsub.WithPeerExchange(true),
			)
			if err != nil {
				return err
			}

			return nil
		},
	}
	// FIXME: continue disabling things to speedup the node when DisableIPFSNetwork==true

	m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, err = ipfsutil.NewCoreAPIFromDatastore(m.ctx, ipfsDS, &opts)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	// PubSub
	psapi := ipfsutil.NewPubSubAPI(m.ctx, logger.Named("ps"), m.Node.Protocol.discovery, m.Node.Protocol.pubsub)
	m.Node.Protocol.ipfsAPI = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(m.Node.Protocol.ipfsAPI, psapi)

	// enable conn logger
	ipfsutil.EnableConnLogger(m.ctx, logger, m.Node.Protocol.ipfsNode.PeerHost)

	// register metrics
	if m.Metrics.Listener != "" {
		registry, err := m.getMetricsRegistry()
		if err != nil {
			return nil, nil, err
		}

		err = registry.Register(ipfsutil.NewBandwidthCollector(m.Node.Protocol.ipfsNode.Reporter))
		if err != nil {
			return nil, nil, err
		}
	}

	return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
}

func (m *Manager) getRdvpMaddrs() ([]*peer.AddrInfo, error) {
	_, err := m.getLogger() // ensure logger is initialized
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	var addrs []string
	if len(m.Node.Protocol.RdvpMaddrs) == 0 {
		addrs = config.BertyDev.RendezVousPeers
	} else {
		for _, v := range m.Node.Protocol.RdvpMaddrs {
			if v == ":dev:" {
				addrs = append(addrs, config.BertyDev.RendezVousPeers...)
				continue
			}
			if v == ":none:" {
				m.initLogger.Debug("no rendezvous peer set")
				return nil, nil
			}
			addrs = append(addrs, v)
		}
	}

	return ipfsutil.ParseAndResolveRdvpMaddrs(m.ctx, m.initLogger, addrs)
}
