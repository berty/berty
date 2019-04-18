import { NativeModules } from 'react-native'
import { serializeToBase64, deserializeFromBase64 } from './utils'

// Android rpc implem

export default serviceName => (method, request, callback) => {
  const methodName = `/${serviceName}/${method.name}`
  const req64 = serializeToBase64(request)
  NativeModules.CoreModule.Invoke(methodName, req64)
    .then(res64 => {
      const res = deserializeFromBase64(res64)
      callback(null, res)
    })
    .catch(e => {
      callback(e, null)
    })
}
