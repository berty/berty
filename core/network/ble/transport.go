package ble

import (
	"context"
	"fmt"
	"time"

	logging "github.com/ipfs/go-log"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	rtpt "github.com/libp2p/go-reuseport-transport"
	ma "github.com/multiformats/go-multiaddr"
	"unsafe"
	mafmt "github.com/whyrusleeping/mafmt"
)

/*
#cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "ble.h"
*/
import "C"

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

	// TCP connect timeout
	ConnectTimeout time.Duration

	reuse rtpt.Transport
}

var _ tpt.Transport = &BLETransport{}

// NewBLETransport creates a tcp transport object that tracks dialers and listeners
// created. It represents an entire tcp stack (though it might not necessarily be)
func NewBLETransport(me host.Host) *BLETransport {
	fmt.Println("1")
	return &BLETransport{ConnectTimeout: DefaultConnectTimeout, MySelf: me}
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *BLETransport) CanDial(addr ma.Multiaddr) bool {
	return mafmt.BLE.Matches(addr)
}

// Dial dials the   peer at the remote address.
func (t *BLETransport) Dial(ctx context.Context, raddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	fmt.Println("3")
	// conn, err := t.maDial(ctx, raddr)
	// if err != nil {
	// 	return nil, err
	// }
	return nil, nil
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *BLETransport) UseReuseport() bool {
	fmt.Println("4")
	return false
}

// Listen listens on the given multiaddr.
func (t *BLETransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	fmt.Println("6")
	peerID := C.CString(t.MySelf.ID().Pretty())
	go func () {
		C.init(peerID)
		C.free(unsafe.Pointer(peerID))
	}()
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
