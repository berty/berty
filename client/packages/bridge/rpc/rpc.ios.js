import { NativeModules } from 'react-native'
import {
  serializeToBase64,
  deserializeFromBase64,
  ErrorStreamNotImplemented,
  getServiceName,
} from './utils'

// Android rpc implem

const unary = async (method, request, metadata) => {
  const methodName = `/${getServiceName(method)}/${method.name}`
  const req64 = serializeToBase64(request)
  return NativeModules.CoreModule.invoke(methodName, req64).then(res64 =>
    deserializeFromBase64(res64)
  )
}

const stream = async (method, request, metadata) => {
  throw ErrorStreamNotImplemented
}

export default {
  unaryCall: unary,
  streamCall: stream,
}
