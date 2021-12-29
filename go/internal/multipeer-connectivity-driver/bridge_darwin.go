//go:build darwin && cgo && !catalyst
// +build darwin,cgo,!catalyst

package mc

import (
	"go.uber.org/zap"

	native "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver/driver"
	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

const Supported = true

type Driver struct {
	protocolCode int
	protocolName string
	defaultAddr  string
}

// Driver is a proximity.ProximityDriver
var _ proximity.ProximityDriver = (*Driver)(nil)

func NewDriver(logger *zap.Logger) proximity.ProximityDriver {
	if logger == nil {
		logger = zap.NewNop()
	} else {
		logger = logger.Named("MC")
		logger.Debug("NewDriver()")
		native.MCUseExternalLogger()
	}
	native.Logger = logger
	native.ProtocolName = ProtocolName

	return &Driver{
		protocolCode: ProtocolCode,
		protocolName: ProtocolName,
		defaultAddr:  DefaultAddr,
	}
}

func (d *Driver) Start(localPID string) {
	native.Start(localPID)
}

func (d *Driver) Stop() {
	native.Stop()
}

func (d *Driver) DialPeer(remotePID string) bool {
	return native.DialPeer(remotePID)
}

func (d *Driver) SendToPeer(remotePID string, payload []byte) bool {
	return native.SendToPeer(remotePID, payload)
}

func (d *Driver) CloseConnWithPeer(remotePID string) {
	native.CloseConnWithPeer(remotePID)
}

func (d *Driver) ProtocolCode() int {
	return d.protocolCode
}

func (d *Driver) ProtocolName() string {
	return d.protocolName
}

func (d *Driver) DefaultAddr() string {
	return d.defaultAddr
}
