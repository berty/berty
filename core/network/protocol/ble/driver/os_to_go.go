package driver

// Sadly golang doesn't support circular depencies
// Functions binded during init of parent package
var ReceiveFromDevice func(remoteMa string, payload []byte) = nil
var ConnClosedWithDevice func(remoteMa string) = nil
var HandlePeerFound func(remoteAddr string, remoteID string) bool = nil
