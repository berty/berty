export const chainMiddleware = (...middlewares) => (service, rpcImpl) => {
  if (middlewares.length === 0) {
    return rpcImpl
  }

  const middleware = middlewares.pop()
  const next = chainMiddleware(...middlewares)(service, rpcImpl)
  return middleware ? middleware(service, next) : next
}
