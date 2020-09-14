package initutil

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/ipfs/go-datastore"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
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

	apiAddrs := config.BertyDev.DefaultAPIAddrs
	if m.Node.Protocol.IPFSListeningPort > 0 {
		apiAddrs = []string{fmt.Sprintf("/ip4/127.0.0.1/tcp/%d", m.Node.Protocol.IPFSListeningPort)}
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
