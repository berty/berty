// +build darwin

package MPConnectivity

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation
#include <stdlib.h>
#include "MPConnectivity.h"
*/
import "C"
import "unsafe"

func StartBleDriver(addr string, peerId string) bool {
        cAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(cAddr))
	cPeerId := C.CString(peerId)
	defer C.free(unsafe.Pointer(cPeerId))

	if C.StartBleDriver(cAddr, cPeerId) == 1 {
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

/*
   The bridge driver, which is on top level of this driver, set the two pointers GoHandlePeerFound
   and GoReceiveFromDevice to the homologue Go functions.
*/
var GoHandlePeerFound func(addr string, peerId string) bool = nil
var GoReceiveFromDevice func(addr string, payload []byte) = nil

//export HandlePeerFound
func HandlePeerFound(addr *C.char, peerId *C.char) C.int {
	goAddr := C.GoString(addr)
	goPeerId := C.GoString(peerId)

	if GoHandlePeerFound(goAddr, goPeerId) {
		return 1
	}
	return 0
}

//export ReceiveFromDevice
func ReceiveFromDevice(addr *C.char, payload unsafe.Pointer, length C.int) {
	goAddr := C.GoString(addr)
	goPayload := C.GoBytes(payload, length)

	GoReceiveFromDevice(goAddr, goPayload)
}

func SendToDevice(addr string, payload []byte) bool {
	cAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(cAddr))
	cPayload := C.CBytes(payload)
	defer C.free(cPayload)

	if C.SendToDevice(cAddr, cPayload, C.int(len(payload))) == 1 {
		return true
	}
	return false
}

func DialDevice(addr string) bool {
	cAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(cAddr))

	if C.DialDevice(cAddr) == 1 {
		return true
	}
	return false
}

func CloseConnWithDevice(addr string) {
	cAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(cAddr))

	C.CloseConnWithDevice(cAddr)
}
