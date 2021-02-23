package tinder

import (
	p2p_discovery "github.com/libp2p/go-libp2p-discovery"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)

type DHTDriver struct {
	p2p_discovery.Discovery
	Unregisterer
}

func NewDHTDriver(d *dht.IpfsDHT) UnregisterDiscovery {
	disc := p2p_discovery.NewRoutingDiscovery(d)
	return &DHTDriver{
		Discovery:    disc,
		Unregisterer: NoopUnregisterer,
	}
}

func (d *DHTDriver) Name() string { return "dht" }
