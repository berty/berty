package bertybridge

type NativeMDNSLockerDriver interface {
	Lock()
	Unlock()
}
