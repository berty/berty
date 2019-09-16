// +build android

package core

import (
	"Java/libp2p/transport/ble/BleManager"
	"Java/libp2p/transport/ble/DeviceManager"

	bledrv "berty.tech/network/transport/ble/driver"
	"go.uber.org/zap"
)

// Native -> Go object and functions
type GoBridgeImplem struct {
	BleManager.GoBridge // Java interface
}

func NewGoBridgeImplem() *GoBridgeImplem {
	return &GoBridgeImplem{}
}

func (gb *GoBridgeImplem) HandlePeerFound(rID string, rAddr string) bool {
	return bledrv.HandlePeerFound(rID, rAddr)
}

func (gb *GoBridgeImplem) ReceiveFromDevice(rAddr string, payload []byte) {
	bledrv.ReceiveFromDevice(rAddr, payload)
}

func (gb *GoBridgeImplem) Log(tag string, level string, log string) {
	loggerBLE := zap.L().Named(defaultLoggerName + ".ble." + tag)

	switch level {
	case "verbose":
		break // No verbose level in zap :/
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

func bindBleFunc() {
	// Bind Go -> Native functions
	bledrv.StartBleDriver = BleManager.StartBleDriver
	bledrv.StopBleDriver = BleManager.StopBleDriver
	bledrv.DialDevice = DeviceManager.DialDevice
	bledrv.SendToDevice = DeviceManager.SendToDevice
	bledrv.CloseConnWithDevice = DeviceManager.CloseConnWithDevice
}
