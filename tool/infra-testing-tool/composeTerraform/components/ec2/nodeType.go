package ec2

import (
	"bytes"
	"fmt"
	"html/template"
	"reflect"
)

type Peer struct {
	SwarmListeners struct {
		PrivateIpLan string
		Port         string
	}
}

func NewPeer() Peer {
	return Peer{}
}

func (c Peer) ExecuteTemplate() (string, error) {


	c.SwarmListeners.PrivateIpLan = fmt.Sprintf("{%s}", c.SwarmListeners.PrivateIpLan)


	v := reflect.ValueOf(c)
	values := make(map[string]interface{}, v.NumField())
	for i := 0; i < v.NumField(); i++ {
		if v.Field(i).CanInterface() {
			values[v.Type().Field(i).Name] = v.Field(i).Interface()
		}
	}

	templ := peerDefaultCommand

	var s string

	t := template.Must(template.New("").Parse(templ))
	buf := &bytes.Buffer{}
	err := t.Execute(buf, values)
	if err != nil {
		return s, err
	}

	s += buf.String()

	return s, nil

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
