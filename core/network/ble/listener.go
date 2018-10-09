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
	transport       *BLETransport
	addr            string
	network         string
	incomingBLEUUID chan string
	incomingPeerID  chan string
	connected       map[string]*BLEConn
	lAddr           ma.Multiaddr
}

var listeners map[string]*BLEListener = make(map[string]*BLEListener)

//export sendAcceptToListenerForPeerID
func sendAcceptToListenerForPeerID(peerID *C.char, ble *C.char, incPeerID *C.char) {
	fmt.Printf("W8 for %s listenersssssss %+v\n", listeners, C.GoString(peerID))
	if listener, ok := listeners[C.GoString(peerID)]; ok {
		defer func() {
			listener.incomingBLEUUID <- C.GoString(ble)
			listener.incomingPeerID <- C.GoString(incPeerID)
		}()
	}
}

func NewListener(lAddr ma.Multiaddr, hostID peer.ID, t *BLETransport) *BLEListener {
	fmt.Printf("NEW LISTENER %s\n", hostID.Pretty())
	listerner := &BLEListener{
		lAddr:           lAddr,
		incomingBLEUUID: make(chan string),
		incomingPeerID:  make(chan string),
		connected:       make(map[string]*BLEConn),
		transport:       t,
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
		bleUUID := <-b.incomingBLEUUID
		peerIDb58 := <-b.incomingPeerID
		if _, ok := conns[bleUUID]; !ok {
			rAddr, err := ma.NewMultiaddr("/ble/" + bleUUID)
			if err != nil {
				fmt.Printf("end acc1 %+v\n", err)
				return nil, err
			}
			rID, err := peer.IDB58Decode(peerIDb58)
			if err != nil {
				fmt.Printf("end acc2 %+v\n", err)
				return nil, err
			}
			c := NewConn(b.transport, b.transport.MySelf.ID(), rID, b.lAddr, rAddr, 1)
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
