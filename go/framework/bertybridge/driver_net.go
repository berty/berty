package bertybridge

import "net"

type NativeNetDriver interface {
	InterfaceAddrs() (*NetAddrs, error)
}

type inetAddrs struct {
	netaddrs NativeNetDriver
}

func (i *inetAddrs) InterfaceAddrs() ([]net.Addr, error) {
	na, err := i.netaddrs.InterfaceAddrs()
	if err != nil {
		return nil, err
	}

	addrs := make([]net.Addr, len(na.addrs))
	for i, ip := range na.addrs {
		v, err := net.ResolveIPAddr("ip", ip)
		if err != nil {
			return nil, err
		}
		addrs[i] = v
	}

	return addrs, nil
}

type NetAddrs struct {
	addrs []string
}

func NewNetAddrs() *NetAddrs {
	return &NetAddrs{addrs: []string{}}
}

func (n *NetAddrs) AppendAddr(addr string) {
	n.addrs = append(n.addrs, addr)
}
