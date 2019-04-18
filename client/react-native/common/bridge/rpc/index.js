export { default as nativeIOS } from './rpc.ios'
export { default as nativeAndroid } from './rpc.android'
export { default as electron } from './rpc.electron'
export { default as noop } from './rpc.noop'
export { default as web } from './rpc.web'
export { rpcWebWithUrl as withUrl } from './rpc.web'

export { getRPCByPlatform as byPlatform } from './rpc.js'
export { default as defaultPlatform } from './rpc.js'
