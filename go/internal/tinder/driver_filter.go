package tinder

import (
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
)

// return only public addrs
func FilterPublicAddrs(ms []ma.Multiaddr) []ma.Multiaddr {
	filetred := []ma.Multiaddr{}
	for _, m := range ms {
		if manet.IsPublicAddr(m) {
			filetred = append(filetred, m)
		}
	}

	return filetred
}

// return anything but public addrs
func FilterPrivateAddrs(ms []ma.Multiaddr) []ma.Multiaddr {
	filetred := []ma.Multiaddr{}
	for _, m := range ms {
		if !manet.IsPublicAddr(m) {
			filetred = append(filetred, m)
		}
	}

	return filetred
}
