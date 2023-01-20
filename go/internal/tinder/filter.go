package tinder

import (
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
)

// keep public addr only
func PublicAddrsOnlyFactory(ms []ma.Multiaddr) []ma.Multiaddr {
	return ma.FilterAddrs(ms, manet.IsPublicAddr)
}

// keep private addr only
func PrivateAddrsOnlyFactory(ms []ma.Multiaddr) []ma.Multiaddr {
	return ma.FilterAddrs(ms, manet.IsPrivateAddr)
}

func AllAddrsFactory(ms []ma.Multiaddr) []ma.Multiaddr { return ms }
