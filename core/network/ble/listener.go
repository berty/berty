// +build darwin

package ble

import (
	"net"
	"time"
	"unsafe"

	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

/*
#cgo darwin CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "ble.h"
*/
import "C"

var listeners map[string]*BLEListener = make(map[string]*BLEListener)

//export sendAcceptToListenerForPeerID
func sendAcceptToListenerForPeerID(peerID *C.char, ble *C.char, incPeerID *C.char) {
	goPeerID := C.GoString(peerID)
	goble := C.GoString(ble)
	goIncPeerID := C.GoString(incPeerID)
	go RealAcceptSender(goPeerID, goble, goIncPeerID)
}

func RealAcceptSender(peerID string, ble string, incPeerID string) {
	for {
		logger().Debug("ACCEPT\n", zap.String("peer", peerID))
		if listener, ok := listeners[peerID]; ok {
			listener.incomingBLEUUID <- ble
			listener.incomingPeerID <- incPeerID
			return
		}
	}
}

func NewListener(lAddr ma.Multiaddr, hostID peer.ID, t *BLETransport) *BLEListener {
	m, _ := lAddr.ValueForProtocol(P_BLE)
	val := C.CString(m)
	peerID := C.CString(hostID.Pretty())
	defer C.free(unsafe.Pointer(val))
	defer C.free(unsafe.Pointer(peerID))
	C.init(val, peerID)
	time.Sleep(1 * time.Second)
	go C.startAdvertising()
	go C.startDiscover()
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
	m, _ := b.lAddr.ValueForProtocol(P_BLE)
	return &BLEAddr{
		Address: m,
	}
}

func (b *BLEListener) Multiaddr() ma.Multiaddr {
	logger().Debug("BLEListener Multiaddr")
	return b.lAddr
}

func (b *BLEListener) Accept() (tpt.Conn, error) {
	for {
		bleUUID := <-b.incomingBLEUUID
		peerIDb58 := <-b.incomingPeerID
		for {
			if ci, ok := conns[bleUUID]; !ok {
				rAddr, err := ma.NewMultiaddr("/ble/" + bleUUID)
				if err != nil {
					return nil, err
				}
				rID, err := peer.IDB58Decode(peerIDb58)
				if err != nil {
					return nil, err
				}
				c := NewConn(b.transport, b.transport.MySelf.ID(), rID, b.lAddr, rAddr, 1)
				return &c, nil
			} else {
				return ci, nil
			}
		}
	}
	return nil, nil
}

// Close TODO: stop advertising release object etc...
func (b *BLEListener) Close() error {
	logger().Debug("BLEListener Close")
	return nil
}
