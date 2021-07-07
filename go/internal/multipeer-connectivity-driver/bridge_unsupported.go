// +build !darwin darwin,!cgo catalyst

package mc

import (
	"go.uber.org/zap"

	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

const Supported = false

// Noop implementation for platform that are not Darwin

func NewDriver(logger *zap.Logger) proximity.NativeDriver {
	logger = logger.Named("MC")
	logger.Info("NewDriver(): incompatible system")

	return proximity.NewNoopNativeDriver(ProtocolCode, ProtocolName, DefaultAddr)
}
