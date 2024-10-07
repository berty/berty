package bertybridge

import (
	"berty.tech/weshnet/v2/pkg/netmanager"
)

const (
	ConnectivityStateUnknown int = int(netmanager.ConnectivityStateUnknown)
	ConnectivityStateOff         = int(netmanager.ConnectivityStateOff)
	ConnectivityStateOn          = int(netmanager.ConnectivityStateOn)

	ConnectivityNetUnknown  = int(netmanager.ConnectivityNetUnknown)
	ConnectivityNetNone     = int(netmanager.ConnectivityNetNone)
	ConnectivityNetWifi     = int(netmanager.ConnectivityNetWifi)
	ConnectivityNetEthernet = int(netmanager.ConnectivityNetEthernet)
	ConnectivityNetCellular = int(netmanager.ConnectivityNetCellular)

	ConnectivityCellularUnknown = int(netmanager.ConnectivityCellularUnknown)
	ConnectivityCellularNone    = int(netmanager.ConnectivityCellularNone)
	ConnectivityCellular2G      = int(netmanager.ConnectivityCellular2G)
	ConnectivityCellular3G      = int(netmanager.ConnectivityCellular3G)
	ConnectivityCellular4G      = int(netmanager.ConnectivityCellular4G)
	ConnectivityCellular5G      = int(netmanager.ConnectivityCellular5G)
)

type ConnectivityInfo struct {
	info *netmanager.ConnectivityInfo
}

func NewConnectivityInfo() *ConnectivityInfo {
	return &ConnectivityInfo{&netmanager.ConnectivityInfo{}}
}

func (ci *ConnectivityInfo) GetState() int        { return int(ci.info.State) }
func (ci *ConnectivityInfo) GetMetering() int     { return int(ci.info.Metering) }
func (ci *ConnectivityInfo) GetBluetooth() int    { return int(ci.info.Bluetooth) }
func (ci *ConnectivityInfo) GetNetType() int      { return int(ci.info.NetType) }
func (ci *ConnectivityInfo) GetCellularType() int { return int(ci.info.CellularType) }

func (ci *ConnectivityInfo) SetState(state int) {
	ci.info.State = netmanager.ConnectivityState(state)
}

func (ci *ConnectivityInfo) SetMetering(metering int) {
	ci.info.Metering = netmanager.ConnectivityState(metering)
}

func (ci *ConnectivityInfo) SetBluetooth(bluetooth int) {
	ci.info.Bluetooth = netmanager.ConnectivityState(bluetooth)
}

func (ci *ConnectivityInfo) SetNetType(netType int) {
	ci.info.NetType = netmanager.ConnectivityNetType(netType)
}

func (ci *ConnectivityInfo) SetCellularType(cellularType int) {
	ci.info.CellularType = netmanager.ConnectivityCellularType(cellularType)
}

type IConnectivityHandler interface {
	HandleConnectivityUpdate(connectivityInfo *ConnectivityInfo)
}

type IConnectivityDriver interface {
	GetCurrentState() *ConnectivityInfo
	RegisterHandler(handler IConnectivityHandler)
}
