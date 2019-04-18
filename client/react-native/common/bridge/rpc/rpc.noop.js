// NOOP rpc: always failed

const rpcerr = new Error('no rpc implem available')
export default serviceName => (method, request, callback) => {
  callback(rpcerr, null)
}
