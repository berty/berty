export const defaultCLIArgs: string[] = [
	'--node.display-name=',
	'--p2p.swarm-listeners=/ip4/0.0.0.0/udp/0/quic-v1',
	'--p2p.high-water=60',
	'--p2p.low-water=40',
	'--p2p.webui-listener=:3000',
	// @FIXME(gfanton,aeddi): Disable public dht for now because it uses too many
	// resources on the mobile. We should re-enable it when everything is
	// stabilized.
	'--p2p.dht=autoserver',
	'--p2p.dht-network=lan',
	// log format
	'--log.format=console',
]
