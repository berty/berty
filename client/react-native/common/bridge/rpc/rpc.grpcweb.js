import grpc from 'grpc-web'
import { getServiceName } from './utils'

export const DefautlHostname = 'http://localhost:8989'

const { MethodInfo } = grpc.AbstractClientBase
const lazyMethod = payload => payload
const unary = (client, hostname) => async (method, request, metadata) => {
  const url = `${hostname}/${getServiceName(method)}/${method.name}`
  // const url = `${hostname}`
  const methodInfo = new MethodInfo(
    method.resolvedResponseType,
    lazyMethod,
    lazyMethod
  )

  return client.unaryCall(url, request, metadata || {}, methodInfo)
}

const stream = (client, hostname) => async (method, request, metadata) => {
  const url = `${hostname}/${getServiceName(method)}/${method.name}`
  const responseType = method.resolvedResponseType
  const methodInfo = new MethodInfo(
    method.resolvedResponseType,
    lazyMethod,
    res => responseType.decode(res)
  )

  const stream = client.serverStreaming(
    url,
    request,
    metadata || {},
    methodInfo
  )
  return {
    // grpc web doesn't support client side streaming yet
    emit: payload => {
      throw new Error('not implemented')
    },
    onData: callback => stream.on('data', callback),
    onEnd: callback => stream.on('end', callback),
    onStatus: callback => stream.on('status', callback),
  }
}

export const rpcWithHostname = hostname => {
  const client = new grpc.GrpcWebClientBase()
  return {
    onStatus: callback => client.on('status', callback),
    unaryCall: unary(client, hostname),
    streamCall: stream(client, hostname),
  }
}

export default rpcWithHostname(DefautlHostname)
