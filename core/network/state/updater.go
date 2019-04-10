package state

import (
	"encoding/json"
	"sync"
)

type NetworkUpdater struct {
	lock  sync.Mutex
	state ConnectivityState
	notif notifier
}

var global NetworkUpdater

func Global() *NetworkUpdater { return &global }

func (nu *NetworkUpdater) GetState() ConnectivityState {
	nu.lock.Lock()
	stateCopy := nu.state
	nu.lock.Unlock()

	return stateCopy
}

func (nu *NetworkUpdater) UpdateConnectivityState(connState string) {
	var newState ConnectivityState
	var wg sync.WaitGroup

	if err := json.Unmarshal([]byte(connState), &newState); err != nil {
		logger().Error("update connectivity state: JSON unmarshaling failed")
		return
	}

	nu.lock.Lock()

	if newState.Internet != nu.state.Internet || newState.Internet == Unknown {
		wg.Add(1)
		go func() {
			if newState.Internet == Unknown {
				newState.Internet = isInternetReachable()
			}

			if newState.Internet != nu.state.Internet {
				nu.state.Internet = newState.Internet
				nu.notif.notifyInternetChange(newState.Internet)
			}
			wg.Done()
		}()
	}

	if newState.VPN != nu.state.VPN {
		nu.state.VPN = newState.VPN
		nu.notif.notifyVPNChange(newState.VPN)
	}

	if newState.MDNS != nu.state.MDNS || newState.MDNS == Unknown {
		wg.Add(1)
		go func() {
			if newState.Network == Cellular {
				newState.MDNS = Off
			} else if newState.MDNS == Unknown && newState.Network != UnknownNetType {
				newState.MDNS = isMDNSCompatible()
			}

			if newState.MDNS != nu.state.MDNS {
				nu.state.MDNS = newState.MDNS
				nu.notif.notifyMDNSChange(newState.MDNS)
			}
			wg.Done()
		}()
	}

	if newState.Metered != nu.state.Metered {
		nu.state.Metered = newState.Metered
		nu.notif.notifyMeteredChange(newState.Metered)
	}

	if newState.Roaming != nu.state.Roaming {
		nu.state.Roaming = newState.Roaming
		nu.notif.notifyRoamingChange(newState.Roaming)
	}

	if newState.Trusted != nu.state.Trusted {
		nu.state.Trusted = newState.Trusted
		nu.notif.notifyTrustedChange(newState.Trusted)
	}

	if (newState.Network != nu.state.Network || newState.Cellular != nu.state.Cellular) && newState.Network == Cellular {
		nu.notif.notifyCellTypeChange(newState.Cellular)
	}
	nu.state.Cellular = newState.Cellular

	if newState.Network != nu.state.Network {
		nu.state.Network = newState.Network
		nu.notif.notifyNetTypeChange(newState.Network)
	}

	wg.Wait()
	nu.notif.notifyConnectivityChange(nu.state)

	nu.lock.Unlock()
}

func (nu *NetworkUpdater) UpdateBluetoothState(bleState int) {
	nu.lock.Lock()

	if State(bleState) != nu.state.Bluetooth {
		nu.state.Bluetooth = State(bleState)
		nu.notif.notifyBluetoothChange(State(bleState))
		nu.notif.notifyConnectivityChange(nu.state)
	}

	nu.lock.Unlock()
}
