package config

// This file contains all the user data / startup scripts for each of the different node types
// Find official Terraform documentation here:
// https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance#user_data
// Because the terraform documentation is very limited, here is some extra explanation:
// The userData argument contains a bash script that gets run as soon as the ec2 instance on AWS becomes available
// allowing us to automatically start for example a peer or a RDVP

// TEMPLATING FOLLOWS text/template STANDARDS!
// https://golang.org/pkg/text/template/

const (
	// this is the base, any other data gets appended to it.
	baseUserData = `
#!/bin/bash
`

	peerUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC={{.protocol }}
export PORT={{.port }}
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/{{.defaultGrpcPort }}/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays='{{.relay }}' \
  -p2p.bootstrap='{{.bootstrap }}' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp='{{.rdvp }}' \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ec2-user/
`

	// TODO: this isn't correct
	bootstrapUserData = `export PUBLIC_IP=0.0.0.0
export PORT={{.port }}
berty daemon \
  -p2p.mdns=false \
  -p2p.bootstrap={{.bootstrap }} \
  -p2p.rdvp={{.rdvp }} \
  -p2p.static-relays={{.relay }} \
  -p2p.tinder-dht-driver=false \
  -p2p.tinder-rdvp-driver=false \
  -p2p.swarm-listeners="/ip4/$PUBLIC_IP/tcp/$PORT" \
  -log.file=/home/ec2-user/
`

	rdvpUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC={{.protocol }}
export PORT={{.port }}
export PEER_ID={{.peerId }}
rdvp serve -pk {{.pk | printf "%s" }} \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ec2-user/
`

	// TODO: this isn't correct
	relayUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC={{.protocol }}
export PORT={{.port }}
export PEER_ID={{.peerId }}
rdvp serve \
	-announce "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ec2-user/
`

	replicationUserData = `berty repl-server \
	-node.listeners "/ip4/0.0.0.0/tcp/{{.defaultGrpcPort }}/grpc" \
	-node.auth-secret {{.secret }} \
	-node.auth-pk {{.sk}} \
	-log.format=json \
	-log.file=/home/ec2-user/
`

	tokenServerUserData = `berty token-server \
	-no-click \
	-svc "rpl@{{.replIp}}:{{.replPort}}" \
	-http.listener "0.0.0.0:{{.port }}" \
	-auth.secret {{.secret }} \
	-auth.sk {{.sk }} \
	-log.format=json \
	-log.file=/home/ec2-user/
`
)


