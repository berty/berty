//go:build android
// +build android

package ble

import (
	"go.uber.org/zap"

	proximity "berty.tech/berty/v2/go/internal/proximitytransport"
)

// Supported is used by main package as default value for enable the BLE  driver.
// While UI actually enable or not the Java BLE driver.
// TODO: remove this when UI will be able to handle this for the first App launching.
const Supported = true

// Noop implementation for Android
// Real driver is given from Java directly here: berty/js/android/app/src/main/java/tech/berty/gobridge/bledriver
func NewDriver(logger *zap.Logger) proximity.ProximityDriver {
	logger = logger.Named("BLE")
	logger.Info("NewDriver(): Java driver not found")

	return proximity.NewNoopProximityDriver(ProtocolCode, ProtocolName, DefaultAddr)
}
