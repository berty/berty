//go:build darwin && cgo
// +build darwin,cgo

package ble

/*
#cgo CFLAGS: -x objective-c -fno-objc-arc
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#include <stdlib.h>
#import "BleInterface_darwin.h"
#import "Logger.h"
*/
import "C"

import (
	"fmt"
	"unsafe"

	"go.uber.org/zap"

	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

const Supported = true

var gLogger *zap.Logger

type Driver struct {
	protocolCode int
	protocolName string
	defaultAddr  string
}

// Driver is a proximity.ProximityDriver
var _ proximity.ProximityDriver = (*Driver)(nil)

func NewDriver(logger *zap.Logger) proximity.ProximityDriver {
	if logger == nil {
		logger = zap.NewNop()
	} else {
		logger = logger.Named("BLE")
		logger.Debug("NewDriver()")
		C.BLEUseExternalLogger()
	}
	gLogger = logger

	return &Driver{
		protocolCode: ProtocolCode,
		protocolName: ProtocolName,
		defaultAddr:  DefaultAddr,
	}
}

//export BLEHandleFoundPeer
func BLEHandleFoundPeer(remotePID *C.char) int { // nolint:golint // Need to prefix func name to avoid duplicate symbols between proximity drivers
	goPID := C.GoString(remotePID)

	proximity.TransportMapMutex.RLock()
	t, ok := proximity.TransportMap[ProtocolName]
	proximity.TransportMapMutex.RUnlock()
	if !ok {
		return 0
	}
	if t.HandleFoundPeer(goPID) {
		return 1
	}
	return 0
}

//export BLEHandleLostPeer
func BLEHandleLostPeer(remotePID *C.char) { // nolint:golint // Need to prefix func name to avoid duplicate symbols between proximity drivers
	goPID := C.GoString(remotePID)

	proximity.TransportMapMutex.RLock()
	t, ok := proximity.TransportMap[ProtocolName]
	proximity.TransportMapMutex.RUnlock()
	if !ok {
		return
	}
	t.HandleLostPeer(goPID)
}

//export BLEReceiveFromPeer
func BLEReceiveFromPeer(remotePID *C.char, payload unsafe.Pointer, length C.int) { // nolint:golint // Need to prefix func name to avoid duplicate symbols between proximity drivers
	goPID := C.GoString(remotePID)
	goPayload := C.GoBytes(payload, length)

	proximity.TransportMapMutex.RLock()
	t, ok := proximity.TransportMap[ProtocolName]
	proximity.TransportMapMutex.RUnlock()
	if !ok {
		return
	}
	t.ReceiveFromPeer(goPID, goPayload)
}

//export BLELog
func BLELog(level C.enum_level, message *C.char) { //nolint:golint
	if gLogger == nil {
		fmt.Println("logger not found")
		return
	}

	goMessage := C.GoString(message)
	switch level {
	case C.Debug:
		gLogger.Debug(goMessage)
	case C.Info:
		gLogger.Info(goMessage)
	case C.Warn:
		gLogger.Warn(goMessage)
	case C.Error:
		gLogger.Error(goMessage)
	}
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
