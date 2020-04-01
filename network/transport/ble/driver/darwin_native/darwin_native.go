// +build darwin
// In this file, we'll start the two drivers: universal BLE and MultiPeer Connectivity drivers
// Currently, we start MultiPeer Connectivity only

package darwin_native

import MPConnectivity "berty.tech/network/transport/ble/driver/darwin_native/MPConnectivity/MPConnectivity"

func StartBleDriver(addr string, peerID string) bool {
	MPConnectivity.GoHandlePeerFound = GoHandlePeerFound;
	MPConnectivity.GoReceiveFromDevice = GoReceiveFromDevice;
	return MPConnectivity.StartBleDriver(addr, peerID)
}

func StopBleDriver() bool {
	return MPConnectivity.StopBleDriver();
}

var GoHandlePeerFound func(peerId string, addr string) bool = MPConnectivity.GoHandlePeerFound

var GoReceiveFromDevice func(addr string, payload []byte) = MPConnectivity.GoReceiveFromDevice

func SendToDevice(addr string, payload []byte) bool {
	return MPConnectivity.SendToDevice(addr, payload)
}

func DialDevice(addr string) bool {
	return MPConnectivity.DialDevice(addr)
}

func CloseConnWithDevice(addr string) {
	MPConnectivity.CloseConnWithDevice(addr)
}
