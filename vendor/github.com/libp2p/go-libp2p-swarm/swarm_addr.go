package swarm

import (
	addrutil "github.com/libp2p/go-addr-util"
	ma "github.com/multiformats/go-multiaddr"
)

// ListenAddresses returns a list of addresses at which this swarm listens.
func (s *Swarm) ListenAddresses() []ma.Multiaddr {
	s.listeners.RLock()
	defer s.listeners.RUnlock()
	addrs := make([]ma.Multiaddr, 0, len(s.listeners.m))
	for l := range s.listeners.m {
		addrs = append(addrs, l.Multiaddr())
	}
	return addrs
}

// InterfaceListenAddresses returns a list of addresses at which this swarm
// listens. It expands "any interface" addresses (/ip4/0.0.0.0, /ip6/::) to
// use the known local interfaces.
func (s *Swarm) InterfaceListenAddresses() ([]ma.Multiaddr, error) {
	return addrutil.ResolveUnspecifiedAddresses(s.ListenAddresses(), nil)
}
