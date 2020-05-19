import { NativeModules } from 'react-native'
import { GoBridgeInterface } from './types'

const GoBridge: GoBridgeInterface = NativeModules.GoBridge

export default GoBridge
