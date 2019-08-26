// +build android

package core

import (
	"Java/libp2p/transport/ble/GoToJava"
	"Java/libp2p/transport/ble/JavaToGo"

	bledrv "berty.tech/network/transport/ble/driver"
	"go.uber.org/zap"
)

type EventType int32

const (
	handleFoundPeerEvent EventType = 0
	receiveFromPeerEvent EventType = 1
	logEvent             EventType = 2
)

func bindBleFunc() {
	// Bind Go -> Java functions
	bledrv.StartBleDriver = GoToJava.StartBleDriver
	bledrv.StopBleDriver = GoToJava.StopBleDriver
	bledrv.DialPeer = GoToJava.DialPeer
	bledrv.SendToPeer = GoToJava.SendToPeer
	bledrv.CloseConnWithPeer = GoToJava.CloseConnWithPeer

	GoToJava.EnableGoLogger()

	// Run Java -> Go event loop
	go javaToGoEventLoop()
}

func javaToGoEventLoop() {
	for {
		event, _ := JavaToGo.GetEvent()

		switch event.GetType() {
		case handleFoundPeerEvent:
			go handleFoundPeer(event)
		case receiveFromPeerEvent:
			go receiveFromPeer(event)
		case logEvent:
			go log(event)
		}
	}
}

func handleFoundPeer(event JavaToGo.HandleFoundPeerEvent) {
	success := bledrv.HandleFoundPeer(event.RemotePID())
	event.SendResponseToJava(success)
}

func receiveFromPeer(event JavaToGo.ReceiveFromPeerEvent) {
	bledrv.ReceiveFromPeer(event.GetRemotePID(), event.GetPayload())
	event.SendResponseToJava()
}

func log(event JavaToGo.LogEvent) {
	loggerBLE := zap.L().Named(defaultLoggerName + ".ble." + event.GetTag())

	switch event.GetLevel() {
	case "verbose":
		break // No verbose level in zap :/
	case "debug":
		loggerBLE.Debug(event.GetLog())
	case "info":
		loggerBLE.Info(event.GetLog())
	case "warn":
		loggerBLE.Warn(event.GetLog())
	case "error":
		loggerBLE.Error(event.GetLog())
	default:
		loggerBLE.Error("unknown level: <" + event.GetLevel() + "> for log: <" + event.GetLog() + ">")
	}
}
