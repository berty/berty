import { Platform } from 'react-native'
import base64 from 'base64-js'
import sleep from '@berty/common/helpers/sleep'

// methods
export const serializeToBase64 = req => base64.fromByteArray(req)
export const deserializeFromBase64 = b64 =>
  new Uint8Array(base64.toByteArray(b64))
export const getServiceName = method => {
  const fullName = method.parent.fullName
  if (fullName.startsWith('.')) {
    return fullName.substring(1)
  }
  return fullName
}

// CONST
export const isWeb = Platform.OS === 'web'
export const isElectron =
  isWeb &&
  window.navigator &&
  window.navigator.userAgent &&
  window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1

// Error
export const ErrorStreamNotImplemented = new Error(
  'stream service not implemented'
)
export const ErrorUnaryNotImplemented = new Error(
  'unary service not implemented'
)

export async function * streamToAsyncGeneratorFunction (stream) {
  const queue = []
  stream.on('data', data => queue.push({ value: data, done: false }))
  stream.on('end', () => queue.push({ value: undefined, done: true }))
  stream.on('status', status => queue.push(status))

  let sleepTime = 10
  while (true) {
    const { code, done, value } = queue[0] || { done: false, value: null }
    queue.shift()
    if (done || code === 0) {
      return
    } else if (value) {
      yield value
      sleepTime = 10
    } else {
      await sleep(sleepTime)
      sleepTime = sleepTime >= 1000 ? 1000 : sleepTime * 2
    }
  }
}
