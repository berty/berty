// +build android

package core

import (
	"Java/chat/berty/ble/Manager"
	"fmt"

	"berty.tech/core/network/ble"
)

func initBleFunc() {
	// fmt.Printf("INSTANCE: %+v\n\n\n\n\n", Manager.GetInstance())
	ble.SetMa = Manager.GetInstance().SetMa
	ble.SetPeerID = Manager.GetInstance().SetPeerID
	ble.StartScanning = Manager.GetInstance().StartScanning
	ble.StartAdvertising = Manager.GetInstance().StartAdvertising
	ble.Write = Manager.GetInstance().Write
	ble.DialPeer = Manager.GetInstance().DialPeer
}

func JavaToGo() string {
	return "COMING FROM GOLANG"
}

func ConnClose(bleUUID string) {
	ble.ConnClose(bleUUID)
}

func ConnClosed(bleUUID string) {
	ble.ConnClosed(bleUUID)
}

func BytesToConn(bleUUID string, b []byte) {
	fmt.Printf("BYTES TO CONN FROM JAVA %+v\n", b)
	ble.BytesToConn(bleUUID, b)
}

func RealAcceptSender(peerID string, bleUUID string, incPeerID string) {
	ble.RealAcceptSender(peerID, bleUUID, incPeerID)
}

func AddToPeerStore(peerID string, rAddr string) {
	ble.AddToPeerStore(peerID, rAddr)
}
