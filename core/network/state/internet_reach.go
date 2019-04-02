package state

import (
	"context"
	"github.com/sparrc/go-ping"
	"time"
)

func isInternetReachable() bool {
	const pingTimeout = 3 * time.Second
	ips := []string{
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

	pingSuccess := make(chan bool)
	ctx, cancel := context.WithTimeout(context.Background(), pingTimeout)

	// Run all ping concurently, stop them all if one succeeded
	for _, ip := range ips {
		go pingIP(ctx, ip, pingSuccess)
	}

	select {
	case <-pingSuccess:
		cancel()
		return true
	case <-ctx.Done():
		cancel()
		return false
	}
}

func pingIP(ctx context.Context, ip string, pingSuccess chan bool) {
	pinger, err := ping.NewPinger(ip)
	if err != nil {
		logger().Error(err.Error())
		return
	}

	pinger.Count = 1
	pinger.OnRecv = func(pkt *ping.Packet) {
		pingSuccess <- true
	}

	go pinger.Run()

	<-ctx.Done()
	pinger.Stop()
}
