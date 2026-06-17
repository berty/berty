import * as Application from 'expo-application'
import { NativeModules, Platform } from 'react-native'

import {
	GlobalPersistentOptions,
	GlobalPersistentOptionsKeys,
} from '@berty/utils/global-persistent-options/types'

let tyberAddress = ''
const debug = __DEV__

if (debug) {
	tyberAddress = Platform.OS === 'android' ? '10.0.2.2:4242' : '127.0.0.1:4242'
}

// Only production release builds keep the canonical app id; debug/staff/yolo carry a suffix.
const isProductionRelease =
	Application.applicationId === 'tech.berty.ios' ||
	Application.applicationId === 'tech.berty.android'

// zapfilter rules (<levels>+:<namespaces>): Go core is `bty*`, bridge `bertybridge*`, `-*.grpc` drops gRPC noise.
const logFilters = isProductionRelease
	? 'info+:bertybridge*,bty*,-*.grpc'
	: 'debug+:bertybridge*,bty*,-*.grpc'

export const defaultGlobalPersistentOptions = (): GlobalPersistentOptions => {
	return {
		[GlobalPersistentOptionsKeys.LogFilters]: {
			format: logFilters,
		},
		[GlobalPersistentOptionsKeys.TyberHost]: {
			address: tyberAddress,
		},
		[GlobalPersistentOptionsKeys.ForceMock]: false,
	}
}
