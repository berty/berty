
export default () => (method, call) => async (payload, metadata) => {
  console.log(`i love ${method.name}`)
  return call(payload, metadata)
}
