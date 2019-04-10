package state

type State int
type NetType int
type CellType int
type BleState int

const (
	Unknown State = 0
	On      State = 1
	Off     State = 2

	UnknownNetType NetType = 0
	Wifi           NetType = 1
	Ethernet       NetType = 2
	Bluetooth      NetType = 3
	Cellular       NetType = 4

	UnknownCellType CellType = 0
	None            CellType = 1
	Cell2G          CellType = 2
	Cell3G          CellType = 3
	Cell4G          CellType = 4
)

type ConnectivityState struct {
	Internet  State
	VPN       State
	MDNS      State
	Metered   State
	Roaming   State
	Trusted   State
	Network   NetType
	Cellular  CellType
	Bluetooth State
}

func StateToString(s State) string {
	switch s {
	case On:
		return "on"
	case Off:
		return "off"
	default:
		return "unknown"
	}
}

func NetTypeToString(n NetType) string {
	switch n {
	case Wifi:
		return "wifi"
	case Ethernet:
		return "ethernet"
	case Bluetooth:
		return "bluetooth"
	case Cellular:
		return "cellular"
	default:
		return "unknown"
	}
}

func CellTypeToString(c CellType) string {
	switch c {
	case None:
		return "none"
	case Cell2G:
		return "2G"
	case Cell3G:
		return "3G"
	case Cell4G:
		return "4G"
	default:
		return "unknown"
	}
}
