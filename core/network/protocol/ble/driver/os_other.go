// +build !android,!darwin

package driver

/* TODO: Refactor this file to have this noop functions only:
GO -> NATIVE:
StartBleDriver(localMa string, localID string) bool
StopBleDriver() bool

SendToDevice(remoteMa string, payload []byte) bool
CloseConnWithDevice(remoteMa string)

NATIVE -> GO:
See client/react-native/gomobile/core/android_ble.go
*/

// Noop implementation for platform that are not Darwin or Android
func InitScannerAndAdvertiser()  {}
func CloseScannerAndAdvertiser() {}

func SetMa(_ string)     {}
func SetPeerID(_ string) {}

func StartScanning()    {}
func StartAdvertising() {}

func Write(_ []byte, _ string) bool { return false }
func DialPeer(_ string) bool        { return false }
func CloseConnWithDevice(_ string)  {}
