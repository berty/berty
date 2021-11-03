package tinder

import (
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
)

// return only public addrs
func PublicAddrsOnly(ms []ma.Multiaddr) []ma.Multiaddr {
	filetred := []ma.Multiaddr{}
	for _, m := range ms {
		if manet.IsPublicAddr(m) {
			filetred = append(filetred, m)
		}
	}

	return filetred
}

// return anything but public addrs
func PrivateAddrOnly(ms []ma.Multiaddr) []ma.Multiaddr {
	filetred := []ma.Multiaddr{}
	for _, m := range ms {
		if !manet.IsPublicAddr(m) {
			filetred = append(filetred, m)
		}
	}

	return filetred
}

// no filters
func NoFilter(ms []ma.Multiaddr) []ma.Multiaddr {
	return ms
}

// filter all addrs
func FilterAll(ms []ma.Multiaddr) []ma.Multiaddr {
	return []ma.Multiaddr{}
}
