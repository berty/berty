// +build !android,!darwin

package driver

// Noop implementation for platform that are not Darwin or Android

// Native -> Go functions
func BindNativeToGoFunctions(_ func(string) bool, _ func(string, []byte)) {}

// Go -> Native functions
func StartBleDriver(_ string) bool       { return false }
func StopBleDriver()                     {}
func DialPeer(_ string) bool             { return false }
func SendToPeer(_ string, _ []byte) bool { return false }
func CloseConnWithPeer(_ string)         {}
