// +build darwin

package darwin_native

import (
	"unsafe"
)

/*
#cgo darwin CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "BleInterface.h"
*/
import "C"

// Native -> Go functions
var GoHandlePeerFound func(remoteAddr string, remoteID string) bool = nil
var GoReceiveFromDevice func(remoteMa string, payload []byte) = nil

//export handlePeerFound
func handlePeerFound(cRID *C.char, cRAddr *C.char) C.ushort {
	rID := C.GoString(cRID)
	rAddr := C.GoString(cRAddr)

	if GoHandlePeerFound(rID, rAddr) {
		return 1
	}
	return 0
}

//export receiveFromDevice
func receiveFromDevice(cRAddr *C.char, cPayload unsafe.Pointer, cLength C.int) {
	rAddr := C.GoString(cRAddr)
	payload := C.GoBytes(cPayload, cLength)

	GoReceiveFromDevice(rAddr, payload)
}

// Go -> Native functions
func StartBleDriver(localMa string, localID string) bool {
	cLocalMa := C.CString(localMa)
	defer C.free(unsafe.Pointer(cLocalMa))
	cLocalID := C.CString(localID)
	defer C.free(unsafe.Pointer(cLocalID))

	if C.StartBleDriver(cLocalMa, cLocalID) == 1 {
		return true
	}
	return false
}

func StopBleDriver() bool {
	if C.StopBleDriver() == 1 {
		return true
	}
	return false
}

func DialDevice(remoteMa string) bool {
	cRemoteMa := C.CString(remoteMa)
	defer C.free(unsafe.Pointer(cRemoteMa))

	if C.DialDevice(cRemoteMa) == 1 {
		return true
	}
	return false
}

func SendToDevice(remoteMa string, payload []byte) bool {
	cRemoteMa := C.CString(remoteMa)
	defer C.free(unsafe.Pointer(cRemoteMa))
	cPayload := C.ConvertByteSliceToNSData(unsafe.Pointer(&payload[0]), C.int(len(payload)))
	defer C.FreeNSData(cPayload)

	if C.SendToDevice(cRemoteMa, cPayload) == 1 {
		return true
	}
	return false
}

func CloseConnWithDevice(remoteMa string) {
	cRemoteMa := C.CString(remoteMa)
	defer C.free(unsafe.Pointer(cRemoteMa))

	C.CloseConnWithDevice(cRemoteMa)
}
