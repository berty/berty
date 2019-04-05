import { serializeToBase64, deserializeFromBase64, isElectron } from './utils'

const wrongPlatform = new Error('cannot use rpc electron on another platform')
let isElectronReady = async () => {
  throw wrongPlatform
}

if (isElectron) {
  const ready = new Promise(resolve =>
    document.addEventListener('astilectron-ready', resolve)
  )
  isElectronReady = ready()
}

// Electron rpc implem
export default serviceName => (method, request, callback) => {
  const message = {
    name: `/${serviceName}/${method.name}`,
    payload: serializeToBase64(request),
  }

  isElectronReady
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
