package ble

import "net"

type Addr struct {
	net.Addr
	Address string
}

func (b *Addr) String() string  { return b.Address }
func (b *Addr) Network() string { return "ble" }
