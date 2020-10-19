// +build !darwin !cgo

package driver

// Noop implementation for platform that are not Darwin

// Native -> Go functions
func BindNativeToGoFunctions(_ func(string) bool, _ func(string), _ func(string, []byte)) {}

// Go -> Native functions
func StartMCDriver(_ string)             {}
func StopMCDriver()                      {}
func DialPeer(_ string) bool             { return false }
func SendToPeer(_ string, _ []byte) bool { return false }
func CloseConnWithPeer(_ string)         {}
