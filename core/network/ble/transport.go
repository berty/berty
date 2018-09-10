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
#cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#import "ble.h"
*/
import "C"

var peerAdder chan *pstore.PeerInfo = make(chan *pstore.PeerInfo)

//export AddToPeerStore
func AddToPeerStore(peerID *C.char, rAddr *C.char) {
	pID, err := peer.IDB58Decode(C.GoString(peerID))
	if err != nil {
		panic(err)
	}
	rMa, err := ma.NewMultiaddr(fmt.Sprintf("/ble/%s", C.GoString(rAddr)))
	if err != nil {
		panic(err)
	}
	pi := &pstore.PeerInfo{
		ID:    pID,
		Addrs: []ma.Multiaddr{rMa},
	}
	defer func() {
		peerAdder <- pi
		logger().Debug("SENDED TO PEERADDER\n")
	}()
}

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
		logger().Debug("BLETransport NewBLETransport")
		ret := &BLETransport{ConnectTimeout: DefaultConnectTimeout, MySelf: me, ID: ID, lAddr: lAddr}
		go ret.ListenNewPeer()
		return ret
	}
}

func (t *BLETransport) ListenNewPeer() {
	for {
		pi := <-peerAdder
		t.MySelf.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.TempAddrTTL)
		peerID := pi.ID.Pretty()
		mPeerID := t.MySelf.ID().Pretty()
		rVal := 0
		for _, i := range peerID {
			rVal += int(i)
		}
		lVal := 0
		for _, i := range mPeerID {
			lVal += int(i)
		}

		if lVal < rVal {
			t.MySelf.Connect(context.Background(), *pi)
		} else {
			val, err := pi.Addrs[0].ValueForProtocol(P_BLE)
			if err != nil {
				panic(err)
			}
			val2, err := t.lAddr.ValueForProtocol(P_BLE)
			if err != nil {
				panic(err)
			}
			RealAcceptSender(val2, val, peerID)
			t.MySelf.Connect(context.Background(), *pi)
		}
	}
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *BLETransport) CanDial(addr ma.Multiaddr) bool {
	logger().Debug("BLETransport CanDial", zap.String("peer", addr.String()))
	return BLE.Matches(addr)
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

	peerID := C.CString(p.Pretty())
	defer C.free(unsafe.Pointer(peerID))
	C.dialPeer(peerID)

	if conn, ok := conns[s]; ok {
		return conn, nil
	}
	c := NewConn(t, t.MySelf.ID(), p, t.lAddr, rAddr, 0)
	return &c, nil
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *BLETransport) UseReuseport() bool {
	logger().Debug("BLETransport Reuseport")
	return false
}

// Listen listens on the given multiaddr.
func (t *BLETransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	logger().Debug("BLETransport Listen")
	return NewListener(laddr, t.MySelf.ID(), t), nil
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *BLETransport) Protocols() []int {
	logger().Debug("BLETransport Protocols")
	return []int{P_BLE}
}

// Proxy always returns false for the TCP transport.
func (t *BLETransport) Proxy() bool {
	logger().Debug("BLETransport Proxy")
	return false
}

func (t *BLETransport) String() string {
	logger().Debug("BLETransport String")
	return "ble"
}
