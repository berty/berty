package state

import (
	"time"

	ping "github.com/sparrc/go-ping"
)

// This method isn't 100% reliable in some cases
// Multicast address can be available on tested LAN but if no other host
// responds to the ping, this function will consider that mDNS is not supported
func isMDNSCompatible() State {
	const pingTimeout = 300 * time.Millisecond
	multicastAddr := []string{"224.0.0.1"}

	return safelyPingIPs(multicastAddr, pingTimeout)
}

func isInternetReachable() State {
	const pingTimeout = 3 * time.Second
	dnsAddrs := []string{
		// IPv4
		"8.8.8.8",        // Google primary DNS
		"8.8.4.4",        // Google sencondary DNS
		"208.67.222.222", // OpenDNS primary DNS
		"208.67.220.220", // OpenDNS secondary DNS
		"1.1.1.1",        // Cloudflare primary DNS
		"1.0.0.1",        // Cloudflare secondary DNS
		// IPv6
		"2001:4860:4860::8888", // Google primary DNS
		"2001:4860:4860::8844", // Google sencondary DNS
		"2620:119:35::35",      // OpenDNS primary DNS
		"2620:119:53::53",      // OpenDNS secondary DNS
		"2606:4700:4700::1111", // Cloudflare primary DNS
		"2606:4700:4700::1001", // Cloudflare secondary DNS
	}

	return safelyPingIPs(dnsAddrs, pingTimeout)
}

func safelyPingIPs(ips []string, pingTimeout time.Duration) State {
	pingSuccess := make(chan State)

	// Run all ping concurently, get the first successfull result
	for _, ip := range ips {
		// This goroutine can be killed by kernel if sending ICMP packet is denied
		go pingIP(ip, pingSuccess, pingTimeout)
	}

	select {
	case res := <-pingSuccess:
		// first goroutine to succeed
		return res
	case <-time.After(42*time.Millisecond + pingTimeout):
		// all goroutines were probably killed by kernel
		return Unknown
	}
}

// Don't call this function directly because it can be killed by kernel
// Use safelyPingIPs() instead
func pingIP(ip string, pingSuccess chan State, pingTimeout time.Duration) {
	pinger, err := ping.NewPinger(ip)
	if err != nil {
		logger().Error(err.Error())
		pingSuccess <- Unknown
		return
	}

	pinger.Count = 1
	pinger.Timeout = pingTimeout
	pinger.OnRecv = func(pkt *ping.Packet) {
		pingSuccess <- On
	}
	pinger.OnFinish = func(pkt *ping.Statistics) {
		pingSuccess <- Off
	}

	pinger.Run()
}
