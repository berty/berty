// +build darwin

package driver

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

/* TODO: Refactor this file and correponding objC to have this functions only:
GO -> NATIVE:
StartBleDriver(localMa string, localID string) bool
StopBleDriver() bool

SendToDevice(remoteMa string, payload []byte) bool
CloseConnWithDevice(remoteMa string)


NATIVE -> GO:
ReceiveFromDevice(remoteMa string, payload []byte)
ConnClosedWithDevice(remoteMa string)
NotifyPeerFound(remoteAddr string, remoteID string) bool
*/

//export sendBytesToConn
func sendBytesToConn(bleUUID *C.char, bytes unsafe.Pointer, length C.int) {
	rAddr := C.GoString(bleUUID)
	b := C.GoBytes(bytes, length)
	ReceiveFromDevice(rAddr, b)
}

//export AddToPeerStoreC
func AddToPeerStoreC(rID *C.char, rAddr *C.char) {
	goRID := C.GoString(rID)
	goRAddr := C.GoString(rAddr)
	// TODO: Check return on native side (disconnect device if error)
	_ = HandlePeerFound(goRID, goRAddr)
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
	return true
}

func DialPeer(ma string) bool {
	cMa := C.CString(ma)
	defer C.free(unsafe.Pointer(cMa))
	if C.dialPeer(cMa) == 1 {
		return true
	}
	return false
}

func InitScannerAndAdvertiser() { C.InitScannerAndAdvertiser() }

func CloseScannerAndAdvertiser() {
	C.closeBle()
}

func CloseConnWithDevice(ma string) {
	// ma := C.CString(val)
	// logger().Debug("BLEConn close", zap.String("VALUE",val))
	// defer C.free(unsafe.Pointer(ma))
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
