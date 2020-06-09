/**
 * @format
 */

import 'react-native-gesture-handler'
import 'node-libs-react-native/globals'

import { Alert, AppRegistry } from 'react-native'
import App from './App'
import { BridgeConsole } from '@berty-tech/go-bridge'
import { name as appName } from './app.json'

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
