// +build android

package driver

// Native -> Go functions
var HandlePeerFound func(remoteAddr string, remoteID string) bool = nil
var ReceiveFromDevice func(remoteMa string, payload []byte) = nil

func BindNativeToGoFunctions(hpf func(string, string) bool, rfd func(string, []byte)) {
	HandlePeerFound = hpf
	ReceiveFromDevice = rfd
}

// Go -> Native functions
var StartBleDriver func(localMa string, localID string) bool = nil
var StopBleDriver func() bool = nil
var DialDevice func(remoteMa string) bool = nil
var SendToDevice func(remoteMa string, payload []byte) bool = nil
var CloseConnWithDevice func(remoteMa string) = nil
