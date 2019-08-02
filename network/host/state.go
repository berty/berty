package host

import "berty.tech/network/state"

func (bh *BertyHost) HandleConnectivityChange(state.ConnectivityState) {}
func (bh *BertyHost) HandleInternetChange(state.State)                 {}
func (bh *BertyHost) HandleVPNChange(state.State)                      {}
func (bh *BertyHost) HandleMDNSChange(state.State)                     {}
func (bh *BertyHost) HandleMeteredChange(state.State)                  {}
func (bh *BertyHost) HandleRoamingChange(state.State)                  {}
func (bh *BertyHost) HandleTrustedChange(state.State)                  {}

func (bh *BertyHost) HandleNetTypeChange(s state.NetType) {
	switch s {
	case state.Cellular:
		bh.ContextFilters.AcceptPublicIPOnly()
		bh.mdns.Disable()
	default:
		bh.ContextFilters.AcceptAll()
		bh.mdns.Enable()
	}
}

func (bh *BertyHost) HandleCellTypeChange(state.CellType) {}
func (bh *BertyHost) HandleBluetoothChange(state.State)   {}
