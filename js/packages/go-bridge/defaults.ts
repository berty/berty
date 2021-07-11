import { GoBridgeOpts } from './types'

export const GoBridgeDefaultOpts: GoBridgeOpts = {
	cliArgs: [
		'--p2p.dht=none', // disable routing until it's more stable
		'--node.display-name=',
		'--store.lowmem=true',
		'--node.listeners=/ip4/127.0.0.1/tcp/0/grpcws',
		'--p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0',
		'--p2p.mdns=false',
		'--p2p.webui-listener=:3000',
	],
	persistence: true,
}
