package state

import (
	"go.uber.org/zap"
	"sync"
)

type Notifee interface {
	HandleConnectivityChange(ConnectivityState)
	HandleInternetChange(State)
	HandleVPNChange(State)
	HandleMDNSChange(State)
	HandleMeteredChange(State)
	HandleRoamingChange(State)
	HandleTrustedChange(State)
	HandleNetTypeChange(NetType)
	HandleCellTypeChange(CellType)
	HandleBluetoothChange(State)
}

type notifier struct {
	lock     sync.Mutex
	notifees []Notifee
}

func (nr *notifier) notifyConnectivityChange(cs ConnectivityState) {
	nr.lock.Lock()

	logger().Debug("connectivity state change:",
		zap.String("Internet", StateToString(cs.Internet)),
		zap.String("VPN", StateToString(cs.VPN)),
		zap.String("MDNS", StateToString(cs.MDNS)),
		zap.String("Metered", StateToString(cs.Metered)),
		zap.String("Roaming", StateToString(cs.Roaming)),
		zap.String("Trusted", StateToString(cs.Trusted)),
		zap.String("Network", NetTypeToString(cs.Network)),
		zap.String("Cellular", CellTypeToString(cs.Cellular)),
		zap.String("Bluetooth", StateToString(cs.Bluetooth)),
	)
	for _, notifee := range nr.notifees {
		notifee.HandleConnectivityChange(cs)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyInternetChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify internet state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleInternetChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyVPNChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify vpn state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleVPNChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyMDNSChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify mdns state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleMDNSChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyMeteredChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify metered state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleMeteredChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyRoamingChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify roaming state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleRoamingChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyTrustedChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify trusted state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleTrustedChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyNetTypeChange(n NetType) {
	nr.lock.Lock()

	logger().Debug("notify network type change:", zap.String("new type", NetTypeToString(n)))
	for _, notifee := range nr.notifees {
		notifee.HandleNetTypeChange(n)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyCellTypeChange(c CellType) {
	nr.lock.Lock()

	logger().Debug("notify cellular type change:", zap.String("new type", CellTypeToString(c)))
	for _, notifee := range nr.notifees {
		notifee.HandleCellTypeChange(c)
	}

	nr.lock.Unlock()
}

func (nr *notifier) notifyBluetoothChange(s State) {
	nr.lock.Lock()

	logger().Debug("notify bluetooth state change:", zap.String("new state", StateToString(s)))
	for _, notifee := range nr.notifees {
		notifee.HandleBluetoothChange(s)
	}

	nr.lock.Unlock()
}

func (nr *notifier) RegisterNotifee(ne Notifee) {
	nr.lock.Lock()

	nr.notifees = append(nr.notifees, ne)

	nr.lock.Unlock()
}

func (nr *notifier) UnregisterNotifee(ne Notifee) {
	nr.lock.Lock()

	found := -1
	for index, notifee := range nr.notifees {
		if notifee == ne {
			found = index
			break
		}
	}

	if found != -1 {
		nr.notifees = append(nr.notifees[:found], nr.notifees[found+1:]...)
	}

	nr.lock.Unlock()
}
