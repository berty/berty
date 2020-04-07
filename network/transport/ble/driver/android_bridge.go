// +build android

package driver

// Native -> Go functions
var HandleFoundPeer func(remotePID string) bool = nil
var ReceiveFromPeer func(remotePID string, payload []byte) = nil

func BindNativeToGoFunctions(hfp func(string) bool, rfp func(string, []byte)) {
	HandleFoundPeer = hfp
	ReceiveFromPeer = rfp
}

// Go -> Native functions
var StartBleDriver func(localPID string) bool = nil
var StopBleDriver func() = nil
var DialPeer func(remotePID string) bool = nil
var SendToPeer func(remotePID string, payload []byte) bool = nil
var CloseConnWithPeer func(remotePID string) = nil
