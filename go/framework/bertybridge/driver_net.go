package bertybridge

import (
	"net"
	"runtime"
	"strings"

	"berty.tech/berty/v2/go/pkg/osversion"
	"go.uber.org/zap"
)

type NativeNetDriver interface {
	InterfaceAddrs() (*NetAddrs, error)
}

type inetAddrs struct {
	netaddrs NativeNetDriver
	logger   *zap.Logger
}

func (ia *inetAddrs) InterfaceAddrs() ([]net.Addr, error) {
	if runtime.GOOS != "android" || osversion.GetVersion().Major() < 30 {
		return net.InterfaceAddrs()
	}

	na, err := ia.netaddrs.InterfaceAddrs()
	if err != nil {
		return nil, err
	}

	addrs := []net.Addr{}
	for _, addr := range na.addrs {
		if addr == "" {
			continue
		}

		// skip interface name
		ips := strings.Split(addr, "%")
		if len(ips) == 0 {
			ia.logger.Debug("empty addr while parsing interface addrs")
			continue
		}
		ip := ips[0]

		// resolve ip
		v, err := net.ResolveIPAddr("ip", ip)
		if err != nil {
			ia.logger.Warn("unable to resolve addr", zap.String("addr", ip))
			continue
		}

		addrs = append(addrs, v)
	}

	fields := make([]string, len(addrs))
	for i, addr := range addrs {
		fields[i] = addr.String()
	}

	ia.logger.Debug("driver interface resolved addrs", zap.Strings("addrs", fields))
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
