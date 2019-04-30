const lowerFirst = str => str.charAt(0).toLowerCase() + str.substring(1)

const createUnaryMethod = (method, unaryCall) => {
  const requestType = method.resolvedRequestType
  const responseType = method.resolvedResponseType
  return async (payload, metadata) => {
    const req = requestType.encode(payload).finish()
    const res = await unaryCall(method, req, metadata)
    return responseType.decode(res)
  }
}

const createUnaryMethods = (service, rpcImpl, middleware) => {
  let methods = {}
  Object.keys(service.methods).forEach(key => {
    const method = service.methods[key]
    if (!method.responseStream && !method.requestStream) {
      const lkey = lowerFirst(key)
      const genMethod = createUnaryMethod(method, rpcImpl.unaryCall)
      methods[lkey] = middleware(method, genMethod)
    }
  })
  return methods
}

const createStreamMethod = (method, streamCall) => {
  const requestType = method.resolvedRequestType
  // const responseType = method.resolvedResponseType
  return async (payload, metadata) => {
    const req = requestType.encode(payload).finish()
    return streamCall(method, req, metadata)
  }
}

const createStreamMethods = (service, rpcImpl, middleware) => {
  let methods = {}
  Object.keys(service.methods).forEach(key => {
    const method = service.methods[key]
    if (method.responseStream || method.requestStream) {
      const lkey = lowerFirst(key)
      const genMethod = createStreamMethod(method, rpcImpl.streamCall)
      methods[lkey] = middleware(method, genMethod)
    }
  })
  return methods
}

export const createService = (service, rpcImpl, middleware) => {
  if (typeof rpcImpl === 'undefined' && typeof middleware === 'undefined') {
    throw new Error('no rpc implem provided')
  }

  if (!middleware) {
    middleware = (method, call) => call
  }

  const rootService = service.resolveAll()
  const unaryMethods = createUnaryMethods(rootService, rpcImpl, middleware)
  const streamMethods = createStreamMethods(rootService, rpcImpl, middleware)
  return Object.assign(unaryMethods, streamMethods)
}
