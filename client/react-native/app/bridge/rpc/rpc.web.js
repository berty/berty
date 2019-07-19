import { ErrorStreamNotImplemented, getServiceName } from './utils'

// WEB rpc implem

export const DefautlWebURL = 'http://localhost:8989/daemon'

const unary = uri => async (method, request, metadata) => {
  const methodName = `/${getServiceName(method)}/${method.name}`
  return fetch(uri, {
    headers: {
      'X-Method': methodName,
    },
    method: 'POST',
    body: request,
  })
    .then(res => {
      if (res.ok) {
        return res.arrayBuffer()
      }

      return res
        .text()
        .catch(() => {
          throw new Error(`[${res.status}] ${methodName}: ${res.statusText}`)
        })
        .then(err => {
          throw new Error(`${methodName}: ${err}`)
        })
    })
    .then(buff => new Uint8Array(buff))
}

const stream = uri => async (method, request, metadata) => {
  throw ErrorStreamNotImplemented
}

export const rpcWebWithUrl = uri => ({
  unaryCall: unary(uri),
  streamCall: stream(uri),
})

export default rpcWebWithUrl(DefautlWebURL)
