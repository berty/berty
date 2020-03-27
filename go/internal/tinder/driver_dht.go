package tinder

import (
	p2p_routing "github.com/libp2p/go-libp2p-core/routing"
	p2p_discovery "github.com/libp2p/go-libp2p-discovery"
)

func NewDHTDriver(cr p2p_routing.ContentRouting) Driver {
	disc := p2p_discovery.NewRoutingDiscovery(cr)
	return ComposeDriver(disc, disc, NoopUnregisterer)
}
