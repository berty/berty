export const defaultCLIArgs: string[] = [
	'--node.display-name=',
	'--p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0',
	'--p2p.high-water=60',
	'--p2p.low-water=40',
	'--p2p.webui-listener=:3000',
	'--p2p.rdvp=/ip4/192.168.50.29/tcp/4040/p2p/12D3KooWDb4GQkWAghyxaWfbYW2AgwMpPPeoEz6EGbw5fkcUArQa',
	// @FIXME(gfanton,aeddi): Disable randomwalk for now because it uses too many
	// resources on the mobile. We should re-enable it when everything is
	// stabilized.
	'--p2p.dht-randomwalk=false',
	'--log.format=console',
]
