package ipfsutil

import (
	"net"
	"sync"
)

var (
	muNetDriver     = sync.RWMutex{}
	netdriver   Net = &inet{}
)

type Net interface {
	NetAddrs
	NetInterface
}

type NetInterface interface {
	Interfaces() ([]net.Interface, error)
}

type NetAddrs interface {
	InterfaceAddrs() ([]net.Addr, error)
}

var _ Net = (*inet)(nil)

type inet struct{}

func (*inet) InterfaceAddrs() ([]net.Addr, error) {
	return net.InterfaceAddrs()
}

func (*inet) Interfaces() ([]net.Interface, error) {
	return net.Interfaces()
}

func SetNetDriver(n Net) {
	muNetDriver.Lock()
	netdriver = n
	muNetDriver.Unlock()
}

func getNetDriver() (n Net) {
	muNetDriver.RLock()
	n = netdriver
	muNetDriver.RUnlock()
	return
}
