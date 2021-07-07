// +build darwin,cgo,!catalyst

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

	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

var ProtocolName string

//export HandleFoundPeer
func HandleFoundPeer(remotePID *C.char) int {
	goPID := C.GoString(remotePID)

	t, ok := proximity.TransportMap.Load(ProtocolName)
	if !ok {
		return 0
	}
	if t.(proximity.ProximityTransport).HandleFoundPeer(goPID) {
		return 1
	}
	return 0
}

//export HandleLostPeer
func HandleLostPeer(remotePID *C.char) {
	goPID := C.GoString(remotePID)

	t, ok := proximity.TransportMap.Load(ProtocolName)
	if !ok {
		return
	}
	t.(proximity.ProximityTransport).HandleLostPeer(goPID)
}

//export ReceiveFromPeer
func ReceiveFromPeer(remotePID *C.char, payload unsafe.Pointer, length C.int) {
	goPID := C.GoString(remotePID)
	goPayload := C.GoBytes(payload, length)

	t, ok := proximity.TransportMap.Load(ProtocolName)
	if !ok {
		return
	}
	t.(proximity.ProximityTransport).ReceiveFromPeer(goPID, goPayload)
}

func Start(localPID string) {
	cPID := C.CString(localPID)
	defer C.free(unsafe.Pointer(cPID))

	C.StartMCDriver(cPID)
}

func Stop() {
	C.StopMCDriver()
}

func DialPeer(remotePID string) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	return C.DialPeer(cPID) == 1
}

func SendToPeer(remotePID string, payload []byte) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))
	cPayload := C.CBytes(payload)
	defer C.free(cPayload)

	return C.SendToPeer(cPID, cPayload, C.int(len(payload))) == 1
}

func CloseConnWithPeer(remotePID string) {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	C.CloseConnWithPeer(cPID)
}
