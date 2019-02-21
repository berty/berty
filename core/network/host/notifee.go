package host

import (
	inet "github.com/libp2p/go-libp2p-net"
	ma "github.com/multiformats/go-multiaddr"
)

func (bh *BertyHost) Listen(net inet.Network, a ma.Multiaddr)      {}
func (bh *BertyHost) ListenClose(net inet.Network, a ma.Multiaddr) {}
func (bh *BertyHost) OpenedStream(net inet.Network, s inet.Stream) {}
func (bh *BertyHost) ClosedStream(net inet.Network, s inet.Stream) {}

func (bh *BertyHost) Connected(s inet.Network, c inet.Conn) {

}

func (bh *BertyHost) Disconnected(s inet.Network, c inet.Conn) {}
