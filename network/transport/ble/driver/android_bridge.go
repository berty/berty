// +build android

package driver

import (
	"Java/libp2p/transport/ble/GoToJava"
	"Java/libp2p/transport/ble/JavaToGo"
)

// Native -> Go functions
var HandleFoundPeer func(remotePID string) bool = nil
var ReceiveFromPeer func(remotePID string, payload []byte) = nil

func BindNativeToGoFunctions(hfp func(string) bool, rfp func(string, []byte)) {
	HandleFoundPeer = hfp
	ReceiveFromPeer = rfp
}

type EventType int

const (
	handleFoundPeerEvent EventType = 0
	receiveFromPeerEvent EventType = 1
	logEvent             EventType = 2
	interruptEvent       EventType = 3
)

func javaToGoEventLoop() {
	for {
		eventContainer, _ := JavaToGo.GetEvent()

		switch EventType(eventContainer.GetType()) {
		case handleFoundPeerEvent:
			go handleFoundPeer(eventContainer.GetHandleFoundPeerEvent())
		case receiveFromPeerEvent:
			go receiveFromPeer(eventContainer.GetReceiveFromPeerEvent())
		case logEvent:
			go log(eventContainer.GetLogEvent())
		case interruptEvent:
			break
		}
	}
}

func handleFoundPeer(event JavaToGo.HandleFoundPeerEvent) {
	success := HandleFoundPeer(event.GetRemotePID())
	event.SendResponseToJava(success)
}

func receiveFromPeer(event JavaToGo.ReceiveFromPeerEvent) {
	ReceiveFromPeer(event.GetRemotePID(), event.GetPayload())
	event.SendResponseToJava()
}

func log(event JavaToGo.LogEvent) {
	loggerJavaToGo := logger().Named(event.GetTag()) // Append Java tag to logger name

	switch event.GetLevel() {
	case "verbose":
		break // No verbose level in zap :/
	case "debug":
		loggerJavaToGo.Debug(event.GetLog())
	case "info":
		loggerJavaToGo.Info(event.GetLog())
	case "warn":
		loggerJavaToGo.Warn(event.GetLog())
	case "error":
		loggerJavaToGo.Error(event.GetLog())
	default:
		loggerJavaToGo.Error("unknown level: <" + event.GetLevel() + "> for log: <" + event.GetLog() + ">")
	}
}

// Go -> Native functions
func StartBleDriver(localPID string) bool {
	go javaToGoEventLoop()    // Started from Go, stopped from Java
	GoToJava.EnableGoLogger() // TODO: find a clean way to expose this
	GoToJava.SetApplicationContext(nil) // TODO: find a clean way to expose this
	return GoToJava.StartBleDriver(localPID)
}

var StopBleDriver func() = GoToJava.StopBleDriver
var DialPeer func(remotePID string) bool = GoToJava.DialPeer
var SendToPeer func(remotePID string, payload []byte) bool = GoToJava.SendToPeer
var CloseConnWithPeer func(remotePID string) = GoToJava.CloseConnWithPeer
