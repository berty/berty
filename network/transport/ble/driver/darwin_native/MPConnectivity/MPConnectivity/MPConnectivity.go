// +build darwin

package MPConnectivity

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation -framework MultipeerConnectivity
#include <stdlib.h>
#include "MPConnectivity.h"
*/
import "C"
import "unsafe"

const MULTI_ADDRESS_NULL = "/ble/00000000-0000-0000-0000-000000000000"
const FAKE_PEERID = "QmTBKLtG5FsSogqquvdvDQ6Sn2rANYCbvXAStthdd686BY"

func StartBleDriver(addr string, peerId string) bool {
	lAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(lAddr))

	if C.StartBleDriver(lAddr) == 1 {
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
var GoHandlePeerFound func(peerId string, addr string) bool = nil
var GoReceiveFromDevice func(addr string, payload []byte) = nil

/*
   GoHandlePeerFound wait for its first argument a multiaddress string.
   It's deprecated so we give it the peerID twice.
*/
//export HandlePeerFound
func HandlePeerFound(addr *C.char) C.int {
	lAddr := C.GoString(addr)

	if GoHandlePeerFound(FAKE_PEERID, lAddr) {
		return 1
	}
	return 0
}

//export ReceiveFromPeer
func ReceiveFromPeer(addr *C.char, payload unsafe.Pointer, length C.int) {
	lAddr := C.GoString(addr)
	lPayload := C.GoBytes(payload, length)

	GoReceiveFromDevice(lAddr, lPayload)
}

func SendToDevice(addr string, payload []byte) bool {
	lAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(lAddr))
	lPayload := C.CBytes(payload)
	defer C.free(lPayload)

	if C.SendToPeer(lAddr, lPayload, C.int(len(payload))) == 1 {
		return true
	}
	return false
}

func DialDevice(addr string) bool {
	lAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(lAddr))

	if C.DialPeer(lAddr) == 1 {
		return true
	}
	return false
}

func CloseConnWithDevice(addr string) {
	lAddr := C.CString(addr)
	defer C.free(unsafe.Pointer(lAddr))

	C.CloseConnWithPeer(lAddr)
}
