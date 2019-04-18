
export default () => (service, rpcImpl) => (method, request, callback) => {
  console.log(`i love ${method.name}`)
  rpcImpl(method, request, callback)
}
