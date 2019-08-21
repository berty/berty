// +build darwin

package driver

import (
	native "berty.tech/network/transport/ble/driver/darwin_native"
)

// Native -> Go functions
func BindNativeToGoFunctions(hpf func(string, string) bool, rfd func(string, []byte)) {
	native.GoHandlePeerFound = hpf
	native.GoReceiveFromDevice = rfd
}

// Go -> Native functions
func StartBleDriver(localMa string, localID string) bool {
	return native.StartBleDriver(localMa, localID)
}

func StopBleDriver() {
	return native.StopBleDriver()
}

func DialDevice(remoteMa string) bool {
	return native.DialDevice(remoteMa)
}

func SendToDevice(remoteMa string, payload []byte) bool {
	return native.SendToDevice(remoteMa, payload)
}

func CloseConnWithDevice(remoteMa string) {
	native.CloseConnWithDevice(remoteMa)
}
