package proximitytransport

type ProximityDriver interface {
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

type NoopProximityDriver struct {
	protocolCode int
	protocolName string
	defaultAddr  string
}

func NewNoopProximityDriver(protocolCode int, protocolName, defaultAddr string) *NoopProximityDriver {
	return &NoopProximityDriver{
		protocolCode: protocolCode,
		protocolName: protocolName,
		defaultAddr:  defaultAddr,
	}
}

func (d *NoopProximityDriver) Start(_ string) {}

func (d *NoopProximityDriver) Stop() {}

func (d *NoopProximityDriver) DialPeer(_ string) bool { return false }

func (d *NoopProximityDriver) SendToPeer(_ string, _ []byte) bool { return false }

func (d *NoopProximityDriver) CloseConnWithPeer(_ string) {}

func (d *NoopProximityDriver) ProtocolCode() int { return d.protocolCode }

func (d *NoopProximityDriver) ProtocolName() string { return d.protocolName }

func (d *NoopProximityDriver) DefaultAddr() string { return d.defaultAddr }
