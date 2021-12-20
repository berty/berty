//go:build darwin && cgo && !catalyst
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
	"fmt"
	"unsafe"

	"go.uber.org/zap"

	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

var (
	Logger       *zap.Logger
	ProtocolName string
)

//export MCHandleFoundPeer
func MCHandleFoundPeer(remotePID *C.char) int {
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

//export MCHandleLostPeer
func MCHandleLostPeer(remotePID *C.char) {
	goPID := C.GoString(remotePID)

	proximity.TransportMapMutex.RLock()
	t, ok := proximity.TransportMap[ProtocolName]
	proximity.TransportMapMutex.RUnlock()
	if !ok {
		return
	}
	t.HandleLostPeer(goPID)
}

//export MCReceiveFromPeer
func MCReceiveFromPeer(remotePID *C.char, payload unsafe.Pointer, length C.int) {
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

//export MCLog
func MCLog(level C.enum_level, message *C.char) { //nolint:golint
	if Logger == nil {
		fmt.Println("logger not found")
		return
	}

	goMessage := C.GoString(message)
	switch level {
	case C.Debug:
		Logger.Debug(goMessage)
	case C.Info:
		Logger.Info(goMessage)
	case C.Warn:
		Logger.Warn(goMessage)
	case C.Error:
		Logger.Error(goMessage)
	}
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

func MCUseExternalLogger() {
	C.MCUseExternalLogger()
}
