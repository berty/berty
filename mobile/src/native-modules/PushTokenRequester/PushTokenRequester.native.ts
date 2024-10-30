import { NativeModules } from 'react-native'

import { PushTokenRequesterInterface } from './PushTokenRequesterInterface'

export const PushTokenRequester: PushTokenRequesterInterface = NativeModules.PushTokenRequester
