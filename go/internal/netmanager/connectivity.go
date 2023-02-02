package netmanager

type ConnectivityState int
const (
	ConnectivityStateUnknown ConnectivityState = iota
	ConnectivityStateOff
	ConnectivityStateOn
)

type ConnectivityNetType int
const (
	ConnectivityNetUnknown ConnectivityNetType = iota
	ConnectivityNetNone
	ConnectivityNetWifi
	ConnectivityNetEthernet
	ConnectivityNetCellular
)

type ConnectivityCellularType int
const (
	ConnectivityCellularUnknown ConnectivityCellularType = iota
	ConnectivityCellularNone
	ConnectivityCellular2G
	ConnectivityCellular3G
	ConnectivityCellular4G
	ConnectivityCellular5G
)

type ConnectivityInfo struct {
	State        ConnectivityState
	Metering     ConnectivityState
	Bluetooth    ConnectivityState
	NetType      ConnectivityNetType
	CellularType ConnectivityCellularType
}

func NewConnectivityInfo() *ConnectivityInfo {
	return &ConnectivityInfo{
		State:        ConnectivityState(ConnectivityStateUnknown),
		Metering:     ConnectivityState(ConnectivityStateUnknown),
		Bluetooth:    ConnectivityState(ConnectivityStateUnknown),
		NetType:      ConnectivityNetType(ConnectivityNetUnknown),
		CellularType: ConnectivityCellularType(ConnectivityCellularUnknown),
	}
}

func (ci *ConnectivityInfo) GetState() ConnectivityState                 { return ci.State }
func (ci *ConnectivityInfo) GetMetering() ConnectivityState              { return ci.Metering }
func (ci *ConnectivityInfo) GetBluetooth() ConnectivityState             { return ci.Bluetooth }
func (ci *ConnectivityInfo) GetNetType() ConnectivityNetType             { return ci.NetType }
func (ci *ConnectivityInfo) GetCellularType() ConnectivityCellularType   { return ci.CellularType }

func (ci *ConnectivityInfo) SetState(state ConnectivityState)                      { ci.State = state }
func (ci *ConnectivityInfo) SetMetering(metering ConnectivityState)                { ci.Metering = metering }
func (ci *ConnectivityInfo) SetBluetooth(bluetooth ConnectivityState)              { ci.Bluetooth = bluetooth }
func (ci *ConnectivityInfo) SetNetType(netType ConnectivityNetType)                { ci.NetType = netType }
func (ci *ConnectivityInfo) SetCellularType(cellularType ConnectivityCellularType) { ci.CellularType = cellularType }