package bertybridge

type NativeMDNSLockerDriver interface {
	Lock()
	Unlock()
}

type noopNativeMDNSLockerDriver struct{}

func (*noopNativeMDNSLockerDriver) Lock()   {}
func (*noopNativeMDNSLockerDriver) Unlock() {}
