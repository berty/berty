import { GoBridgeOpts } from './types'

export const GoBridgeDefaultOpts: GoBridgeOpts = {
	cliArgs: [
		'--node.display-name=',
		// '--node.listeners=/ip4/127.0.0.1/tcp/0/grpcws',
		'--p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0',
		'--p2p.high-water=60',
		'--p2p.low-water=40',
		'--p2p.webui-listener=:3000',
		'--log.filters=debug+:bty*,-*.grpc warn+:*.grpc error+:*',
	],
	persistence: true,
}
