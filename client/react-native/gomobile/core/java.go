// +build android

package core

import (
	"Java/chat/berty/ble/BleManager"
	"Java/chat/berty/ble/DeviceManager"

	"berty.tech/core/network/ble"
	"go.uber.org/zap"
)

func initBleFunc() {
	// fmt.Printf("INSTANCE: %+v\n\n\n\n\n", Manager.GetInstance())
	// TODO: Check return of startScanning / startAdvertising / initScannerAndAdvertiser / closeScannerAndAdvertiser / etc...
	ble.SetMa = BleManager.SetMultiAddr
	ble.SetPeerID = BleManager.SetPeerID
	ble.StartScanning = BleManager.StartScanning
	ble.StartAdvertising = BleManager.StartAdvertising
	ble.Write = DeviceManager.WriteToDevice
	ble.DialPeer = DeviceManager.DialPeer
	ble.InitScannerAndAdvertiser = BleManager.InitBluetoothService
	ble.CloseScannerAndAdvertiser = BleManager.CloseBluetoothService
	ble.CloseConnFromMa = DeviceManager.DisconnectFromDevice
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
