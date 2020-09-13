package ipfsutil

import (
	"fmt"
	"net"

	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/multierr"
)

func ParseAddr(addr string) (ma.Multiaddr, error) {
	maddr, err := ma.NewMultiaddr(addr)
	if err == nil {
		return maddr, nil
	}

	// try to get a tcp multiaddr from host:port
	host, port, err := net.SplitHostPort(addr)
	if err != nil {
		return nil, err
	}
	if host == "" {
		host = "127.0.0.1"
	}

	addr = fmt.Sprintf("/ip4/%s/tcp/%s/", host, port)
	return ma.NewMultiaddr(addr)
}

func ParseAddrs(addrs ...string) ([]ma.Multiaddr, error) {
	maddrs := make([]ma.Multiaddr, len(addrs))

	var err error
	for i, addr := range addrs {
		var thisErr error
		maddrs[i], thisErr = ParseAddr(addr)
		err = multierr.Append(err, thisErr)
	}

	return maddrs, err
}
