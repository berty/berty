import { NativeModules } from 'react-native'

import { GoBridgeInterface } from './GoBridgeInterface'

const GoBridge: GoBridgeInterface = NativeModules.GoBridge

export default GoBridge
