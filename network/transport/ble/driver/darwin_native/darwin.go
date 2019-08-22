package darwin_native

import (
	"unsafe"
)

/*
#cgo darwin CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wno-unused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "BleInterface.h"
*/
import "C"

// Native -> Go functions
var GoHandleFoundPeer func(remotePID string) bool = nil
var GoReceiveFromPeer func(remotePID string, payload []byte) = nil

//export handleFoundPeer
func handleFoundPeer(cRPID *C.char) C.ushort {
	rPID := C.GoString(cRPID)

	if GoHandleFoundPeer(rPID) {
		return 1
	}
	return 0
}

//export receiveFromPeer
func receiveFromPeer(cRPID *C.char, cPayload unsafe.Pointer, cLength C.int) {
	rPID := C.GoString(cRPID)
	payload := C.GoBytes(cPayload, cLength)

	GoReceiveFromPeer(rPID, payload)
}

// Go -> Native functions
func StartBleDriver(localPID string) bool {
	cLocalPID := C.CString(localPID)
	defer C.free(unsafe.Pointer(cLocalPID))

	if C.StartBleDriver(cLocalPID) == 1 {
		return true
	}
	return false
}

func StopBleDriver() {
	C.StopBleDriver()
}

func DialPeer(remotePID string) bool {
	cRemotePID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cRemotePID))

	if C.DialPeer(cRemotePID) == 1 {
		return true
	}
	return false
}

func SendToPeer(remotePID string, payload []byte) bool {
	cRemotePID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cRemotePID))
	cPayload := C.ConvertByteSliceToNSData(unsafe.Pointer(&payload[0]), C.int(len(payload)))
	defer C.FreeNSData(cPayload)

	if C.SendToPeer(cRemotePID, cPayload) == 1 {
		return true
	}
	return false
}

func CloseConnWithPeer(remotePID string) {
	cRemotePID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cRemotePID))

	C.CloseConnWithPeer(cRemotePID)
}
