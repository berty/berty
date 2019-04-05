import { Platform } from 'react-native'
import { isElectron } from './utils'

import rpcIOS from './rpc.ios'
import rpcAndroid from './rpc.android'
import rpcWeb from './rpc.web'
import rpcElectron from './rpc.electron'
import rpcNoop from './rpc.noop'

export const getRPCByPlatform = platform => {
  switch (platform) {
    case 'android':
      return rpcAndroid
    case 'ios':
      return rpcIOS
    case 'web':
      if (isElectron) {
        return rpcElectron
      }
      return rpcWeb
    default:
      return rpcNoop
  }
}

export default getRPCByPlatform(Platform.OS)
