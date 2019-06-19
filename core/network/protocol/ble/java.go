// +build android

package ble

var SetMa func(string) = nil
var SetPeerID func(string) = nil
var StartScanning func() = nil
var StartAdvertising func() = nil
var Write func(p []byte, ma string) bool = nil
var DialPeer func(ma string) bool = nil
var InitScannerAndAdvertiser func() = nil
var CloseScannerAndAdvertiser func() = nil
var CloseConnFromMa func(ma string) = nil
