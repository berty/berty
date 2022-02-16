import { Platform } from 'react-native'

import {
	GlobalPersistentOptions,
	GlobalPersistentOptionsKeys,
} from '@berty/utils/global-persistent-options/types'

let format = '-*'
if (__DEV__) {
	format = 'info+:bty*,-*.grpc,error+:*'
}

let tyberAddress = ''
if (__DEV__) {
	tyberAddress = Platform.OS === 'android' ? '10.0.2.2:4242' : '127.0.0.1:4242'
}

export const defaultGlobalPersistentOptions = (): GlobalPersistentOptions => {
	return {
		[GlobalPersistentOptionsKeys.LogFilters]: {
			format: format,
		},
		[GlobalPersistentOptionsKeys.TyberHost]: {
			address: tyberAddress,
		},
	}
}
