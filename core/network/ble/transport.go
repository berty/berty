package ble

import (
	"context"
	"fmt"
	"time"

	"unsafe"

	logging "github.com/ipfs/go-log"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	rtpt "github.com/libp2p/go-reuseport-transport"
	ma "github.com/multiformats/go-multiaddr"
	mafmt "github.com/whyrusleeping/mafmt"
)

/*
#cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "ble.h"
*/
import "C"

func checkDevice(id string) {
	peerID := C.CString(id)
	defer C.free(unsafe.Pointer(peerID))
	for int(C.checkDeviceConnected(peerID)) != 1 {
	}
}

func getPeerID(id string) string {
	peerID := C.CString(id)
	defer C.free(unsafe.Pointer(peerID))
	return C.GoString(C.readPeerID(peerID))
}

// var TranscoderBLE = ma.NewTranscoderFromFunctions(bleStB, bleBtS, nil)

// func bleStB(s string) ([]byte, error) {
// 	// id, err := uuid.FromString(s)
// 	// if err != nil {
// 	// 	return nil, err
// 	// }
// 	fmt.Println("ICI")
// 	return []byte(s), nil
// }

// func bleBtS(b []byte) (string, error) {
// 	fmt.Println("LA")
// 	return string(b[:]), nil
// }

// var ProtoBLE = ma.Protocol{
// 	Name:       "ble",
// 	Code:       ma.P_RAW,
// 	Path:       true,
// 	Size:       ma.LengthPrefixedVarSize,
// 	VCode:      ma.CodeToVarint(ma.P_RAW),
// 	Transcoder: TranscoderBLE,
// }

func BLEInit() {
	// go C.init()
}

func BLEStartAdvertising() {
	go C.startAdvertising()
}

func BLEStartDiscover() {
	go C.startDiscover()
}

// DefaultConnectTimeout is the (default) maximum amount of time the TCP
// transport will spend on the initial TCP connect before giving up.
var DefaultConnectTimeout = 5 * time.Second

var log = logging.Logger("ble-tpt")

// BLETransport is the TCP transport.
type BLETransport struct {
	MySelf host.Host

	// Explicitly disable reuseport.
	DisableReuseport bool

	//
	ID string

	lAddr ma.Multiaddr

	// TCP connect timeout
	ConnectTimeout time.Duration

	reuse rtpt.Transport
}

var _ tpt.Transport = &BLETransport{}

// NewBLETransport creates a tcp transport object that tracks dialers and listeners
// created. It represents an entire tcp stack (though it might not necessarily be)
func NewBLETransport(ID string, lAddr ma.Multiaddr) func(me host.Host) *BLETransport {
	return func(me host.Host) *BLETransport {
		fmt.Println("1")
		ma := C.CString(ID)
		peerID := C.CString(me.ID().Pretty())
		defer C.free(unsafe.Pointer(ma))
		defer C.free(unsafe.Pointer(peerID))
		C.init(ma, peerID)
		time.Sleep(1 * time.Second)
		C.startAdvertising()
		C.startDiscover()

		return &BLETransport{ConnectTimeout: DefaultConnectTimeout, MySelf: me, ID: ID, lAddr: lAddr}
	}
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *BLETransport) CanDial(addr ma.Multiaddr) bool {
	fmt.Printf("BLETransport CanDial %s\n", addr.String())
	return mafmt.BLE.Matches(addr)
}

// Dial dials the   peer at the remote address.
func (t *BLETransport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	if int(C.isDiscovering()) != 1 {
		C.startDiscover()
	}
	s, err := rAddr.ValueForProtocol(ma.P_RAW)
	if err != nil {
		return nil, err
	}
	fmt.Printf("remote addr %s %+v\n", s, err)
	peerID := C.CString(p.Pretty())
	defer C.free(unsafe.Pointer(peerID))
	C.dialPeer(peerID)

	if conn, ok := conns[s]; ok {
		return conn, nil
	}
	c := NewConn(t, t.MySelf.ID(), p, t.lAddr, rAddr, 0)
	fmt.Printf("BLEListener conn OK finished DIALING %s\n", p.Pretty())
	return &c, nil
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *BLETransport) UseReuseport() bool {
	fmt.Println("4")
	return false
}

// Listen listens on the given multiaddr.
func (t *BLETransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	fmt.Println("6")

	fmt.Printf("PPPPPPPPPPEEEEEEEEEEEERRRR IIIIIIDDDDDDD %s\n\n\n", t.MySelf.ID().Pretty())

	// id, _ := uuid.NewV4()

	fmt.Println("returned")
	return NewListener(laddr, t.MySelf.ID(), t), nil
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *BLETransport) Protocols() []int {
	fmt.Println("7")
	return []int{ma.P_RAW}
}

// Proxy always returns false for the TCP transport.
func (t *BLETransport) Proxy() bool {
	fmt.Println("8")
	return false
}

func (t *BLETransport) String() string {
	fmt.Println("9")
	return "BLE"
}
