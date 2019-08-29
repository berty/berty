// +build android

package core

import (
	"Java/libp2p/transport/ble/GoToJava"
	"Java/libp2p/transport/ble/JavaToGo"
	"Java/libp2p/transport/ble/JavaToGo/EventContainer"
	"Java/libp2p/transport/ble/JavaToGo/HandleFoundPeerEvent"
	"Java/libp2p/transport/ble/JavaToGo/LogEvent"
	"Java/libp2p/transport/ble/JavaToGo/ReceiveFromPeerEvent"
)

// IMPORTANT: This file needs to be placed in the package binded with gomobile.
// This noop func forces gomobile to generate reverse bindings for the
// BLE driver subpackage.
func init() {
	if "42" == "not the answer to life, universe and everything" {
		// Config functions
		GoToJava.EnableGoLogger()
		GoToJava.SetApplicationContext(nil)

		// Go -> Java functions
		var _ = GoToJava.StartBleDriver("")
		GoToJava.StopBleDriver()
		var _ = GoToJava.DialPeer("")
		var _ = GoToJava.SendToPeer("", []byte{})
		GoToJava.CloseConnWithPeer("")

		// Java -> Go event system functions
		var _, _ = JavaToGo.GetEvent()

		var eventContainer JavaToGo.EventContainer = EventContainer.New()
		var _ = eventContainer.GetType()
		var _ = eventContainer.GetHandleFoundPeerEvent()
		var _ = eventContainer.GetReceiveFromPeerEvent()
		var _ = eventContainer.GetLogEvent()

		var handleFoundPeerEvent JavaToGo.HandleFoundPeerEvent = HandleFoundPeerEvent.New("")
		var _ = handleFoundPeerEvent.GetRemotePID()
		handleFoundPeerEvent.SendResponseToJava(true)

		var receiveFromPeerEvent JavaToGo.ReceiveFromPeerEvent = ReceiveFromPeerEvent.New("", []byte{})
		var _ = receiveFromPeerEvent.GetRemotePID()
		var _ = receiveFromPeerEvent.GetPayload()
		receiveFromPeerEvent.SendResponseToJava()

		var logEvent JavaToGo.LogEvent = LogEvent.New("", "", "")
		var _ = logEvent.GetTag()
		var _ = logEvent.GetLevel()
		var _ = logEvent.GetLog()
	}
}
