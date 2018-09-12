package errorcodes

import "fmt"

var ErrorUntrustedEnvelope = fmt.Errorf("unable to find a trusted device")
var ErrorNoDeviceFoundForEnvelope = fmt.Errorf("unable to find a device")
