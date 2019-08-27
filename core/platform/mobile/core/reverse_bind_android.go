// +build android

package core

import (
	"Java/libp2p/transport/ble/GoToJava"
	"Java/libp2p/transport/ble/JavaToGo"
	"Java/libp2p/transport/ble/JavaToGo/EventContainer"
	"Java/libp2p/transport/ble/JavaToGo/HandleFoundPeerEvent"
	"Java/libp2p/transport/ble/JavaToGo/ReceiveFromPeerEvent"
	"Java/libp2p/transport/ble/JavaToGo/LogEvent"
)

var _ = GoToJava.EnableGoLogger
var _ = GoToJava.SetApplicationContext

var _ = GoToJava.StartBleDriver
var _ = GoToJava.StopBleDriver
var _ = GoToJava.DialPeer
var _ = GoToJava.SendToPeer
var _ = GoToJava.CloseConnWithPeer

var _ = JavaToGo.GetEvent
var _ = EventContainer.New().GetType
var _ = EventContainer.New().GetHandleFoundPeerEvent
var _ = EventContainer.New().GetReceiveFromPeerEvent
var _ = EventContainer.New().GetLogEvent
var _ = HandleFoundPeerEvent.New("").GetRemotePID
var _ = HandleFoundPeerEvent.New("").SendResponseToJava
var _ = ReceiveFromPeerEvent.New("", []byte{}).GetRemotePID
var _ = ReceiveFromPeerEvent.New("", []byte{}).GetPayload
var _ = ReceiveFromPeerEvent.New("", []byte{}).SendResponseToJava
var _ = LogEvent.New("", "", "").GetTag
var _ = LogEvent.New("", "", "").GetLevel
var _ = LogEvent.New("", "", "").GetLog
