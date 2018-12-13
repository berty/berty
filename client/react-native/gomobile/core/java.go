// +build android

package core

import (
	"Java/chat/berty/ble/Manager"

	"berty.tech/core/network/ble"
	"go.uber.org/zap"
)

func initBleFunc() {
	// fmt.Printf("INSTANCE: %+v\n\n\n\n\n", Manager.GetInstance())
	ble.SetMa = Manager.GetInstance().SetMa
	ble.SetPeerID = Manager.GetInstance().SetPeerID
	ble.StartScanning = Manager.GetInstance().StartScanning
	ble.StartAdvertising = Manager.GetInstance().StartAdvertising
	ble.Write = Manager.GetInstance().Write
	ble.DialPeer = Manager.GetInstance().DialPeer
	ble.InitScannerAndAdvertiser = Manager.GetInstance().InitScannerAndAdvertiser
	ble.CloseScannerAndAdvertiser = Manager.GetInstance().CloseScannerAndAdvertiser
	ble.CloseConnFromMa = Manager.GetInstance().CloseConnFromMa
}

func JavaToGo() string {
	defer panicHandler()
	return "COMING FROM GOLANG"
}

func ConnClosed(bleUUID string) {
	defer panicHandler()
	ble.ConnClosed(bleUUID)
}

func BytesToConn(bleUUID string, b []byte) {
	defer panicHandler()
	ble.BytesToConn(bleUUID, b)
}

func RealAcceptSender(peerID string, bleUUID string, incPeerID string) {
	defer panicHandler()
	ble.RealAcceptSender(peerID, bleUUID, incPeerID)
}

func AddToPeerStore(peerID string, rAddr string) {
	defer panicHandler()
	ble.AddToPeerStore(peerID, rAddr)
}

func GoLogger(tag string, level string, log string) {
	loggerBLE := zap.L().Named(defaultLoggerName + ".ble." + tag)

	switch level {
	case "debug":
		loggerBLE.Debug(log)
	case "info":
		loggerBLE.Info(log)
	case "warn":
		loggerBLE.Warn(log)
	case "error":
		loggerBLE.Error(log)
	default:
		loggerBLE.Error("unknown level: <" + level + "> for log: <" + log + ">")
	}
}
