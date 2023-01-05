export const defaultCLIArgs: string[] = [
	'--node.display-name=',
	'--p2p.swarm-listeners=/ip4/0.0.0.0/udp/0/quic',
	'--p2p.high-water=60',
	'--p2p.low-water=40',
	'--p2p.webui-listener=:3000',
	// @FIXME(gfanton,aeddi): Disable randomwalk for now because it uses too many
	// resources on the mobile. We should re-enable it when everything is
	// stabilized.
	'--p2p.dht-randomwalk=false',
	'--log.format=console',
]
