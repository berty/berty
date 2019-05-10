import grpc from 'grpc-web'
import { getServiceName, streamToAsyncGeneratorFunction } from './utils'
import sleep from '@berty/common/helpers/sleep'
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

  const unary = client.unaryCall(url, request, metadata || {}, methodInfo)
  return unary
}

const stream = (client, hostname) => (method, request, metadata) => {
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

  return streamToAsyncGeneratorFunction(stream)
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
