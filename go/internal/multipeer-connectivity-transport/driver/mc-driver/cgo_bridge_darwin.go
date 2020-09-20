// +build darwin,cgo

package mcdriver

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation -framework MultipeerConnectivity
#include <stdlib.h>
#include "mc-driver.h"
*/
import "C"
import "unsafe"

func StartMCDriver(localPID string) {
	cPID := C.CString(localPID)
	defer C.free(unsafe.Pointer(cPID))

	C.StartMCDriver(cPID)
}

func StopMCDriver() {
	C.StopMCDriver()
}

var (
	GoHandleFoundPeer func(remotePID string) bool            = nil
	GoReceiveFromPeer func(remotePID string, payload []byte) = nil
)

//export HandleFoundPeer
func HandleFoundPeer(remotePID *C.char) C.int {
	goPID := C.GoString(remotePID)

	if GoHandleFoundPeer(goPID) {
		return 1
	}
	return 0
}

//export ReceiveFromPeer
func ReceiveFromPeer(remotePID *C.char, payload unsafe.Pointer, length C.int) {
	goPID := C.GoString(remotePID)
	goPayload := C.GoBytes(payload, length)

	GoReceiveFromPeer(goPID, goPayload)
}

func SendToPeer(remotePID string, payload []byte) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))
	cPayload := C.CBytes(payload)
	defer C.free(cPayload)

	if C.SendToPeer(cPID, cPayload, C.int(len(payload))) == 1 {
		return true
	}
	return false
}

func DialPeer(remotePID string) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	if C.DialPeer(cPID) == 1 {
		return true
	}
	return false
}

func CloseConnWithPeer(remotePID string) {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	C.CloseConnWithPeer(cPID)
}
