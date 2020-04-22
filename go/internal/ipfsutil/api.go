package ipfsutil

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"

	"berty.tech/berty/v2/go/pkg/errcode"
	ds "github.com/ipfs/go-datastore"
	ipfs_datastore "github.com/ipfs/go-datastore"
	dsync "github.com/ipfs/go-datastore/sync"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_node "github.com/ipfs/go-ipfs/core/node"
	ipfs_libp2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"

	p2p "github.com/libp2p/go-libp2p"
	p2p_ci "github.com/libp2p/go-libp2p-core/crypto" // nolint:staticcheck
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer" // nolint:staticcheck
	p2p_ps "github.com/libp2p/go-libp2p-core/peerstore"
)

type CoreAPIOption func(context.Context, *ipfs_core.IpfsNode, ipfs_interface.CoreAPI) error

type CoreAPIConfig struct {
	Datastore ipfs_datastore.Batching

	BootstrapAddrs []string
	SwarmAddrs     []string

	ExtraLibp2pOption p2p.Option
	Routing           ipfs_libp2p.RoutingOption
}

func NewCoreAPI(ctx context.Context, cfg *CoreAPIConfig, opts ...CoreAPIOption) (ipfs_interface.CoreAPI, *ipfs_core.IpfsNode, error) {
	bcfg, err := CreateBuildConfig(cfg)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return NewConfigurableCoreAPI(ctx, bcfg, opts...)
}

// NewConfigurableCoreAPI returns an IPFS CoreAPI from a provided ipfs_node.BuildCfg
func NewConfigurableCoreAPI(ctx context.Context, bcfg *ipfs_node.BuildCfg, opts ...CoreAPIOption) (ipfs_interface.CoreAPI, *ipfs_core.IpfsNode, error) {
	node, err := ipfs_core.NewNode(ctx, bcfg)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	api, err := ipfs_coreapi.NewCoreAPI(node)
	if err != nil {
		node.Close()
		return nil, nil, errcode.TODO.Wrap(err)
	}

	for _, opt := range opts {
		err := opt(ctx, node, api)
		if err != nil {
			node.Close()
			return nil, nil, err
		}
	}

	return api, node, nil
}

func CreateBuildConfig(opts *CoreAPIConfig) (*ipfs_node.BuildCfg, error) {
	if opts == nil {
		opts = &CoreAPIConfig{}
	}

	if opts.Datastore == nil {
		opts.Datastore = dsync.MutexWrap(ds.NewMapDatastore())
	}

	repo, err := CreateRepo(opts.Datastore, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	routing_opt := ipfs_libp2p.DHTOption
	if opts.Routing != nil {
		routing_opt = opts.Routing
	}

	host_opt := ipfs_libp2p.DefaultHostOption
	if opts.ExtraLibp2pOption != nil {
		host_opt = wrapP2POptionsToHost(host_opt, opts.ExtraLibp2pOption)
	}

	return &ipfs_node.BuildCfg{
		Online:                      true,
		Permanent:                   true,
		DisableEncryptedConnections: false,
		NilRepo:                     false,
		Routing:                     routing_opt,
		Host:                        host_opt,
		Repo:                        repo,
		ExtraOpts: map[string]bool{
			"pubsub": true,
		},
	}, nil
}

func CreateRepo(dstore ipfs_datastore.Batching, opts *CoreAPIConfig) (ipfs_repo.Repo, error) {
	c := ipfs_cfg.Config{}
	priv, pub, err := p2p_ci.GenerateKeyPairWithReader(p2p_ci.RSA, 2048, crand.Reader) // nolint:staticcheck
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	pid, err := p2p_peer.IDFromPublicKey(pub) // nolint:staticcheck
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	privkeyb, err := priv.Bytes()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if opts.BootstrapAddrs == nil {
		c.Bootstrap = ipfs_cfg.DefaultBootstrapAddresses
	} else {
		c.Bootstrap = opts.BootstrapAddrs
	}

	if len(opts.SwarmAddrs) != 0 {
		c.Addresses.Swarm = opts.SwarmAddrs
	} else {
		c.Addresses.Swarm = []string{
			"/ip4/0.0.0.0/tcp/0",
			"/ip6/0.0.0.0/tcp/0",
		}
	}

	c.Experimental.QUIC = true
	c.Identity.PeerID = pid.Pretty()
	c.Identity.PrivKey = base64.StdEncoding.EncodeToString(privkeyb)
	c.Discovery.MDNS.Enabled = true
	c.Discovery.MDNS.Interval = 1

	c.Swarm.EnableAutoNATService = true
	c.Swarm.EnableAutoRelay = true

	c.Swarm.EnableRelayHop = false

	return &ipfs_repo.Mock{
		D: dstore,
		C: c,
	}, nil
}

func wrapP2POptionsToHost(hf ipfs_libp2p.HostOption, opt ...p2p.Option) ipfs_libp2p.HostOption {
	return func(ctx context.Context, id p2p_peer.ID, ps p2p_ps.Peerstore, options ...p2p.Option) (p2p_host.Host, error) {
		return hf(ctx, id, ps, append(options, opt...)...)
	}
}
