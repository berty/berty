import { NativeModules } from 'react-native'

import { GoBridgeInterface } from './GoBridgeInterface'

export const GoBridge: GoBridgeInterface = NativeModules.GoBridge
