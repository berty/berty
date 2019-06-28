// +build !android,!darwin

package driver

// Noop implementation for platform that are not Darwin or Android
func StartBleDriver(_ string, _ string) bool { return false }
func StopBleDriver() bool                    { return false }

func DialDevice(_ string) bool             { return false }
func SendToDevice(_ string, _ []byte) bool { return false }
func CloseConnWithDevice(_ string)         {}
