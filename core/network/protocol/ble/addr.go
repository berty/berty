package ble

import "net"

// Addr is a BLE net.Addr.
var _ net.Addr = &Addr{}

// Addr represents a network end point address.
type Addr struct {
	Address string
}

// Network returns the address's network name.
func (b *Addr) Network() string { return "ble" }

// String return's the string form of the address.
func (b *Addr) String() string { return b.Address }
