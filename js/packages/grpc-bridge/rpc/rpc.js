import { Platform } from 'react-native'

import rpcBridge from './rpc.bridge'
import rpcNoop from './rpc.noop'

export const getRPCByPlatform = platform => {
  switch (platform) {
  case 'ios', 'android':
    return rpcBridge
  default:
    return rpcNoop
  }
}

export default getRPCByPlatform(Platform.OS)
