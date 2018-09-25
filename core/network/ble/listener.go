package ble

import (
	"fmt"
	"net"

	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/satori/go.uuid"
)

// BLEListener implement ipfs Listener interface
type BLEListener struct {
	tpt.Listener
	addr    string
	network string
	maAddr  ma.Multiaddr
}

func (b *BLEListener) Addr() net.Addr {
	fmt.Println("BLEListener Addr")
	return &BLEAddr{
		addr: b.addr,
	}
}

func (b *BLEListener) Multiaddr() ma.Multiaddr {
	fmt.Println("BLEListener Multiaddr")
	return b.maAddr
}

func (b *BLEListener) Accept() (tpt.Conn, error) {
	fmt.Println("BLEListener Accept")
	id, _ := uuid.NewV4()
	laddr, _ := ma.NewMultiaddr(fmt.Sprintf("/ip4/0.0.0.0/tcp/%d/ble/%s", 1280, id.String()))
	rid, _ := uuid.NewV4()
	raddr, _ := ma.NewMultiaddr(fmt.Sprintf("/ip4/0.0.0.0/tcp/%d/ble/%s", 1280, rid.String()))
	return &BLEConn{
		transport: &BLETransport{},
		id:        "sacha",
		rid:       "froment",
		lAddr:     laddr,
		rAddr:     raddr,
	}, nil
}

// Close TODO: stop advertising release object etc...
func (b *BLEListener) Close() error {
	fmt.Println("BLEListener Close")
	return nil
}
