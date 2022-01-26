package bertybridge

import (
	"fmt"
	"net"
	"strings"

	"go.uber.org/zap"
)

type NativeNetDriver interface {
	InterfaceAddrs() (*NetAddrs, error)
	Interfaces() (*NetInterfaces, error)
}

type inet struct {
	net    NativeNetDriver
	logger *zap.Logger
}

func (ia *inet) Interfaces() ([]net.Interface, error) {
	ifaces, err := ia.net.Interfaces()
	if err != nil {
		return nil, err
	}

	return ifaces.Interfaces(), nil
}

func (ia *inet) InterfaceAddrs() ([]net.Addr, error) {
	na, err := ia.net.InterfaceAddrs()
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

type NetInterfaces struct {
	ifaces []*NetInterface
}

func (n *NetInterfaces) Interfaces() []net.Interface {
	ifaces := make([]net.Interface, len(n.ifaces))
	for i, iface := range n.ifaces {
		ifaces[i] = iface.Interface()
	}
	return ifaces
}

func (n *NetInterfaces) Append(i *NetInterface) {
	n.ifaces = append(n.ifaces, i)
}

const (
	NetFlagUp           int = iota // interface is up
	NetFlagBroadcast               // interface supports broadcast access capability
	NetFlagLoopback                // interface is a loopback interface
	NetFlagPointToPoint            // interface belongs to a point-to-point link
	NetFlagMulticast               // interface supports multicast access capability
)

type NetInterface struct {
	Index int       // positive integer that starts at one, zero is never used
	MTU   int       // maximum transmission unit
	Name  string    // e.g., "en0", "lo0", "eth0.100"
	Addrs *NetAddrs // InterfaceAddresses

	hardwareaddr []byte    // IEEE MAC-48, EUI-48 and EUI-64 form
	flags        net.Flags // e.g., FlagUp, FlagLoopback, FlagMulticast
}

func (n *NetInterface) CopyHardwareAddr(addr []byte) {
	n.hardwareaddr = make([]byte, len(n.hardwareaddr))
	copy(n.hardwareaddr, addr)
}

func (n *NetInterface) Interface() net.Interface {
	return net.Interface{
		Index:        n.Index,
		MTU:          n.MTU,
		Name:         n.Name,
		HardwareAddr: n.hardwareaddr,
		Flags:        n.flags,
	}
}

func (n *NetInterface) AddFlag(flag int) (err error) {
	switch flag {
	case NetFlagUp:
		n.flags |= net.FlagUp
	case NetFlagBroadcast:
		n.flags |= net.FlagBroadcast
	case NetFlagLoopback:
		n.flags |= net.FlagLoopback
	case NetFlagPointToPoint:
		n.flags |= net.FlagPointToPoint
	case NetFlagMulticast:
		n.flags |= net.FlagMulticast
	default:
		err = fmt.Errorf("failed to add unknown flag to net interface: %d", flag)
	}

	return
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
