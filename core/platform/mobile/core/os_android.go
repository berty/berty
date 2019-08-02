// +build android

package core

import (
	"Java/chat/berty/ble/BleManager"
	"Java/chat/berty/ble/DeviceManager"

	bledrv "berty.tech/network/transport/ble/driver"
	"go.uber.org/zap"
)

// Bind Go -> Native functions
func bindBleFunc() {
	bledrv.StartBleDriver = BleManager.StartBleDriver
	bledrv.StopBleDriver = BleManager.StopBleDriver
	bledrv.DialDevice = DeviceManager.DialDevice
	bledrv.SendToDevice = DeviceManager.SendToDevice
	bledrv.CloseConnWithDevice = DeviceManager.CloseConnWithDevice
}

// Native -> Go functions
func HandlePeerFound(rID string, rAddr string) bool {
	return bledrv.HandlePeerFound(rID, rAddr)
}

func ReceiveFromDevice(rAddr string, payload []byte) {
	bledrv.ReceiveFromDevice(rAddr, payload)
}

// @FIXME: ConnClosedWithDevice is undefined
func ConnClosedWithDevice(rAddr string) {
	// bledrv.ConnClosedWithDevice(rAddr)
}

// Native logger -> Go zaplogger
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
