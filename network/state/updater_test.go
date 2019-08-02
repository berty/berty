package state

import (
	"context"
	"encoding/json"
	"sync"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

//TODO: make this tests more relevant when notifee will be implemented in relevant parts of network

type TestNotifee struct {
	ConnectivityState
	wg sync.WaitGroup
}

func (tn *TestNotifee) HandleConnectivityChange(cs ConnectivityState) { tn.wg.Done() }

func (tn *TestNotifee) HandleInternetChange(s State) { tn.Internet = s }

func (tn *TestNotifee) HandleVPNChange(s State) { tn.VPN = s }

func (tn *TestNotifee) HandleMDNSChange(s State) { tn.MDNS = s }

func (tn *TestNotifee) HandleMeteredChange(s State) { tn.Metered = s }

func (tn *TestNotifee) HandleRoamingChange(s State) { tn.Roaming = s }

func (tn *TestNotifee) HandleTrustedChange(s State) { tn.Trusted = s }

func (tn *TestNotifee) HandleNetTypeChange(nt NetType) { tn.Network = nt }

func (tn *TestNotifee) HandleCellTypeChange(ct CellType) { tn.Cellular = ct }

func (tn *TestNotifee) HandleBluetoothChange(s State) { tn.Bluetooth = s }

func update(tn *TestNotifee, cs ConnectivityState) {
	var jsonState string

	bytes, err := json.Marshal(cs)
	if err != nil {
		jsonState = ""
	} else {
		jsonState = string(bytes)
	}

	tn.wg.Add(1)
	go Global().UpdateConnectivityState(jsonState)
	tn.wg.Wait()
}

func TestUpdater(t *testing.T) {
	_, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var testNotifee TestNotifee
	Global().RegisterNotifee(&testNotifee)

	Convey("test updater/notifier", t, FailureHalts, func() {
		Convey("test internet notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{Internet: On})
			So(testNotifee.Internet, ShouldEqual, On)
		})

		Convey("test vpn notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{VPN: On})
			So(testNotifee.VPN, ShouldEqual, On)
		})

		Convey("test mdns notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{MDNS: Off})
			So(testNotifee.MDNS, ShouldEqual, Off)
		})

		Convey("test metered notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{Metered: On})
			So(testNotifee.Metered, ShouldEqual, On)
		})

		Convey("test roaming notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{Roaming: On})
			So(testNotifee.Roaming, ShouldEqual, On)
		})

		Convey("test trusted notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{Trusted: On})
			So(testNotifee.Trusted, ShouldEqual, On)
		})

		Convey("test netType notifee", FailureHalts, func() {
			update(&testNotifee, ConnectivityState{Network: Ethernet})
			So(testNotifee.Network, ShouldEqual, Ethernet)
		})

		Convey("test cellType notifee", FailureHalts, func() {
			So(testNotifee.Cellular, ShouldEqual, None)
			update(&testNotifee, ConnectivityState{
				Network:  Wifi,
				Cellular: Cell3G,
			})
			So(testNotifee.Cellular, ShouldEqual, None)
			update(&testNotifee, ConnectivityState{
				Network:  Cellular,
				Cellular: Cell3G,
			})
			So(testNotifee.Cellular, ShouldEqual, Cell3G)
		})

		Convey("test bluetooth notifee", FailureHalts, func() {
			testNotifee.wg.Add(1)
			go Global().UpdateBluetoothState(int(On))
			testNotifee.wg.Wait()
			So(testNotifee.Bluetooth, ShouldEqual, On)
		})
	})
}
