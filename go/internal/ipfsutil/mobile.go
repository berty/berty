package ipfsutil

import (
	"context"
	"fmt"

	ipfs_mobile "github.com/ipfs-shipyard/gomobile-ipfs/go/pkg/ipfsmobile"
	ds "github.com/ipfs/go-datastore"
	ipfs_config "github.com/ipfs/go-ipfs-config"
	ipfs_p2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	p2p "github.com/libp2p/go-libp2p"
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	p2p_routing "github.com/libp2p/go-libp2p-core/routing"
	p2p_dht "github.com/libp2p/go-libp2p-kad-dht"
	p2p_record "github.com/libp2p/go-libp2p-record"
)

type Config func(cfg *ipfs_config.Config) ([]p2p.Option, error)

type MobileOptions struct {
	IpfsConfigPatch Config

	HostOption    ipfs_p2p.HostOption
	RoutingOption ipfs_p2p.RoutingOption

	HostConfigFunc    ipfs_mobile.HostConfigFunc
	RoutingConfigFunc ipfs_mobile.RoutingConfigFunc

	ExtraOpts map[string]bool
}

func (o *MobileOptions) fillDefault() {
	if o.HostOption == nil {
		o.HostOption = ipfs_p2p.DefaultHostOption
	}

	if o.RoutingOption == nil {
		o.RoutingOption = CustomRoutingOption(p2p_dht.ModeClient, p2p_dht.Concurrency(2))
	}

	if o.IpfsConfigPatch == nil {
		o.IpfsConfigPatch = defaultIpfsConfigPatch
	}
}

func NewIPFSMobile(ctx context.Context, repo *ipfs_mobile.RepoMobile, opts *MobileOptions) (*ipfs_mobile.IpfsMobile, error) {
	opts.fillDefault()

	var p2popts []p2p.Option

	err := repo.ApplyPatchs(func(cfg *ipfs_config.Config) error {
		var err error
		if p2popts, err = opts.IpfsConfigPatch(cfg); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	// check that p2p opt is set
	if p2popts == nil {
		return nil, fmt.Errorf("unable p2p option: cannot be nil")
	}

	// configure host
	hostconfig := &ipfs_mobile.HostConfig{
		// called after host init
		ConfigFunc: opts.HostConfigFunc,

		// p2p options
		Options: p2popts,
	}

	// configure routing
	routingconfig := &ipfs_mobile.RoutingConfig{
		// called after host init
		ConfigFunc: opts.RoutingConfigFunc,
	}

	// configure ipfs mobile
	ipfsconfig := ipfs_mobile.IpfsConfig{
		HostConfig:    hostconfig,
		RoutingConfig: routingconfig,
		RepoMobile:    repo,
		ExtraOpts:     opts.ExtraOpts,
		HostOption:    opts.HostOption,
		RoutingOption: opts.RoutingOption,
	}

	return ipfs_mobile.NewNode(ctx, &ipfsconfig)
}

func CustomRoutingOption(mode p2p_dht.ModeOpt, opts ...p2p_dht.Option) func(
	ctx context.Context,
	host p2p_host.Host,
	dstore ds.Batching,
	validator p2p_record.Validator,
	bootstrapPeers ...p2p_peer.AddrInfo,
) (p2p_routing.Routing, error) {
	return func(
		ctx context.Context,
		host p2p_host.Host,
		dstore ds.Batching,
		validator p2p_record.Validator,
		bootstrapPeers ...p2p_peer.AddrInfo,
	) (p2p_routing.Routing, error) {
		return p2p_dht.New(ctx, host, append(opts,
			p2p_dht.Mode(mode),
			p2p_dht.Datastore(dstore),
			p2p_dht.Validator(validator),
			p2p_dht.BootstrapPeers(bootstrapPeers...),
		)...)
	}
}

func defaultIpfsConfigPatch(_ *ipfs_config.Config) ([]p2p.Option, error) {
	return []p2p.Option{}, nil
}
