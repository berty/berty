// +build android

package driver

var StartBleDriver func(localMa string, localID string) bool = nil
var StopBleDriver func() bool = nil

var DialDevice func(remoteMa string) bool = nil
var SendToDevice func(remoteMa string, payload []byte) bool = nil
var CloseConnWithDevice func(remoteMa string) = nil
