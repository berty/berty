// NOOP rpc: always failed

const rpc = async () => {
	throw new Error('no rpc implem available')
}
export default {
	unaryCall: rpc,
	streamCall: rpc,
}
