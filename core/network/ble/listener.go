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
	addr     string
	network  string
	incoming chan string
	connected map[string]*BLEConn
	maAddr ma.Multiaddr
}

var listeners map[string]*BLEListener = make(map[string]*BLEListener)

//export sendAcceptToListenerForPeerID
func sendAcceptToListenerForPeerID(peerID *C.char, incoming *C.char) {
	fmt.Printf(":123090\n\n")
	if listener, ok := listeners[C.GoString(peerID)]; ok {
		fmt.Printf(":123090123123\n\n")
		fmt.Printf(":123090saddddddd\n\n")
		listener.incoming <- C.GoString(incoming)
		fmt.Printf(":123090sadddddasfd12344444444444dd\n\n")
		
	}
}


func NewListener(maaddr ma.Multiaddr, hostID peer.ID, t *BLETransport) *BLEListener {
	listerner := &BLEListener{
		maAddr:   maaddr,
		incoming: make(chan string),
		connected: make(map[string]*BLEConn),
		transport: t,
	}
	listeners[hostID.Pretty()] = listerner
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
	return b.maAddr
}


func (b *BLEListener) Accept() (tpt.Conn, error) {
	inc := <-b.incoming
	fmt.Println("BLEListener Accept")
	m1, err := ma.NewMultiaddr("/ble/" +inc)
	if err != nil {
		fmt.Printf("end acc1 %+v\n", err)
		return nil, err
	}
	m2, err := ma.NewMultiaddr("/ble/" +b.transport.MySelf.ID().Pretty())
	if err != nil {
		fmt.Printf("end acc2 %+v\n", err)
		return nil, err
	}
	rid, err := peer.IDB58Decode("QmS5QmciTXXnCUCyxud5eWFenUMAmvAWSDa1c7dvdXRMZ7")
	// if err != nil {
	// 	fmt.Printf("end acc3 %+v\n", err)
	// 	return nil, err
	// }	
	fmt.Printf("end acc\n")
	return &BLEConn{
		transport: b.transport,
		lid: b.transport.MySelf.ID(),
		rid: rid,
		lAddr: m2,
		rAddr: m1,
		opened: true,
	}, nil
}

// Close TODO: stop advertising release object etc...
func (b *BLEListener) Close() error {
	fmt.Println("BLEListener Close")
	return nil
}
