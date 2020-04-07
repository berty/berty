// +build darwin
// In this file, we'll start the two drivers: universal BLE and MultiPeer Connectivity drivers
// Currently, we start MultiPeer Connectivity only

package darwin_native

import MPConnectivity "berty.tech/network/transport/ble/driver/darwin_native/MPConnectivity/MPConnectivity"

func StartBleDriver(localPID string) bool {
	MPConnectivity.GoHandleFoundPeer = GoHandleFoundPeer;
	MPConnectivity.GoReceiveFromPeer = GoReceiveFromPeer;
	return MPConnectivity.StartBleDriver(localPID)
}

func StopBleDriver() {
	MPConnectivity.StopBleDriver();
}

var GoHandleFoundPeer func(remotePID string) bool = nil

var GoReceiveFromPeer func(remotePID string, payload []byte) = nil

func SendToPeer(remotePID string, payload []byte) bool {
	return MPConnectivity.SendToPeer(remotePID, payload)
}

func DialPeer(remotePeer string) bool {
	return MPConnectivity.DialPeer(remotePeer)
}

func CloseConnWithPeer(remotePID string) {
	MPConnectivity.CloseConnWithPeer(remotePID)
}
