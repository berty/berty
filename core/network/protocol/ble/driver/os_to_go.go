package driver

// Sadly golang doesn't support circular depencies
// Functions are binded during the init of parent package
var ReceiveFromDevice func(remoteMa string, payload []byte) = nil
var ConnClosedWithDevice func(remoteMa string) = nil
var HandlePeerFound func(remoteAddr string, remoteID string) bool = nil
