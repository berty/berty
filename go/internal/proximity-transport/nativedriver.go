package proximitytransport

type NativeDriver interface {
	// Start the native driver
	Start(localPID string)

	// Stop the native driver
	Stop()

	// Check if the native driver is connected to the remote peer
	DialPeer(remotePID string) bool

	// Send data to the remote peer
	SendToPeer(remotePID string, payload []byte) bool

	// Close the connection with the remote peer
	CloseConnWithPeer(remotePID string)

	// Return the multiaddress protocol code
	ProtocolCode() int

	// Return the multiaddress protocol name
	ProtocolName() string

	// Return the default multiaddress
	DefaultAddr() string
}

type NoopNativeDriver struct {
	protocolCode int
	protocolName string
	defaultAddr  string
}

func NewNoopNativeDriver(protocolCode int, protocolName, defaultAddr string) *NoopNativeDriver {
	return &NoopNativeDriver{
		protocolCode: protocolCode,
		protocolName: protocolName,
		defaultAddr:  defaultAddr,
	}
}

func (d *NoopNativeDriver) Start(_ string) {}

func (d *NoopNativeDriver) Stop() {}

func (d *NoopNativeDriver) DialPeer(_ string) bool { return false }

func (d *NoopNativeDriver) SendToPeer(_ string, _ []byte) bool { return false }

func (d *NoopNativeDriver) CloseConnWithPeer(_ string) {}

func (d *NoopNativeDriver) ProtocolCode() int { return d.protocolCode }

func (d *NoopNativeDriver) ProtocolName() string { return d.protocolName }

func (d *NoopNativeDriver) DefaultAddr() string { return d.defaultAddr }

func (d *NoopNativeDriver) SetProtocolCode(protocolCode int) { d.protocolCode = protocolCode }

func (d *NoopNativeDriver) SetProtocolName(protocolName string) { d.protocolName = protocolName }

func (d *NoopNativeDriver) SetDefaultAddr(protocolAddr string) { d.defaultAddr = protocolAddr }
