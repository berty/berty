package node

import (
	"context"
	"fmt"
	"net"

	ipfs_oldcmds "github.com/ipfs/kubo/commands"
	ipfs_core "github.com/ipfs/kubo/core"
	ipfs_corehttp "github.com/ipfs/kubo/core/corehttp"
	ipfs_p2p "github.com/ipfs/kubo/core/node/libp2p"
	p2p_host "github.com/libp2p/go-libp2p/core/host"
)

type IpfsConfig struct {
	HostConfig *HostConfig
	HostOption ipfs_p2p.HostOption

	RoutingConfig *RoutingConfig
	RoutingOption ipfs_p2p.RoutingOption

	RepoMobile *RepoMobile
	ExtraOpts  map[string]bool
}

func (c *IpfsConfig) fillDefault() error {
	if c.RepoMobile == nil {
		return fmt.Errorf("repo cannot be nil")
	}

	if c.ExtraOpts == nil {
		c.ExtraOpts = make(map[string]bool)
	}

	if c.RoutingOption == nil {
		c.RoutingOption = ipfs_p2p.DHTOption
	}

	if c.RoutingConfig == nil {
		c.RoutingConfig = &RoutingConfig{}
	}

	if c.HostOption == nil {
		c.HostOption = ipfs_p2p.DefaultHostOption
	}

	if c.HostConfig == nil {
		c.HostConfig = &HostConfig{}
	}

	return nil
}

type IpfsMobile struct {
	*ipfs_core.IpfsNode
	Repo *RepoMobile

	commandCtx ipfs_oldcmds.Context
}

func (im *IpfsMobile) PeerHost() p2p_host.Host {
	return im.IpfsNode.PeerHost
}

func (im *IpfsMobile) Close() error {
	return im.IpfsNode.Close()
}

func (im *IpfsMobile) ServeCoreHTTP(l net.Listener, opts ...ipfs_corehttp.ServeOption) error {
	gatewayOpt := ipfs_corehttp.GatewayOption(false, ipfs_corehttp.WebUIPaths...)
	opts = append(opts,
		ipfs_corehttp.WebUIOption,
		gatewayOpt,
		ipfs_corehttp.CommandsOption(im.commandCtx),
	)

	return ipfs_corehttp.Serve(im.IpfsNode, l, opts...)
}

func (im *IpfsMobile) ServeGateway(l net.Listener, writable bool, opts ...ipfs_corehttp.ServeOption) error {
	opts = append(opts,
		ipfs_corehttp.HostnameOption(),
		ipfs_corehttp.GatewayOption(writable, "/ipfs", "/ipns"),
		ipfs_corehttp.VersionOption(),
		ipfs_corehttp.CheckVersionOption(),
		ipfs_corehttp.CommandsROOption(im.commandCtx),
	)

	return ipfs_corehttp.Serve(im.IpfsNode, l, opts...)
}

func NewNode(ctx context.Context, cfg *IpfsConfig) (*IpfsMobile, error) {
	if err := cfg.fillDefault(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	// build config
	buildcfg := &ipfs_core.BuildCfg{
		Online:                      true,
		Permanent:                   false,
		DisableEncryptedConnections: false,
		Repo:                        cfg.RepoMobile,
		Host:                        NewHostConfigOption(cfg.HostOption, cfg.HostConfig),
		Routing:                     NewRoutingConfigOption(cfg.RoutingOption, cfg.RoutingConfig),
		ExtraOpts:                   cfg.ExtraOpts,
	}

	// create ipfs node
	inode, err := ipfs_core.NewNode(ctx, buildcfg)
	if err != nil {
		// unlockRepo(repoPath)
		return nil, fmt.Errorf("failed to init ipfs node: %s", err)
	}

	// @TODO: no sure about how to init this, must be another way
	cctx := ipfs_oldcmds.Context{
		ConfigRoot: cfg.RepoMobile.Path,
		ReqLog:     &ipfs_oldcmds.ReqLog{},
		ConstructNode: func() (*ipfs_core.IpfsNode, error) {
			return inode, nil
		},
	}

	return &IpfsMobile{
		commandCtx: cctx,
		IpfsNode:   inode,
		Repo:       cfg.RepoMobile,
	}, nil
}
