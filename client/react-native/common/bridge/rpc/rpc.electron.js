import { serializeToBase64, deserializeFromBase64, isElectron } from './utils'

// by default throw an error if this is call by another platform
const wrongPlatform = new Error('cannot use rpc electron on another platform')
let isElectronReady = async () => {
  throw wrongPlatform
}

if (isElectron) {
  const ready = new Promise(resolve =>
    document.addEventListener('astilectron-ready', resolve)
  )
  isElectronReady = async () => ready
}

// Electron rpc implem
export default serviceName => (method, request, callback) => {
  const payload = {
    method: `/${serviceName}/${method.name}`,
    request: serializeToBase64(request),
  }

  const message = {
    name: 'invoke',
    payload: payload,
  }

  isElectronReady()
    .then(
      () =>
        new Promise((resolve, reject) => {
          window.astilectron.sendMessage(message, response => {

            if (response.name === 'error') {
              reject(response.payload)
            } else {
              resolve(response.payload)
            }
          })
        })
    )
    .then(res64 => {
      const res = deserializeFromBase64(res64)
      callback(null, res)
    })
    .catch(e => {
      callback(e, null)
    })
}
