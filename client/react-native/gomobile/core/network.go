package core

import (
	"berty.tech/core/network/state"
)

// Device network state related
func UpdateConnectivityState(newState string) {
	go func() {
		state.Global().UpdateConnectivityState(newState)
	}()
}

func UpdateBluetoothState(newState int) {
	go func() {
		state.Global().UpdateBluetoothState(newState)
	}()
}
