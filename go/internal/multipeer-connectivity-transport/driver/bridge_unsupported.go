// +build !darwin

package driver

// Noop implementation for platform that are not Darwin

// Native -> Go functions
func BindNativeToGoFunctions(_ func(string) bool, _ func(string, []byte)) {}

// Go -> Native functions
// StartMCDriver returns true else the main app will stop
func StartMCDriver(_ string)             {}
func StopMCDriver()                      {}
func DialPeer(_ string) bool             { return false }
func SendToPeer(_ string, _ []byte) bool { return false }
func CloseConnWithPeer(_ string)         {}
