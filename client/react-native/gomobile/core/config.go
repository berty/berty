package core

import "runtime"

// This file contain the configuration by default

// Initial configs will be used to set default settings in state DB
// (when the app has never been launched before)
var (
	initialNetConf = networkConfig{
		DefaultTransport:   true,
		BluetoothTransport: true,
		DefaultBootstrap:   true,
		CustomBootstrap:    []string{},
		MDNS:               false,
		Relay:              false,
	}

	initialBotMode   = false
	initiallocalGRPC = false
)

// Default configs will be used to set default settings but not saved in state DB
const (
	defaultLoggerName = "client.rn.gomobile"

	defaultBind     = "/ip4/0.0.0.0/tcp/0"
	defaultBLEBind  = "/ble/00000000-0000-0000-0000-000000000000"
	defaultMetrics  = true
	defaultIdentity = ""

	defaultLocalGRPCPort = 4242
)

func init() {
	if runtime.GOOS == "android" {
		initialNetConf.BluetoothTransport = false
	}
}
