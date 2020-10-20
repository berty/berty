package proximitytransport

type NativeDriver interface {
	// Bind Go functions to native function pointers
	BindNativeToGoFunctions(handleFoundPeer func(string) bool, handleLostPeer func(string), receiveFromPeer func(string, []byte))

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

type NoopNativeDriver struct{}

func (d *NoopNativeDriver) BindNativeToGoFunctions(_ func(string) bool, _ func(string), _ func(string, []byte)) {
}

func (d *NoopNativeDriver) Start(_ string) {}

func (d *NoopNativeDriver) Stop() {}

func (d *NoopNativeDriver) DialPeer(_ string) bool { return false }

func (d *NoopNativeDriver) SendToPeer(_ string, _ []byte) bool { return false }

func (d *NoopNativeDriver) CloseConnWithPeer(_ string) {}

func (d *NoopNativeDriver) ProtocolCode() int { return 0 }

func (d *NoopNativeDriver) ProtocolName() string { return "" }

func (d *NoopNativeDriver) DefaultAddr() string { return "" }
