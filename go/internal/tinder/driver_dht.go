package tinder

import (
	p2p_discovery "github.com/libp2p/go-libp2p-discovery"
	p2p_dht "github.com/libp2p/go-libp2p-kad-dht"
)

func NewDHTDriver(dht *p2p_dht.IpfsDHT) Driver {
	disc := p2p_discovery.NewRoutingDiscovery(dht)
	return ComposeDriver(disc, disc, NoopUnregisterer)
}
