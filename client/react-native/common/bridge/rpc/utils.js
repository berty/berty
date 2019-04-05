import { Platform } from 'react-native'
import base64 from 'base64-js'

export const serializeToBase64 = req => base64.fromByteArray(req)
export const deserializeFromBase64 = b64 =>
  new Uint8Array(base64.toByteArray(b64))

export const isWeb = Platform.OS === 'web'
export const isElectron =
  isWeb &&
  window.navigator &&
  window.navigator.userAgent &&
  window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1
