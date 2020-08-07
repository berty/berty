/**
 * @format
 */

import 'react-native-gesture-handler'
import 'node-libs-react-native/globals'

import { Alert, AppRegistry } from 'react-native'
import App from './App'
import { BridgeConsole } from '@berty-tech/go-bridge'
import { name as appName } from './app.json'
import Instabug from 'instabug-reactnative'

Instabug.startWithToken('03c20b48603c753f8a152f589e71fbf8', [Instabug.invocationEvent.shake])

if (!__DEV__) {
	/* eslint-disable no-undef */
	console = {
		...BridgeConsole,
		error: (message: any, ...opts: any[]): void => {
			BridgeConsole.error(message, ...opts)
			Alert.alert('Error', `${message}`)
		},
	}

	//console.warn = () => Alert.alert('Warn')
	/* eslint-enable no-undef */
}

AppRegistry.registerComponent(appName, () => App)
