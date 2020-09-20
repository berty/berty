package ipfsutil

import (
	"context"

	ds "github.com/ipfs/go-datastore"
	dsync "github.com/ipfs/go-datastore/sync"
	config "github.com/ipfs/go-ipfs-config"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_node "github.com/ipfs/go-ipfs/core/node"
	ipfs_libp2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	ipfs_repo "github.com/ipfs/go-ipfs/repo"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	p2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	p2p_ps "github.com/libp2p/go-libp2p-core/peerstore"
	p2p_routing "github.com/libp2p/go-libp2p-core/routing"
	p2p_dht "github.com/libp2p/go-libp2p-kad-dht"
	p2p_dualdht "github.com/libp2p/go-libp2p-kad-dht/dual"
	p2p_record "github.com/libp2p/go-libp2p-record"
	"github.com/pkg/errors"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type CoreAPIOption func(context.Context, *ipfs_core.IpfsNode, ipfs_interface.CoreAPI) error

type CoreAPIConfig struct {
	BootstrapAddrs []string
	SwarmAddrs     []string
	APIAddrs       []string
	Announce       []string
	NoAnnounce     []string
	APIConfig      config.API

	DisableCorePubSub bool
	HostConfig        func(host.Host, p2p_routing.Routing) error
	ExtraLibp2pOption p2p.Option
	DHTOption         []p2p_dht.Option

	Routing ipfs_libp2p.RoutingOption
	Host    ipfs_libp2p.HostOption

	Options []CoreAPIOption
}

func NewCoreAPI(ctx context.Context, cfg *CoreAPIConfig) (ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	ds := dsync.MutexWrap(ds.NewMapDatastore())
	return NewCoreAPIFromDatastore(ctx, ds, cfg)
}

func NewCoreAPIFromDatastore(ctx context.Context, ds ds.Batching, cfg *CoreAPIConfig) (ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	repo, err := CreateMockedRepo(ds)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return NewCoreAPIFromRepo(ctx, repo, cfg)
}

func NewCoreAPIFromRepo(ctx context.Context, repo ipfs_repo.Repo, cfg *CoreAPIConfig) (ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
	bcfg, err := CreateBuildConfig(repo, cfg)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	if err := updateRepoConfig(repo, cfg); err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	if cfg.Options == nil {
		cfg.Options = []CoreAPIOption{}
	}

	return NewConfigurableCoreAPI(ctx, bcfg, cfg.Options...)
}

// NewConfigurableCoreAPI returns an IPFS CoreAPI from a provided ipfs_node.BuildCfg
func NewConfigurableCoreAPI(ctx context.Context, bcfg *ipfs_node.BuildCfg, opts ...CoreAPIOption) (ExtendedCoreAPI, *ipfs_core.IpfsNode, error) {
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

	return NewExtendedCoreAPI(node.PeerHost, api), node, nil
}

func CreateBuildConfig(repo ipfs_repo.Repo, opts *CoreAPIConfig) (*ipfs_node.BuildCfg, error) {
	if opts == nil {
		opts = &CoreAPIConfig{}
	}

	routingOpt := configureRouting(
		p2p_dht.ModeClient,
		p2p_dht.Concurrency(2))
	if opts.Routing != nil {
		routingOpt = opts.Routing
	}

	hostOpt := ipfs_libp2p.DefaultHostOption
	if opts.Host != nil {
		hostOpt = opts.Host
	}

	if opts.ExtraLibp2pOption != nil {
		hostOpt = wrapP2POptionsToHost(hostOpt, opts.ExtraLibp2pOption)
	}

	if opts.HostConfig != nil {
		routingOpt = wrapHostConfig(routingOpt, opts.HostConfig)
	}

	return &ipfs_node.BuildCfg{
		Online:                      true,
		Permanent:                   true,
		DisableEncryptedConnections: false,
		NilRepo:                     false,
		Routing:                     routingOpt,
		Host:                        hostOpt,
		Repo:                        repo,
		ExtraOpts: map[string]bool{
			"pubsub": !opts.DisableCorePubSub,
		},
	}, nil
}

func updateRepoConfig(repo ipfs_repo.Repo, cfg *CoreAPIConfig) error {
	rcfg, err := repo.Config()
	if err != nil {
		return err
	}

	if cfg.BootstrapAddrs != nil {
		rcfg.Bootstrap = cfg.BootstrapAddrs
	}

	if len(cfg.SwarmAddrs) > 0 {
		rcfg.Addresses.Swarm = cfg.SwarmAddrs
	}

	if len(cfg.APIAddrs) > 0 {
		rcfg.Addresses.API = cfg.APIAddrs
	}

	if len(cfg.Announce) > 0 {
		rcfg.Addresses.Announce = cfg.Announce
	}

	if len(cfg.NoAnnounce) > 0 {
		rcfg.Addresses.NoAnnounce = cfg.NoAnnounce
	}

	if cfg.APIConfig.HTTPHeaders != nil {
		rcfg.API = cfg.APIConfig
	}

	return repo.SetConfig(rcfg)
}

func wrapHostConfig(rh ipfs_libp2p.RoutingOption, hc func(h host.Host, r p2p_routing.Routing) error) ipfs_libp2p.RoutingOption {
	return func(
		ctx context.Context,
		host host.Host,
		dstore ds.Batching,
		validator p2p_record.Validator,
		bootstrapPeers ...p2p_peer.AddrInfo,
	) (p2p_routing.Routing, error) {
		routing, err := rh(ctx, host, dstore, validator, bootstrapPeers...)
		if err != nil {
			return nil, err
		}

		if err := hc(host, routing); err != nil {
			return nil, errors.Wrap(err, "failed to config host")
		}

		return routing, nil
	}
}

func configureRouting(mode p2p_dht.ModeOpt, opts ...p2p_dht.Option) func(
	ctx context.Context,
	host host.Host,
	dstore ds.Batching,
	validator p2p_record.Validator,
	bootstrapPeers ...p2p_peer.AddrInfo,
) (p2p_routing.Routing, error) {
	return func(
		ctx context.Context,
		host host.Host,
		dstore ds.Batching,
		validator p2p_record.Validator,
		bootstrapPeers ...p2p_peer.AddrInfo,
	) (p2p_routing.Routing, error) {
		return p2p_dualdht.New(ctx, host,
			append(opts,
				p2p_dht.Mode(mode),
				p2p_dht.Datastore(dstore),
				p2p_dht.Validator(validator),
				p2p_dht.BootstrapPeers(bootstrapPeers...),
			)...)
	}
}

func wrapP2POptionsToHost(hf ipfs_libp2p.HostOption, opt ...p2p.Option) ipfs_libp2p.HostOption {
	return func(ctx context.Context, id p2p_peer.ID, ps p2p_ps.Peerstore, options ...p2p.Option) (host.Host, error) {
		return hf(ctx, id, ps, append(options, opt...)...)
	}
}
