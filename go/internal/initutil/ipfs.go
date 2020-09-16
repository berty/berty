package initutil

import (
	"flag"
	"fmt"
	"math/rand"
	"strings"
	"time"

	datastore "github.com/ipfs/go-datastore"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Manager) SetupLocalIPFSFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.Protocol.IPFSListeners, "p2p.ipfs-listeners", "/ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic", "IPFS listeners")
	fs.StringVar(&m.Node.Protocol.IPFSAPIListeners, "p2p.ipfs-api-listeners", "", "IPFS API listeners")
	fs.StringVar(&m.Node.Protocol.Announce, "p2p.ipfs-announce", "", "IPFS announce addrs")
	fs.StringVar(&m.Node.Protocol.NoAnnounce, "p2p.ipfs-no-announce", "", "IPFS exclude announce addrs")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute, "maximum p2p backoff duration")
	fs.BoolVar(&m.Node.Protocol.LocalDiscovery, "p2p.local-discovery", true, "local discovery")
	fs.Var(&m.Node.Protocol.RdvpMaddrs, "p2p.rdvp", "list of rendezvous point maddr, \":dev:\" will add the default devs servers, \":none:\" will disable rdvp")
}

type stringSlice []string

func (i *stringSlice) String() string {
	return fmt.Sprintf("%s", *i)
}

func (i *stringSlice) Set(value string) error {
	*i = append(*i, value)
	return nil
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

	var swarmAddrs = []string{}
	if m.Node.Protocol.IPFSListeners != "" {
		swarmAddrs = strings.Split(m.Node.Protocol.IPFSListeners, ",")
	}

	var apiAddrs = []string{}
	if m.Node.Protocol.IPFSAPIListeners != "" {
		apiAddrs = strings.Split(m.Node.Protocol.IPFSAPIListeners, ",")
	}

	var announce = []string{}
	if m.Node.Protocol.Announce != "" {
		announce = strings.Split(m.Node.Protocol.Announce, ",")
	}

	var noannounce = []string{}
	if m.Node.Protocol.NoAnnounce != "" {
		noannounce = strings.Split(m.Node.Protocol.NoAnnounce, ",")
	}

	var opts = ipfsutil.CoreAPIConfig{
		SwarmAddrs:        swarmAddrs,
		APIAddrs:          apiAddrs,
		APIConfig:         config.BertyDev.APIConfig,
		Announce:          announce,
		NoAnnounce:        noannounce,
		DisableCorePubSub: true,
		BootstrapAddrs:    config.BertyDev.Bootstrap,
		HostConfig: func(h host.Host, _ routing.Routing) error {
			var err error
			var rdvClients []tinder.AsyncableDriver
			rng := rand.New(rand.NewSource(srand.Fast()))

			if lenrdvpeers := len(rdvpeers); lenrdvpeers > 0 {
				drivers := make([]tinder.AsyncableDriver, lenrdvpeers)
				for i, peer := range rdvpeers {
					h.Peerstore().AddAddrs(peer.ID, peer.Addrs, peerstore.PermanentAddrTTL)
					drivers[i] = tinder.NewRendezvousDiscovery(logger, h, peer.ID,
						rand.New(rand.NewSource(srand.Fast())))
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

			m.Node.Protocol.discovery, err = tinder.NewService(
				logger,
				rdvClient,
				discovery.NewExponentialBackoff(m.Node.Protocol.MinBackoff, m.Node.Protocol.MaxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
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
	if !m.Node.Protocol.DisableIPFSNetwork {
		opts.ExtraLibp2pOption = libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(logger)))
	}
	// FIXME: continue disabling things to speedup the node when DisableIPFSNetwork==true

	m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, err = ipfsutil.NewCoreAPIFromDatastore(m.ctx, ipfsDS, &opts)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	// drivers := []tinder.Driver{}
	// if rdvpeer != nil {
	// 	if rdvpeer != nil {
	// 		node.Peerstore.AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
	// 		// @FIXME(gfanton): use rand as argument
	// 		rdvClient := tinder.NewRendezvousDiscovery(logger, node.PeerHost, rdvpeer.ID, rand.New(rand.NewSource(rand.Int63())))
	// 		drivers = append(drivers, rdvClient)
	// 	}
	// 	// if localDiscovery {
	// 	localDiscovery := tinder.NewLocalDiscovery(logger, node.PeerHost, rand.New(rand.NewSource(rand.Int63())))
	// 	drivers = append(drivers, localDiscovery)
	// 	// }
	// 	bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, p2pRdvpMaddr)
	// }

	// PubSub
	psapi := ipfsutil.NewPubSubAPI(m.ctx, logger.Named("ps"), m.Node.Protocol.discovery, m.Node.Protocol.pubsub)
	m.Node.Protocol.ipfsAPI = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(m.Node.Protocol.ipfsAPI, psapi)
	ipfsutil.EnableConnLogger(m.ctx, logger, m.Node.Protocol.ipfsNode.PeerHost)

	return m.Node.Protocol.ipfsAPI, m.Node.Protocol.ipfsNode, nil
}

func (m *Manager) getRdvpMaddrs() ([]*peer.AddrInfo, error) {
	_, err := m.getLogger() // ensure logger is initialized
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	var addrs []string
	if len(m.Node.Protocol.RdvpMaddrs) == 0 {
		addrs = config.BertyDev.RendezVousPeer
	} else {
		for _, v := range m.Node.Protocol.RdvpMaddrs {
			if v == ":dev:" {
				addrs = append(addrs, config.BertyDev.RendezVousPeer...)
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
