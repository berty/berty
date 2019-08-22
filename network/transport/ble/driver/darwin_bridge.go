// +build darwin

package driver

import (
	native "berty.tech/network/transport/ble/driver/darwin_native"
)

// Native -> Go functions
func BindNativeToGoFunctions(hfp func(string) bool, rfp func(string, []byte)) {
	native.GoHandleFoundPeer = hfp
	native.GoReceiveFromPeer = rfp
}

// Go -> Native functions
func StartBleDriver(localPID string) bool {
	return native.StartBleDriver(localPID)
}

func StopBleDriver() {
	native.StopBleDriver()
}

func DialPeer(remotePID string) bool {
	return native.DialPeer(remotePID)
}

func SendToPeer(remotePID string, payload []byte) bool {
	return native.SendToPeer(remotePID, payload)
}

func CloseConnWithPeer(remotePID string) {
	native.CloseConnWithPeer(remotePID)
}
