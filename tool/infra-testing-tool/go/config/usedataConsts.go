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
source /home/ec2-user/.bashrc
`

	peerUserData = `berty daemon \
  	-node.listeners="/ip4/127.0.0.1/tcp/{{.defaultGrpcPort }}/grpc" \
	-p2p.mdns=false \
	-p2p.static-relays='{{.relay }}' \
	-p2p.bootstrap='{{.bootstrap }}' \
	-p2p.dht-randomwalk=false \
	-p2p.tinder-dht-driver=false \
	-p2p.swarm-listeners="{{.listener }}" \
    -p2p.swarm-announce="{{.announce }}" \
	-p2p.rdvp='{{.rdvp }}' \
	-p2p.tinder-rdvp-driver=true \
	-log.format=json \
	-log.file=/home/ec2-user/logs/
`

	bootstrapUserData = `berty daemon \
	-p2p.mdns=false \
	-p2p.bootstrap={{.bootstrap }} \
	-p2p.rdvp={{.rdvp }} \
	-p2p.static-relays={{.relay }} \
	-p2p.tinder-dht-driver=false \
	-p2p.tinder-rdvp-driver=false \
	-p2p.swarm-listeners="{{.listener }}" \
	-log.format=json \
	-log.file=/home/ec2-user/logs/
`

	rdvpUserData = `rdvp serve -pk {{.pk | printf "%s" }} \
    -l "{{.listener }}" \
	-log.format=json \
	-log.file=/home/ec2-user/logs/log.json
`

	relayUserData = `rdvp serve \
	-announce "{{.announce }}" \
	-l "{{.listener }}" \
	-log.format=json \
	-log.file=/home/ec2-user/logs/log.json
`

	replicationUserData = `berty repl-server \
	-node.listeners "/ip4/127.0.0.1/tcp/{{.defaultGrpcPort }}/grpc" \
	-node.auth-secret {{.secret }} \
	-node.auth-pk {{.sk}} \
	-log.format=json \
	-log.file=/home/ec2-user/logs/ &
berty token-server \
	-no-click \
	-svc "rpl@127.0.0.1:9091" \
	-http.listener "0.0.0.0:9092" \
	-auth.secret {{.tokenSecret }} \
	-auth.sk {{.tokenSk }} \
	-log.format=json \
	-log.file=/home/ec2-user/
`
)
