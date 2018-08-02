package natpmp

import (
	"fmt"
	"log"
	"net"
	"time"
)

const nAT_PMP_PORT = 5351
const nAT_TRIES = 9
const nAT_INITIAL_MS = 250

// A caller that implements the NAT-PMP RPC protocol.
type network struct {
	gateway net.IP
}

func (n *network) call(msg []byte) (result []byte, err error) {
	var server net.UDPAddr
	server.IP = n.gateway
	server.Port = nAT_PMP_PORT
	conn, err := net.DialUDP("udp", nil, &server)
	if err != nil {
		return
	}
	defer conn.Close()

	// 16 bytes is the maximum result size.
	result = make([]byte, 16)

	needNewDeadline := true

	var tries uint
	for tries = 0; tries < nAT_TRIES; {
		if needNewDeadline {
			err = conn.SetDeadline(time.Now().Add((nAT_INITIAL_MS << tries) * time.Millisecond))
			if err != nil {
				return
			}
			needNewDeadline = false
		}
		_, err = conn.Write(msg)
		if err != nil {
			return
		}
		var bytesRead int
		var remoteAddr *net.UDPAddr
		bytesRead, remoteAddr, err = conn.ReadFromUDP(result)
		if err != nil {
			if err.(net.Error).Timeout() {
				tries++
				needNewDeadline = true
				continue
			}
			return
		}
		if !remoteAddr.IP.Equal(n.gateway) {
			log.Printf("Ignoring packet because IPs differ:", remoteAddr, n.gateway)
			// Ignore this packet.
			// Continue without increasing retransmission timeout or deadline.
			continue
		}
		// Trim result to actual number of bytes received
		if bytesRead < len(result) {
			result = result[:bytesRead]
		}
		return
	}
	err = fmt.Errorf("Timed out trying to contact gateway")
	return
}
