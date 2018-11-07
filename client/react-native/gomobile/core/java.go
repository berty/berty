// +build android

package core

import (
	"Java/chat/berty/ble/Manager"
	"fmt"
)

func JavaExportTestFunc() {
	fmt.Printf("LALALALLA %+v\n\n\n", Manager.GetInstance())
}

func JavaCallTestFunc() {
	fmt.Printf("REAL SHIT %+v\n\n\n\n\n", Manager.GetInstance().RealTest())
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
	ble.BytesToConn(bleUUID, b)
}

func RealAcceptSender(peerID string, ble string, incPeerID string) {
	ble.RealAcceptSender(peerID, ble, incPeerID)
}

func AddToPeerStore(peerID string, rAddr string) {
	ble.AddToPeerStore(peerID, rAddr)
}