//go:build !darwin && !android
// +build !darwin,!android

package ble

import (
	"go.uber.org/zap"

	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

const Supported = false

// Noop implementation for platform that are not Darwin

func NewDriver(logger *zap.Logger) proximity.ProximityDriver {
	logger = logger.Named("BLE")
	logger.Info("NewDriver(): incompatible system")

	return proximity.NewNoopProximityDriver(ProtocolCode, ProtocolName, DefaultAddr)
}
