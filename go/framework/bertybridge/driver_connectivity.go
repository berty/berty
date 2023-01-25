package bertybridge

// type ConnectivityState int
// const (
// 	ConnectivityStateUnknown ConnectivityState = iota
// 	ConnectivityStateOff
// 	ConnectivityStateOn
// )

// type ConnectivityNetType int
// const (
// 	ConnectivityNetUnknown ConnectivityNetType = iota
// 	ConnectivityNetNone
// 	ConnectivityNetWifi
// 	ConnectivityNetEthernet
// 	ConnectivityNetCellular
// )

// type ConnectivityCellularType int
// const (
// 	ConnectivityCellularUnknown ConnectivityCellularType = iota
// 	ConnectivityCellularNone
// 	ConnectivityCellular2G
// 	ConnectivityCellular3G
// 	ConnectivityCellular4G
// 	ConnectivityCellular5G
// )

// type ConnectivityInfo struct {
// 	State        ConnectivityState
// 	Metering     ConnectivityState
// 	Bluetooth    ConnectivityState
// 	NetType      ConnectivityNetType
// 	CellularType ConnectivityCellularType
// }

// func NewConnectivityInfo() *ConnectivityInfo {
// 	return &ConnectivityInfo{
// 		State:        ConnectivityStateUnknown,
// 		Metering:     ConnectivityStateUnknown,
// 		Bluetooth:    ConnectivityStateUnknown,
// 		NetType:      ConnectivityNetUnknown,
// 		CellularType: ConnectivityCellularUnknown,
// 	}
// }

// func (ci *ConnectivityInfo) GetState() int                    { return int(ci.State) }
// func (ci *ConnectivityInfo) GetMetering() int                 { return int(ci.Metering) }
// func (ci *ConnectivityInfo) GetBluetooth() int                { return int(ci.Bluetooth) }
// func (ci *ConnectivityInfo) GetNetType() int                  { return int(ci.NetType) }
// func (ci *ConnectivityInfo) GetCellularType() int             { return int(ci.CellularType) }

// func (ci *ConnectivityInfo) SetState(state int)               { ci.State = ConnectivityState(state) }
// func (ci *ConnectivityInfo) SetMetering(metering int)         { ci.Metering = ConnectivityState(metering) }
// func (ci *ConnectivityInfo) SetBluetooth(bluetooth int)       { ci.Bluetooth = ConnectivityState(bluetooth) }
// func (ci *ConnectivityInfo) SetNetType(netType int)           { ci.NetType = ConnectivityNetType(netType) }
// func (ci *ConnectivityInfo) SetCellularType(cellularType int) { ci.CellularType = ConnectivityCellularType(cellularType) }

// type ConnectivityHandler interface {
// 	HandleConnectivityUpdate(connectivityInfo *ConnectivityInfo)
// }

// type ConnectivityDriver interface {
// 	GetCurrentState() *ConnectivityInfo
// 	RegisterHandler(handler ConnectivityHandler)
// }
