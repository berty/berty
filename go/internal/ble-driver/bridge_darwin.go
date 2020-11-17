// +build darwin,cgo

package ble

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#include <stdlib.h>
#import "BleInterface_darwin.h"
*/
import "C"

import (
	"unsafe"

	"go.uber.org/zap"

	proximity "berty.tech/berty/v2/go/internal/proximity-transport"
)

const Supported = true

type Driver struct {
	protocolCode int
	protocolName string
	defaultAddr  string
}

// Driver is a proximity.NativeDriver
var _ proximity.NativeDriver = (*Driver)(nil)

func NewDriver(logger *zap.Logger) proximity.NativeDriver {
	logger = logger.Named("BLE")
	logger.Debug("NewDriver()")

	return &Driver{
		protocolCode: ProtocolCode,
		protocolName: ProtocolName,
		defaultAddr:  DefaultAddr,
	}
}

//export BLEHandleFoundPeer
func BLEHandleFoundPeer(remotePID *C.char) int { // nolint:golint // Need to prefix func name to avoid duplicate symbols between proximity drivers
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

//export BLEHandleLostPeer
func BLEHandleLostPeer(remotePID *C.char) { // nolint:golint // Need to prefix func name to avoid duplicate symbols between proximity drivers
	goPID := C.GoString(remotePID)

	t, ok := proximity.TransportMap.Load(ProtocolName)
	if !ok {
		return
	}
	t.(proximity.ProximityTransport).HandleLostPeer(goPID)
}

//export BLEReceiveFromPeer
func BLEReceiveFromPeer(remotePID *C.char, payload unsafe.Pointer, length C.int) { // nolint:golint // Need to prefix func name to avoid duplicate symbols between proximity drivers
	goPID := C.GoString(remotePID)
	goPayload := C.GoBytes(payload, length)

	t, ok := proximity.TransportMap.Load(ProtocolName)
	if !ok {
		return
	}
	t.(proximity.ProximityTransport).ReceiveFromPeer(goPID, goPayload)
}

func (d *Driver) Start(localPID string) {
	cPID := C.CString(localPID)
	defer C.free(unsafe.Pointer(cPID))

	C.BLEStart(cPID)
}

func (d *Driver) Stop() {
	C.BLEStop()
}

func (d *Driver) DialPeer(remotePID string) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	return C.BLEDialPeer(cPID) == 1
}

func (d *Driver) SendToPeer(remotePID string, payload []byte) bool {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))
	cPayload := C.CBytes(payload)
	defer C.free(cPayload)

	return C.BLESendToPeer(cPID, cPayload, C.int(len(payload))) == 1
}

func (d *Driver) CloseConnWithPeer(remotePID string) {
	cPID := C.CString(remotePID)
	defer C.free(unsafe.Pointer(cPID))

	C.BLECloseConnWithPeer(cPID)
}

func (d *Driver) ProtocolCode() int {
	return d.protocolCode
}

func (d *Driver) ProtocolName() string {
	return d.protocolName
}

func (d *Driver) DefaultAddr() string {
	return d.defaultAddr
}
