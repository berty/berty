import { getNamespace } from './utils'

export const createService = (service, rpcImpl, middleware) => {
  if (typeof rpcImpl === 'undefined' && typeof middleware === 'undefined') {
    throw new Error('no rpc implem provided')
  }

  const namespace = getNamespace(service)
  const rpc = rpcImpl(namespace)

  if (middleware) {
    return service.create(middleware(service, rpc), false, false)
  }

  return service.create(rpc, false, false)
}
