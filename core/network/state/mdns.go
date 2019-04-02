package state

import (
	"github.com/sparrc/go-ping"
	"time"
)

// This method isn't 100% reliable in some cases
// Multicast address can be available on tested LAN but if no other host
// responds to the ping, this function will consider that mDNS is not supported
func isMDNSCompatible() bool {
	const (
		multicastAddr = "224.0.0.1"
		pingTimeout   = 300 * time.Millisecond
	)

	compatible := make(chan bool)

	pinger, err := ping.NewPinger(multicastAddr)
	if err != nil {
		logger().Error(err.Error())
		return false
	}

	pinger.Count = 1
	pinger.Timeout = pingTimeout
	pinger.OnRecv = func(pkt *ping.Packet) {
		compatible <- true
	}
	pinger.OnFinish = func(stats *ping.Statistics) {
		compatible <- false
	}
	pinger.Run()

	return <-compatible
}
