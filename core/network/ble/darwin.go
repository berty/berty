// +build darwin

package ble

import (
	"context"
	"fmt"
	"time"
	"unsafe"
	"sync"

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

//export sendBytesToConn
func sendBytesToConn(bleUUID *C.char, bytes unsafe.Pointer, length C.int) {
	goBleUUID := C.GoString(bleUUID)
	b := C.GoBytes(bytes, length)
	BytesToConn(goBleUUID, b)
}

//export setConnClosed
func setConnClosed(bleUUID *C.char) {
	goBleUUID := C.GoString(bleUUID)
	ConnClosed(goBleUUID)
}

//export callConnClose
func callConnClose(bleUUID *C.char) {
	goBleUUID := C.GoString(bleUUID)
	ConnClose(goBleUUID)
}

func (b *Conn) IsClosed() bool {
	val, err := b.rAddr.ValueForProtocol(PBle)
	if err != nil {
		logger().Debug("BLEConn IsClosed", zap.Error(err))
		return true
	}
	ma := C.CString(val)
	defer C.free(unsafe.Pointer(ma))

	return b.closed
}

func (b *Conn) Close() error {
	logger().Debug("BLEConn Close")
	b.closed = true
	close(b.closer)
	_, err := b.rAddr.ValueForProtocol(PBle)
	if err != nil {
		logger().Debug("BLEConn close", zap.Error(err))
		return err
	}
	// ma := C.CString(val)
	// logger().Debug("BLEConn close", zap.String("VALUE",val))
	// defer C.free(unsafe.Pointer(ma))
	// C.closeConn(ma)
	return nil
}

func (b *Conn) Write(p []byte) (n int, err error) {
	if b.IsClosed() {
		return 0, fmt.Errorf("conn already closed")
	}
	val, err := b.rAddr.ValueForProtocol(PBle)
	if err != nil {
		return 0, err
	} else if val == "" {
		return 0, fmt.Errorf("ble can't dial unknow multiaddr")
	}

	ma := C.CString(val)
	defer C.free(unsafe.Pointer(ma))
	C.writeNSData(
		C.Bytes2NSData(
			unsafe.Pointer(&p[0]),
			C.int(len(p)),
		),
		ma,
	)
	return len(p), nil
}

//export sendAcceptToListenerForPeerID
func sendAcceptToListenerForPeerID(peerID *C.char, ble *C.char, incPeerID *C.char) {
	goPeerID := C.GoString(peerID)
	goble := C.GoString(ble)
	goIncPeerID := C.GoString(incPeerID)
	go RealAcceptSender(goPeerID, goble, goIncPeerID)
}

func SetMa(ma string) {
	cMa := C.CString(ma)
	defer C.free(unsafe.Pointer(cMa))
	C.setMa(cMa)
}

func SetPeerID(peerID string) {
	cPeerID := C.CString(peerID)
	defer C.free(unsafe.Pointer(cPeerID))
	C.setPeerID(cPeerID)
}

func waitForOn() bool {
	var wg sync.WaitGroup

	centralIsOn := false
	peripheralIsOn := false
	wg.Add(2)
	go func() {
		defer wg.Done()
		if int(C.centralManagerIsOn()) == 1 {
			centralIsOn = true
		}
	}()
	go func() {
		defer wg.Done()
		if int(C.peripheralManagerIsOn()) == 1 {
			peripheralIsOn = true
		}
	}()
	wg.Wait()

	return centralIsOn && peripheralIsOn
}

func NewListener(lAddr ma.Multiaddr, hostID peer.ID, t *Transport) (*Listener, error) {
	C.init()

	for !waitForOn() {
		logger().Debug("Ble centralManager or peripheralManager isn't on wait 1sec and retry")
		time.Sleep(1 * time.Second)
	}

	C.addService()
	C.startAdvertising()
	C.startScanning()

	listerner := &Listener{
		lAddr:           lAddr,
		incomingBLEUUID: make(chan string),
		incomingPeerID:  make(chan string),
		transport:       t,
		closer:          make(chan struct{}),
	}

	listeners[t.ID] = listerner
	return listerner, nil
}

// Dial dials the peer at the remote address.
func (t *Transport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	if int(C.isDiscovering()) != 1 {
		go C.startScanning()
	}
	s, err := rAddr.ValueForProtocol(PBle)
	if err != nil {
		return nil, err
	}

	ma := C.CString(s)
	defer C.free(unsafe.Pointer(ma))
	if C.dialPeer(ma) == 0 {
		return nil, fmt.Errorf("error dialing ble")
	}

	if conn, ok := getConn(s); ok {
		conn.closed = false
		return conn, nil
	}
	c := NewConn(t, t.MySelf.ID(), p, t.lAddr, rAddr, 0)
	return &c, nil
}

//export AddToPeerStoreC
func AddToPeerStoreC(peerID *C.char, rAddr *C.char) {
	goPeerID := C.GoString(peerID)
	goRAddr := C.GoString(rAddr)
	AddToPeerStore(goPeerID, goRAddr)
}

func (b *Listener) closeNative() {}
