// +build darwin

package ble

import (
	"unsafe"
)

/*
#cgo darwin CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "ble.h"
#import "BleManager.h"
#import "BertyDevice.h"
*/
import "C"

//export sendBytesToConn
func sendBytesToConn(bleUUID *C.char, bytes unsafe.Pointer, length C.int) {
	goBleUUID := C.GoString(bleUUID)
	b := C.GoBytes(bytes, length)
	BytesToConn(goBleUUID, b)
}

const (
	CBManagerStateUnknown = iota
	CBManagerStateResetting
	CBManagerStateUnsupported
	CBManagerStateUnauthorized
	CBManagerStatePoweredOff
	CBManagerStatePoweredOn
)

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

func StartScanning() { C.startScanning() }

func StartAdvertising() { C.startAdvertising() }

func Write(p []byte, ma string) bool {
	cMa := C.CString(ma)
	defer C.free(unsafe.Pointer(cMa))
	C.writeNSData(
		C.Bytes2NSData(
			unsafe.Pointer(&p[0]),
			C.int(len(p)),
		),
		cMa,
	)
	return false
}
	
func DialPeer(ma string) bool {
	// ma := C.CString(s)
	// defer C.free(unsafe.Pointer(ma))
	// if C.dialPeer(ma) == false {
		// return nil, fmt.Errorf("error dialing ble")
	// }
	return false 
}

func InitScannerAndAdvertiser() { C.InitScannerAndAdvertiser() }

func CloseScannerAndAdvertiser() { 
	C.closeBle()
}

func CloseConnFromMa(ma string) {
	// ma := C.CString(val)
	// logger().Debug("BLEConn close", zap.String("VALUE",val))
	// defer C.free(unsafe.Pointer(ma))
}

// export AddToPeerStoreC
func AddToPeerStoreC(peerID *C.char, rAddr *C.char) {
	goPeerID := C.GoString(peerID)
	goRAddr := C.GoString(rAddr)
	AddToPeerStore(goPeerID, goRAddr)
}

// export setConnClosed
// func setConnClosed(bleUUID *C.char) {
// 	goBleUUID := C.GoString(bleUUID)
// 	ConnClosed(goBleUUID)
// }

// export sendAcceptToListenerForPeerID
// func sendAcceptToListenerForPeerID(peerID *C.char, ble *C.char, incPeerID *C.char) {
// 	goPeerID := C.GoString(peerID)
// 	goble := C.GoString(ble)
// 	goIncPeerID := C.GoString(incPeerID)
// 	go RealAcceptSender(goPeerID, goble, goIncPeerID)
// }