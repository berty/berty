package configParse

// This file contains all the user data / startup scripts for each of the different node types
// Find official Terraform documentation here:
// https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance#user_data
// Because the terraform documentation is very limited, here is some extra explanation:
// The userData argument contains a bash script that gets run as soon as the ec2 instance on AWS becomes available
// allowing us to automatically start for example a peer or a RDVP

const (
	// this is the base, any other data gets appended to it.
	baseUserData = `
#!/bin/bash
`

	peerUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT= {{.Port }}
berty daemon \
  -node.listeners="/ip4/$PUBLIC_IP/tcp/{{.defaultGrpcPort }}/grpc" \
  -p2p.mdns=false \
  -p2p.static-relays=':none' \
  -p2p.bootstrap=':none:' \
  -p2p.dht-randomwalk=false \
  -p2p.tinder-dht-driver=false \
  -p2p.swarm-listeners=/ip4/$PUBLIC_IP/$PROTOC/$PORT/ \
  -p2p.rdvp={{.RDVPMaddr }} \
  -p2p.tinder-rdvp-driver=true \
  -log.file=/home/ubuntu/log
`

	// TODO: this isn't correct
	bootstrapUserData = `export PUBLIC_IP=0.0.0.0
export port=4424
berty daemon \
  -p2p.mdns=false \
  -p2p.bootstrap=':none:' \
  -p2p.rdvp=':none' \
  -p2p.static-relays=':none' \
  -p2p.tinder-dht-driver=false \
  -p2p.tinder-rdvp-driver=false \
  -p2p.swarm-listeners="/ip4/$PUBLIC_IP/tcp/$PORT" \
  -log.file=/home/ubuntu/log
`

	rdvpUserData = `export PUBLIC_IP=0.0.0.0
export PROTOC=tcp
export PORT={{.Port }}
export PEER_ID={{.PeerId }}
rdvp serve -pk {{.Pk }} \
    -l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \
	-log.file=/home/ubuntu/log
`

	// TODO: this isn't correct
	relayUserData = `export PUBLIC_IP4=0.0.0.0
export PROTOC=tcp
export PORT={{.Port }}
export PEER_ID={{.PeerId }}
rdvp serve -pk {{.Pk }} \
	-announce "/ip4/$PUBLIC_IP4/$PROTOC/$port" \
	-l "/ip4/$PUBLIC_IP/$PROTOC/$PORT" \p
	-log.file=/home/ubuntu/log
`

	//TODO: this isn't correct
	replicationUserData = `
`
)
