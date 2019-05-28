import grpc from 'grpc-web'
import { getServiceName } from './utils'
import sleep from '@berty/common/helpers/sleep'
import Stream from 'stream'
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

const stream = (client, hostname) => async (method, request, metadata) => {
  const url = `${hostname}/${getServiceName(method)}/${method.name}`
  const responseType = method.resolvedResponseType
  const methodInfo = new MethodInfo(
    method.resolvedResponseType,
    lazyMethod,
    res => responseType.decode(res)
  )

  const stream = await client.serverStreaming(
    url,
    request,
    metadata || {},
    methodInfo
  )
  stream.pause = () => {}
  stream.resume = () => {}

  // grpc-web does not implement true rw stream
  const ptStream = new Stream.PassThrough({
    readableObjectMode: true,
    writableObjectMode: true,
  }).wrap(stream)

  // fix that onEnd is not called
  stream.on('status', status => {
    if (status.code === 0) {
      ptStream.end()
      stream.cancel()
    }
  })
  stream.on('error', () => {})

  return ptStream
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
