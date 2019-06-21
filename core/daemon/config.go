package daemon

import "berty.tech/core/network/protocol/ble"

// This file contain the configuration by default

// Initial configs will be used to set default settings in state DB
// (when the app has never been launched before)
var (
	initialBotMode   = false
	initiallocalGRPC = false
)

// Default configs will be used to set default settings but not saved in state DB
const (
	defaultLoggerName = "client.rn.gomobile"

	defaultBind     = "/ip4/0.0.0.0/tcp/0"
	quicBind        = "/ip4/0.0.0.0/udp/0/quic"
	defaultBLEBind  = ble.DefaultBind
	defaultMetrics  = true
	defaultIdentity = ""

	defaultLocalGRPCPort = 4242
)
