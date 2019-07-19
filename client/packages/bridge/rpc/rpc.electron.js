import {
  serializeToBase64,
  deserializeFromBase64,
  isElectron,
  ErrorStreamNotImplemented,
  getServiceName,
} from './utils'

// by default throw an error if this is call by another platform
const wrongPlatform = new Error('cannot use rpc electron on another platform')
let isElectronReady = async () => {
  throw wrongPlatform
}

if (isElectron) {
  isElectronReady = new Promise(resolve =>
    document.addEventListener('astilectron-ready', resolve)
  )
}

// Electron rpc implem

const unary = async (method, request, metadata) => {
  const payload = {
    method: `/${getServiceName(method)}/${method.name}`,
    request: serializeToBase64(request),
  }

  const message = {
    name: 'invoke',
    payload: payload,
  }

  return isElectronReady
    .then(
      () =>
        new Promise((resolve, reject) => {
          window.astilectron.sendMessage(message, response => {
            if (!response) {
              reject(new Error('empty response'))
            }

            if (response.name === 'error') {
              reject(new Error(response.payload || 'unknow reason'))
            } else {
              resolve(response.payload)
            }
          })
        })
    )
    .then(res64 => deserializeFromBase64(res64))
}

const stream = async (method, request, metadata) => {
  throw ErrorStreamNotImplemented
}

export default {
  unaryCall: unary,
  streamCall: stream,
}
