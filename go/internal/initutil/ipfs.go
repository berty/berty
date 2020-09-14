package initutil

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	datastore "github.com/ipfs/go-datastore"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/srand"
)

func (m *Manager) SetupLocalIPFSFlags(fs *flag.FlagSet) {
	fs.StringVar(&m.Node.Protocol.IPFSListeners, "p2p.ipfs-listeners", "/ip4/127.0.0.1/tcp/0", "IPFS listeners")
	fs.DurationVar(&m.Node.Protocol.MinBackoff, "p2p.min-backoff", time.Second, "minimum p2p backoff duration")
	fs.DurationVar(&m.Node.Protocol.MaxBackoff, "p2p.max-backoff", time.Minute, "maximum p2p backoff duration")
	fs.BoolVar(&m.Node.Protocol.LocalDiscovery, "p2p.local-discovery", true, "local discovery")
	fs.StringVar(&m.Node.Protocol.RdvpMaddr, "p2p.rdvp", ":dev:", "rendezvous point maddr")
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

	rdvpeer, err := m.getRdvpMaddr()
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	ipfsDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey(bertyprotocol.NamespaceIPFSDatastore))

	var apiAddrs = []string{}
	if m.Node.Protocol.IPFSListeners != "" {
		apiAddrs = strings.Split(m.Node.Protocol.IPFSListeners, ",")
	}
	var opts = ipfsutil.CoreAPIConfig{
		SwarmAddrs:        config.BertyDev.DefaultSwarmAddrs,
		APIAddrs:          apiAddrs,
		APIConfig:         config.BertyDev.APIConfig,
		DisableCorePubSub: true,
		BootstrapAddrs:    config.BertyDev.Bootstrap,
		HostConfig: func(h host.Host, _ routing.Routing) error {
			var err error
			h.Peerstore().AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)

			rng := rand.New(rand.NewSource(srand.Fast()))
			rdvClient := tinder.NewRendezvousDiscovery(logger, h, rdvpeer.ID, rng)
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

func (m *Manager) getRdvpMaddr() (*peer.AddrInfo, error) {
	_, err := m.getLogger() // ensure logger is initialized
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	switch m.Node.Protocol.RdvpMaddr {
	case "":
		m.initLogger.Debug("no rendezvous peer set")
		return nil, nil
	case ":dev:":
		m.Node.Protocol.RdvpMaddr = config.BertyDev.RendezVousPeer
	}

	resolveCtx, cancel := context.WithTimeout(m.ctx, 10*time.Second)
	defer cancel()

	rdvpeer, err := ipfsutil.ParseAndResolveIpfsAddr(resolveCtx, m.Node.Protocol.RdvpMaddr)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	fds := make([]zapcore.Field, len(rdvpeer.Addrs))
	for i, maddr := range rdvpeer.Addrs {
		key := fmt.Sprintf("#%d", i)
		fds[i] = zap.String(key, maddr.String())
	}
	m.initLogger.Debug("rdvp peer resolved addrs", fds...)
	return rdvpeer, nil
}
