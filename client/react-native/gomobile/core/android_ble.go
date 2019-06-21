// +build android

package core

import (
	"Java/chat/berty/ble/BleManager"
	"Java/chat/berty/ble/DeviceManager"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	"go.uber.org/zap"
)

func initBleFunc() {
	// TODO: Refactor this, see core/network/protocol/ble/driver/os_android.go
	bledrv.SetMa = BleManager.SetMultiAddr
	bledrv.SetPeerID = BleManager.SetPeerID
	bledrv.StartScanning = BleManager.StartScanning
	bledrv.StartAdvertising = BleManager.StartAdvertising
	bledrv.Write = DeviceManager.WriteToDevice
	bledrv.DialPeer = DeviceManager.DialPeer
	bledrv.InitScannerAndAdvertiser = BleManager.InitBluetoothService
	bledrv.CloseScannerAndAdvertiser = BleManager.CloseBluetoothService
	bledrv.CloseConnFromMa = DeviceManager.DisconnectFromDevice
}

// TODO: Rename this function
func ConnClosed(rAddr string) {
	bledrv.CloseConnWithDevice(rAddr)
}

// TODO: Rename this function
func BytesToConn(rAddr string, b []byte) {
	bledrv.ReceiveFromDevice(rAddr, b)
}

// TODO: Rename this function
func AddToPeerStore(rID string, rAddr string) {
	// TODO: Check return on native side (disconnect device if error)
	_ = bledrv.HandlePeerFound(rID, rAddr)
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
