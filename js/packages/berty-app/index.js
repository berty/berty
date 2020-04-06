/**
 * @format
 */

import 'react-native-gesture-handler'
import 'node-libs-react-native/globals'

import { Alert, AppRegistry } from 'react-native'
if (!__DEV__) {
	/* eslint-disable no-undef */
	console.error = () => Alert.alert('Error')
	console.warn = () => Alert.alert('Warn')
	/* eslint-enable no-undef */
}

import App from './App'
import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => App)
