// Tinder service is a multi discoverer service backed by a cache

package tinder

import (
	libp2p_discovery "github.com/libp2p/go-libp2p-discovery"
)

func New(drivers []Driver, stratFactory libp2p_discovery.BackoffFactory, opts ...libp2p_discovery.BackoffDiscoveryOption) (Driver, error) {
	mdriver := NewMultiDriver(drivers...)
	disc, err := libp2p_discovery.NewBackoffDiscovery(mdriver, nil)
	if err != nil {
		return nil, err
	}

	return ComposeDriver(disc, disc, mdriver), nil
}
