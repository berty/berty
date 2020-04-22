/**
 * @format
 */

import 'react-native-gesture-handler'
import 'node-libs-react-native/globals'

import { Alert, AppRegistry } from 'react-native'
import App from './App'
import { name as appName } from './app.json'

if (!__DEV__) {
	/* eslint-disable no-undef */
	console.error = (error) => Alert.alert('Error', `${error}`)
	//console.warn = () => Alert.alert('Warn')
	/* eslint-enable no-undef */
}

AppRegistry.registerComponent(appName, () => App)
