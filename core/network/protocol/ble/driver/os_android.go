// +build android

package driver

/* TODO: Refactor this file and correponding java to have this functions only:
GO -> NATIVE:
StartBleDriver(localMa string, localID string) bool
StopBleDriver() bool

SendToDevice(remoteMa string, payload []byte) bool
CloseConnWithDevice(remoteMa string)


NATIVE -> GO:
ReceiveFromDevice(remoteMa string, payload []byte)
ConnClosedWithDevice(remoteMa string)
NotifyPeerFound(remoteAddr string, remoteID string)
*/

var InitScannerAndAdvertiser func() bool = nil
var CloseScannerAndAdvertiser func() = nil

var SetMa func(string) = nil
var SetPeerID func(string) = nil

var StartScanning func() = nil
var StartAdvertising func() = nil

var Write func(p []byte, ma string) bool = nil
var DialPeer func(ma string) bool = nil
var CloseConnWithDevice func(ma string) = nil
