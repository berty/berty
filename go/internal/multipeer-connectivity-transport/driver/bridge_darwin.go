// +build darwin,cgo

package driver

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation -framework MultipeerConnectivity
#include <stdlib.h>
#include "mc-driver.h"
*/
import "C"

import (
	"unsafe"
)

var (
	GoHandleFoundPeer func(remotePID string) bool            = nil
	GoHandleLostPeer  func(remotePID string)                 = nil
	GoReceiveFromPeer func(remotePID string, payload []byte) = nil
)

// Native -> Go functions
func BindNativeToGoFunctions(hfp func(string) bool, hlp func(string), rfp func(string, []byte)) {
	GoHandleFoundPeer = hfp
	GoHandleLostPeer = hlp
	GoReceiveFromPeer = rfp
}

func StartMCDriver(localPID string) {
	cPID := C.CString(localPID)
	defer C.free(unsafe.Pointer(cPID))

	C.StartMCDriver(cPID)
}

func StopMCDriver() {
	C.StopMCDriver()
}

//export HandleFoundPeer
func HandleFoundPeer(remotePID *C.char) int {
	goPID := C.GoString(remotePID)

	if GoHandleFoundPeer(goPID) {
		return 1
	}
	return 0
}

//export HandleLostPeer
func HandleLostPeer(remotePID *C.char) {
	goPID := C.GoString(remotePID)

	GoHandleLostPeer(goPID)
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

	return C.SendToPeer(cPID, cPayload, C.int(len(payload))) == 1
}

func DialPeer(remotePID string) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	return C.DialPeer(cPID) == 1
}

func CloseConnWithPeer(remotePID string) {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	C.CloseConnWithPeer(cPID)
}
