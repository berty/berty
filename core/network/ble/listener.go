package ble

import (
	"fmt"
	"net"

	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
)

import "C"

// BLEListener implement ipfs Listener interface
type BLEListener struct {
	tpt.Listener
	transport *BLETransport
	addr      string
	network   string
	incoming  chan string
	connected map[string]*BLEConn
	lAddr     ma.Multiaddr
}

var listeners map[string]*BLEListener = make(map[string]*BLEListener)

//export sendAcceptToListenerForPeerID
func sendAcceptToListenerForPeerID(peerID *C.char, incoming *C.char) {
	fmt.Printf("W8 for %s listenersssssss %+v\n", listeners, C.GoString(peerID))
	if listener, ok := listeners[C.GoString(peerID)]; ok {
		listener.incoming <- C.GoString(incoming)
	}
}

func NewListener(lAddr ma.Multiaddr, hostID peer.ID, t *BLETransport) *BLEListener {
	fmt.Printf("NEW LISTENER %s\n", hostID.Pretty())
	listerner := &BLEListener{
		lAddr:     lAddr,
		incoming:  make(chan string),
		connected: make(map[string]*BLEConn),
		transport: t,
	}
	listeners[t.ID] = listerner
	return listerner
}

func (b *BLEListener) Addr() net.Addr {
	fmt.Println("BLEListener Addr")
	return &BLEAddr{
		addr: b.addr,
	}
}

func (b *BLEListener) Multiaddr() ma.Multiaddr {
	fmt.Println("BLEListener Multiaddr")
	return b.lAddr
}

func (b *BLEListener) Accept() (tpt.Conn, error) {
	fmt.Println("BLEListener Accept loop start")
	for {
		inc := <-b.incoming
		fmt.Printf("BLEListener Accept inc %s\n\n\n", inc)
		if _, ok := conns[inc]; !ok {
			rAddr, err := ma.NewMultiaddr("/ble/" + inc)
			if err != nil {
				fmt.Printf("end acc1 %+v\n", err)
				return nil, err
			}
			rid := getPeerID(inc)
			rID, err := peer.IDB58Decode(rid)
			fmt.Printf("ris %s\n", rid)
			c := NewConn(b.transport, b.transport.MySelf.ID(), rID, b.lAddr, rAddr)
			fmt.Println("BLEListener Accept finished")
			return &c, nil
		}
	}
	return nil, nil
}

// Close TODO: stop advertising release object etc...
func (b *BLEListener) Close() error {
	fmt.Println("BLEListener Close")
	return nil
}
