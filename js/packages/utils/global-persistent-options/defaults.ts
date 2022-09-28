import { NativeModules, Platform } from 'react-native'

import {
	GlobalPersistentOptions,
	GlobalPersistentOptionsKeys,
} from '@berty/utils/global-persistent-options/types'

let tyberAddress = ''
let debug = NativeModules.GoBridge?.getConstants().debug

if (debug) {
	tyberAddress = Platform.OS === 'android' ? '10.0.2.2:4242' : '127.0.0.1:4242'
}

export const defaultGlobalPersistentOptions = (): GlobalPersistentOptions => {
	return {
		[GlobalPersistentOptionsKeys.LogFilters]: {
			format: debug ? 'debug+:bty*,-*.grpc,error+:*' : '-*',
		},
		[GlobalPersistentOptionsKeys.TyberHost]: {
			address: tyberAddress,
		},
		[GlobalPersistentOptionsKeys.ForceMock]: false,
	}
}
