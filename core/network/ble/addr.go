// +build darwin

package ble

import "net"

type Addr struct {
	net.Addr
	Address string
}

func (b *Addr) String() string {
	logger().Debug("BLEAddr String")
	return b.Address
}

func (b *Addr) Network() string {
	logger().Debug("BLEAddr Network")
	return "ble"
}
