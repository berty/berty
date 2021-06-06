package ec2

import (
	"fmt"
)

type Peer struct {
	SwarmListeners struct {
		PrivateIpLan string
		Port         string
	}
}

func (c Peer) ExecuteTemplate() (string, error) {

	c.SwarmListeners.PrivateIpLan = fmt.Sprintf("{%s}", c.SwarmListeners.PrivateIpLan)

	return "", nil

}

const (
	peerDefaultCommand = `#!/bin/bash
echo 'PRIVATE_IP_LAN="${{.SwarmListeners.PrivateIpLan}}"'
echo 'PORT="{{.SwarmListeners.Port}}"'

berty daemon \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.rdvp=':none' \
  -p2p.tinder-rdvp-driver=false \
  -p2p.swarm-listeners='/ip4/$PRIVATE_IP_LAN/udp/$PORT/quic'
`
)
