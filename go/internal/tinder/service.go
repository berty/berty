package tinder

import (
	p2p_discovery "github.com/libp2p/go-libp2p-discovery"
)

// Tinder service is a simple driver backed by a cache,
type Service interface {
	Driver
}

func NewService(drivers []Driver, stratFactory p2p_discovery.BackoffFactory, opts ...p2p_discovery.BackoffDiscoveryOption) (Service, error) {
	mdriver := NewMultiDriver(drivers...)
	disc, err := p2p_discovery.NewBackoffDiscovery(mdriver, stratFactory, opts...)
	if err != nil {
		return nil, err
	}

	return ComposeDriver(disc, disc, mdriver), nil
}
